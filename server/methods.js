Meteor.methods({
  createPaymentRequest: function(data) {
    var paymentRequestId = PaymentRequests.createWithBill(data);
    return paymentRequestId;
  },

  sendPaymentAuthorization: function(paymentRequestId) {
    var paymentRequest = PaymentRequests.findOne(paymentRequestId);
    paymentRequest.sendPaymentAuthorization();
  },

  getPaymentAuthorizationToken: function() {
    var clientToken = Payments.createAuthorizationToken(); 
    return clientToken;
  }, 

  createPaymentTransaction: function(data) {
    var payment = Payments.findOne(data.paymentId);
    var success = payment.sale(data.nonce);
    return success;
  },

  setPaymentRequestProcessed: function(paymentRequestId) {
    var paymentRequest = PaymentRequests.findOne(paymentRequestId);
    paymentRequest.setProcessed();
  },
});

Meteor.startup(function() {
  var config = {
    environment: Braintree.Environment.Sandbox,
    publicKey: Meteor.settings.braintree.publicKey,
    privateKey: Meteor.settings.braintree.privateKey,
    merchantId: Meteor.settings.braintree.merchantId
  };
  BraintreeHelper.getInstance().connect(config);
});
