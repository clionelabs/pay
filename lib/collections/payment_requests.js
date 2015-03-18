/**
 * @property {Object} bill
 * @property {String} customerId
 * @property {String} state
 * @property {Object[]} events
 * @property {Date} createdAt
 */
PaymentRequests = new Meteor.Collection('payment_requests', {
  transform: function(doc) {
    return new PaymentRequest(doc);
  }
});

PaymentRequests.createWithRaw = function(raw) {
  var insertedId = PaymentRequests.insert({
    state: 'created',
    raw : raw,
    bill : { email : raw.sender }
  });
  PaymentRequests.findOne({ _id : insertedId }).initialize();
  return insertedId;
}

PaymentRequests.createWithBill = function(data) {
  var customer = Customers.createIfNotExisted(data.bill.email, data.bill.recipientFirstName, data.bill.recipientLastName);

  var doc = _.extend(data, {
    customerId: customer._id,
    events: [],
    state: 'created',
    createdAt: new Date()
  });


  var id = PaymentRequests.insert(doc);
  var paymentRequest = PaymentRequests.findOne(id);
  paymentRequest.initialize(); // transit state from created to reviewing, and trigger onreviewing callback
  return id;
};

/**
 * States: created, reviewing, authorizing, processing, rejected, resolved
 *
 */
PaymentRequest = function(doc) {
  _.extend(this, doc);
  _.extend(this, StateMachine.create({
    initial: this.state,
    error: function(eventName, from, to, args, errorCode, errorMessage) {
      console.log('[PaymentRequests] error: ', eventName, from, to, args, errorCode, errorMessage);
    },
    events: [
      {name: PaymentRequest.EVENTS.INITIALIZE, from: 'created',     to: 'reviewing'},
      {name: PaymentRequest.EVENTS.REJECT,     from: 'reviewing',   to: 'rejected'},
      {name: PaymentRequest.EVENTS.ACCEPT,     from: 'reviewing',   to: 'authorizing'},
      {name: PaymentRequest.EVENTS.AUTHORIZE,  from: 'authorizing', to: 'processing'},
      {name: PaymentRequest.EVENTS.COMPLETE,   from: 'processing',  to: 'resolved'}
    ],
    callbacks: {
      onreviewing: function(event, from, to) {
        var paymentRequest = this;
        Email.Review.send(paymentRequest.bill.email, paymentRequest.bill);
      },
      onrejected: function(event, from, to) {
        var paymentRequest = this;
        Email.Reject.send(paymentRequest.bill.email, paymentRequest.bill);
      },
      onauthorizing: function(event, from, to) {
        var paymentRequest = this;
        Email.Authorization.send(paymentRequest.bill.email, paymentRequest.bill);
      },
      onresolved: function(event, from, to) {
        var paymentRequest = this;
        Email.Paid.send(paymentRequest.bill.email, paymentRequest.bill);
      },
      onenterstate: function(event, from, to) {
        var paymentRequest = this;
        PaymentRequests.update({_id: paymentRequest._id}, {$set: {state: to}});
      }
    }
  }));
};
PaymentRequest.EVENTS = {
  'INITIALIZE' : 'initialize',
  'REJECT': 'reject',
  'ACCEPT': 'accept',
  'AUTHORIZE': 'authorize',
  'COMPLETE': 'complete'
};

PaymentRequest.prototype.isAuthorized = function() {
  return this.state === 'resolved' || this.state === 'processing';
}

PaymentRequest.prototype.getCustomer = function() {
  return Customers.findOne(this.customerId);
}

PaymentRequest.prototype.authorizationURL = function() {
  return Router.url("paymentRequestAuthorization", {_id: this._id});
}

PaymentRequest.prototype.serviceFee = function() {
  return this.bill.amount * 0.05;
}

PaymentRequest.prototype.totalAmount = function() {
  return this.serviceFee() + this.bill.amount;
}
