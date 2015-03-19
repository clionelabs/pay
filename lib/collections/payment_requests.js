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

  _.extend(this, doc);

  if (Meteor.isServer) {
    var stateMachine = StateMachine.create({
      initial: doc.state,
      error: function(eventName, from, to, args, errorCode, errorMessage, stack) {
        console.log('[PaymentRequests] error: ', eventName, from, to, args, errorCode, errorMessage);
        console.log(stack);
      },
      events: [
        {name: PaymentRequest.EVENTS.INITIALIZE, from: 'created',     to: 'reviewing'},
        {name: PaymentRequest.EVENTS.REJECT,     from: 'reviewing',   to: 'rejected'},
        {name: PaymentRequest.EVENTS.ACCEPT,     from: 'reviewing',   to: 'authorizing'},
        {name: PaymentRequest.EVENTS.AUTHORIZE,  from: 'authorizing', to: 'processing'},
        {name: PaymentRequest.EVENTS.COMPLETE,   from: 'processing',  to: 'resolved'}
      ],
      callbacks: {
        onafterinitialize: function(event, from, to) {
          Email.Review.send(this.bill.email);
        },
        onafterreject: function(event, from, to) {
          Email.Rejection.send(this.bill.email);
        },
        onafteraccept: function(event, from, to) {
          var paymentRequest = this;
          Email.Authorization.send(paymentRequest.bill.email, paymentRequest);
        },
        onaftercomplete: function(event, from, to) {
          Email.Paid.send(this.bill.email);
        },
        onenterstate: function(event, from, to) {
          var paymentRequest = this;
          PaymentRequests.update({_id: paymentRequest._id}, {$set: {state: to}});
        }
      }
    });

    _.extend(stateMachine, this);
    if (this.can('initialize')) {
      this.initialize();
    } //created-->reviewing and trigger onreviewing email

  }
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
};

PaymentRequest.prototype.serviceFee = function() {
  return this.bill.amount * 0.05;
};

PaymentRequest.prototype.totalAmount = function() {
  return this.serviceFee() + this.bill.amount;
};

PaymentRequest.prototype.title = function() {
  return this.bill ? this.bill.title : "";
};

PaymentRequest.prototype.recipient = function() {
  return this.bill && this.bill.recipient ? this.bill.recipient.firstName + " " + this.bill.recipient.lastName : "";
};

PaymentRequest.prototype.printAmount = function() {
  return this.bill ? this.bill.currency + " " + this.bill.amount : "";
};

PaymentRequest.prototype.printServiceFee = function() {
  return this.bill ? this.bill.currency + " " + this.serviceFee() : "";
};

PaymentRequest.prototype.printTotalAmount = function() {
  return this.bill ? this.bill.currency + " " + this.totalAmount() : "";
};

PaymentRequest.prototype.deadline = function() {
  return this.bill ? this.bill.deadline : "";
}
