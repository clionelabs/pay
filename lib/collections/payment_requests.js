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
        if (!Meteor.isServer) { return; }
        var bill = this.bill;
        Email.Review.send(bill.email, bill);
      },
      onafterreject: function(event, from, to) {
        if (!Meteor.isServer) { return; }
        var bill = this.bill;
        Email.Rejection.send(bill.email, bill);
      },
      onafterauthorize: function(event, from, to) {
        if (!Meteor.isServer) { return; }
        var bill = this.bill;
        Email.Authorization.send(bill.email, bill);
      },
      onaftercomplete: function(event, from, to) {
        if (!Meteor.isServer) { return; }
        var bill = this.bill;
        Email.Paid.send(bill.email, bill);
      },
      onenterstate: function(event, from, to) {
        console.log(event);
        if (!Meteor.isServer) { return; }
        var paymentRequest = this;
        PaymentRequests.update({_id: paymentRequest._id}, {$set: {state: to}});
      }
    }
  });

  _.extend(this, stateMachine, doc);

  if (this.can('initialize')) { this.initialize(); } //created-->reviewing and trigger onreviewing email
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
