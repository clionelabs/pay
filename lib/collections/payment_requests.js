/**
 * @property {Object} bill
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
    createdAt: new Date()
  } 
  var id = PaymentRequests.insert(doc);
  var paymentRequest = PaymentRequests.findOne(id);
  paymentRequest.logReviewed();
  return id;
}

PaymentRequest = function(doc) {
  _.extend(this, doc);
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

PaymentRequest.prototype.state = function() {
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
