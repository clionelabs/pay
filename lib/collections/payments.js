/**
 * @property {String} paymentRequestId
 * @property {Date} createdAt
 * @property {Date} authorizedAt
 * @property {Date} paidAt
 * @property {String} request
 * @property {String} response
*/
Payments = new Meteor.Collection('payments', {
  transform: function(doc) {
    return new Payment(doc);
  }
});

Payments.create = function(paymentRequestId) {
  var doc = {
    paymentRequestId: paymentRequestId,
    createdAt: new Date(),
    authorizedAt: null,
    paidAt: null,
    request: null,
    response: null
  };
  var id = Payments.insert(doc);
  return id;
}

Payment = function(doc) {
  _.extend(this, doc);
}

Payment.prototype.paymentRequest = function() {
  return PaymentRequests.findOne(this.paymentRequestId);
}

Payment.prototype.sendAuthorization = function() {
  var authorizationURL = this.authorizationURL();
  var paymentRequest = this.paymentRequest();
  console.log("[Payment] sendAuthorization: ", authorizationURL, paymentRequest);
  // TODO - send authorization email here
}

Payment.prototype.authorizationURL = function() {
  return Router.url("paymentAuthorization", {paymentId: this._id});
}
