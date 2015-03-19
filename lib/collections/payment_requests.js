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
  return insertedId;
};



/**
 * States: created, reviewing, authorizing, processing, rejected, resolved
 *
 */
PaymentRequest = function(doc) {


  var stateMachine = StateMachine.create({
    initial: doc.state,
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
  });

  _.extend(this, stateMachine, doc);

  console.log(this.current);
  if (this.can('initialize')) { console.log("ssss");this.initialize(); } //created-->reviewing and trigger onreviewing email
};
PaymentRequest.EVENTS = {
  'INITIALIZE' : 'initialize',
  'REJECT': 'reject',
  'ACCEPT': 'accept',
  'AUTHORIZE': 'authorize',
  'COMPLETE': 'complete'
};

PaymentRequest.prototype.getCustomer = function() {
  return Customers.findOne(this.customerId);
}

PaymentRequest.prototype.authorizationURL = function() {
  if (this.isReturningCustomer()) {
    return Router.url("paymentRequestAuthorizationReturn", {_id: this._id});
  } else {
    return Router.url("paymentRequestAuthorizationNew", {_id: this._id});
  }
}

PaymentRequest.prototype.serviceFee = function() {
  return this.bill.amount * 0.05;
}

PaymentRequest.prototype.totalAmount = function() {
  return this.serviceFee() + this.bill.amount;
}
