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

PaymentRequests.createWithBill = function(bill) {
  var customer = Customers.createIfNotExisted(bill.email, bill.recipientFirstName, bill.recipientLastName);

  var doc = {
    bill: bill,
    customerId: customer._id,
    events: [],
    state: 'created',
    createdAt: new Date()
  }

  var id = PaymentRequests.insert(doc);
  var paymentRequest = PaymentRequests.findOne(id);
  paymentRequest.initialize(); // transit state from created to reviewing, and trigger onreviewing callback
  return id;
}

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
      {name: 'initialize', from: 'created', to: 'reviewing'},
      {name: 'reject', from: 'reviewing', to: 'rejected'},
      {name: 'accept', from: 'reviewing', to: 'authorizing'},
      {name: 'authorize', from: 'authorizing', to: 'processing'},
      {name: 'complete', from: 'processing', to: 'resolved'}
    ],
    callbacks: {
      onreviewing: function(event, from, to) {
        var paymentRequest = this;
        console.log('[PaymentRequest] onreviewing: ', event, from, to, paymentRequest._id);
        //TODO send currently reviewing emaill
      },
      onrejected: function(event, from, to) {
        var paymentRequest = this;
        console.log('[PaymentRequest] onrejected: ', event, from, to, paymentRequest._id);
        //TODO send rejection email
      },
      onauthorizing: function(event, from, to) {
        var paymentRequest = this;
        console.log('[PaymentRequest] onauthorizing: ', event, from, to, paymentRequest._id);
        //TODO send authorizing email (first time customer or returning customer)
      },
      onprocessing: function(event, from, to) {
        var paymentRequest = this;
        console.log('[PaymentRequest] onprocessing: ', event, from, to, paymentRequest._id);
        //TODO send authorized email, mentioning that we are currently processing the request
      },
      onresolved: function(event, from, to) {
        var paymentRequest = this;
        console.log('[PaymentRequest] onresolved: ', event, from, to, paymentRequest._id);
        //TODO send case resolved email
      },
      onenterstate: function(event, from, to) {
        var paymentRequest = this;
        PaymentRequests.update({_id: paymentRequest._id}, {$set: {state: to}});
      }
    }
  }));
}

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
