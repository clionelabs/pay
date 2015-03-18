Meteor.methods({
  // Temporary method to test state transitions/ events triggers
  testPaymentRequestEvents: function(paymentRequestId, event) {
    try {
      var paymentRequest = PaymentRequests.findOne(paymentRequestId);
      console.log("[methods] testPaymentRequestEvents: ", paymentRequestId, event);
      if (event === 'initialize') {
        paymentRequest.initialize();
      } else if (event === 'reject') {
        paymentRequest.reject();
      } else if (event === 'accept') {
        paymentRequest.accept();
      } else if (event === 'authorize') {
        paymentRequest.authorize();
      } else if (event === 'complete') {
        paymentRequest.complete();
      }
    } catch (err) {
      console.log("[methods] testPaymentRequestEvents error: ", err.stack);
    }
  },

  getPaymentRequestAuthorizationInfo: function(paymentRequestId) {
    var paymentRequest = PaymentRequests.findOne(paymentRequestId);
    var customer = paymentRequest.getCustomer();
    var isReturning = customer.isPaymentMethodAvailable();

    var data;
    if (isReturning) {
      var paymentMethod = customer.getPaymentMethod();
      data = {
        isReturning: true,
        paymentMethod: paymentMethod
      } 
    } else {
      data = {
        isReturning: false
      }
    }
    return data;
  },

  createPaymentRequest: function(data) {
    var paymentRequestId = PaymentRequests.createWithBill(data);
    return paymentRequestId;
  },

  getAuthorizationToken: function() {
    var clientToken = Customers.createAuthorizationToken(); 
    return clientToken;
  },

  authorizePaymentRequestWithNonce: function(data) {
    var paymentRequest = PaymentRequests.findOne(data.paymentRequestId);
    var customer = paymentRequest.getCustomer();

    var result = customer.createVault(data.nonce);
    if (!result) return false;

    var result2 = customer.charge(paymentRequest);
    if (!result2) return false;

    paymentRequest.authorize();

    return true;
  },

  authorizePaymentRequest: function(data) {
    var paymentRequest = PaymentRequests.findOne(data.paymentRequestId);
    var customer = paymentRequest.getCustomer();

    var result = customer.charge(paymentRequest);
    if (!result) return false;

    paymentRequest.authorize();

    return true;
  }
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
