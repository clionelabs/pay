/**
 * @property {Object} bill
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
  var doc = {
    bill: bill,
    events: [],
    state: 'created',
    createdAt: new Date()
  } 
  var id = PaymentRequests.insert(doc);
  var paymentRequest = PaymentRequests.findOne(id);
  paymentRequest.logReviewed();
  return id;
}

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

PaymentRequest.Events = {
  REVIEWED: 'Reviewed',
  SENT_AUTH: 'SentAuth',
  AUTHORIZED: 'Authorized',
  PROCESSED: 'Processed'
}

PaymentRequest.States = {
  REVIEWED: 'Reviewed', // created, but auth email not yet sent
  AUTHORIZING: 'Authorizing', // auth email sent, but customer not yet responded
  AUTHORIZED: 'Authorized', // auth email sent, and customer authorized
  PROCESSED: 'Processed' // the request is fulfilled
}

PaymentRequest.prototype.getState = function() {
  var flags = {};
  _.each(this.events, function(event) {
    flags[event.type] = true;
  });

  if (!flags[PaymentRequest.Events.REVIEWED]) {
    throw 'Invalid state';  // not supposed to happen 
  } else if (!flags[PaymentRequest.Events.SENT_AUTH]) {
    return PaymentRequest.States.REVIEWED;
  } else if (!flags[PaymentRequest.Events.AUTHORIZED]) {
    return PaymentRequest.States.AUTHORIZING;
  } else if (!flags[PaymentRequest.Events.PROCESSED]) {
    return PaymentRequest.States.AUTHORIZED;
  } else {
    return PaymentRequest.States.PROCESSED;
  }
}

PaymentRequest.prototype.logReviewed = function() {
  this.log({type: PaymentRequest.Events.REVIEWED});
}

PaymentRequest.prototype.logSentAuthorization = function(payment) {
  this.log({type: PaymentRequest.Events.SENT_AUTH, paymentId: payment._id});
}

PaymentRequest.prototype.logAuthorized = function(payment) {
  this.log({type: PaymentRequest.Events.AUTHORIZED, paymentId: payment._id});
}

PaymentRequest.prototype.logProcessed = function() {
  this.log({type: PaymentRequest.Events.PROCESSED});
}

PaymentRequest.prototype.log = function(doc) {
  _.extend(doc, {createdAt: new Date()});
  PaymentRequests.update({_id: this._id}, {$push: {events: doc}});
}

PaymentRequest.prototype.sendPaymentAuthorization = function() {
  var paymentId = Payments.create(this._id);
  var payment = Payments.findOne(paymentId);
  payment.sendAuthorization();
  this.logSentAuthorization(payment);
}

PaymentRequest.prototype.setProcessed = function() {
  this.logProcessed();
}
