/**
 * @property {String} paymentRequestId
 * @property {Date} createdAt
 * @property {Date} authorizedAt
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
    request: null,
    response: null
  };
  var id = Payments.insert(doc);
  return id;
}

Payments.createAuthorizationToken = function() {
  var response = BraintreeHelper.getInstance().clientTokenGenerate({});
  return response.clientToken;
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

Payment.prototype.isAuthorized = function() {
  return this.authorizedAt !== null;
}

Payment.prototype.sale = function(nonce) {
  var paymentRequest = this.paymentRequest();
  var options = {
    orderId: paymentRequest._id,
    amount: paymentRequest.bill.amount,
    paymentMethodNonce: nonce,
    customer: {
      email: paymentRequest.bill.email
    },
    options: {
      submitForSettlement: true
    }
  }
  var response = BraintreeHelper.getInstance().transactionSale(options);
  Payments.update({_id: this._id}, {request: options, response: response});

  if (response.success) {
    Payments.update({_id: this._id}, {authorizedAt: new Date()});
    paymentRequest.logAuthorized(this);
  }

  return response.success;
}
