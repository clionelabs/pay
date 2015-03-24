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

  sendAuthEmail : function(paymentRequestId) {
    var paymentRequest = PaymentRequests.findOne(paymentRequestId);
    Email.Authorization.send(paymentRequest.bill.email, paymentRequest);
  },
  acceptPaymentRequest: function(paymentRequestId) {
    var paymentRequest = PaymentRequests.findOne(paymentRequestId);
    paymentRequest.accept();
  },

  rejectPaymentRequest: function(paymentRequestId) {
    var paymentRequest = PaymentRequests.findOne(paymentRequestId);
    paymentRequest.reject();
  },

  completePaymentRequest: function(paymentRequestId) {
    var paymentRequest = PaymentRequests.findOne(paymentRequestId);
    paymentRequest.complete();
  },

  getPaymentRequestAuthorizationInfo: function(paymentRequestId) {
    var paymentRequestDoc = PaymentRequests.findOne(paymentRequestId, {transform: null});
    var paymentRequest = new PaymentRequest(paymentRequestDoc);
    var isAuthorized = paymentRequest.isAuthorized();

    // Scenario 1: payment request has already been authorized
    if (isAuthorized) {
      var data = {
        isAuthorized: true,
        paymentRequestDoc: paymentRequestDoc
      }
      return data;
    }

    var customer = paymentRequest.getCustomer();
    var isReturning = customer.isPaymentMethodAvailable(); //if the user is returning, there must be a payment method available

    // Scenario 2: payment request has NOT been authorized, and and customer is a returning one
    if (isReturning) {
      var paymentMethod = customer.getPaymentMethod();
      var data = {
        isAuthorized: false,
        paymentRequestDoc: paymentRequestDoc,
        isReturning: true,
        paymentMethod: paymentMethod
      } 
      return data;
    } 
    
    // Scenario 3: payment request has been authorized, and the customer is a new one
    if (!isReturning) {
      var clientToken = Customers.createAuthorizationToken();
      var data = {
        isAuthorized: false,
        paymentRequestDoc: paymentRequestDoc,
        isReturning: false,
        clientToken: clientToken
      }
      return data;
    }
  },

  createPaymentRequest: function(data) {
    PaymentRequests.createWithForm(data);
  },

  editPaymentRequest: function(data) {
    PaymentRequests.editWithForm(data);
  },

  lookupCustomerEmail: function(email) {
    var customer = Customers.findOne({email: email});
    if (customer) {
      return {
        found: true,
        firstName: customer.firstName,
        lastName: customer.lastName
      }
    } else {
      return {
        found: false
      }
    }
  },

  verifyAuthorizationPasscode: function(paymentRequestId, passcode) {
    var paymentRequest = PaymentRequests.findOne(paymentRequestId);
    return paymentRequest.passcode === passcode;
  },

  authorizePaymentRequestWithNonce: function(data) {
    var paymentRequest = PaymentRequests.findOne(data.paymentRequestId);
    var customer = paymentRequest.getCustomer();

    var result = customer.createVault(data.nonce);
    if (!result) {
      throw Meteor.Error("Authorization Error", "Failed to create payment method");
    }

    var result2 = customer.charge(paymentRequest);
    if (!result) {
      throw Meteor.Error("Authorization Error", "Failed to charge");
    }

    try {
      paymentRequest.authorize();
    } catch (error) {
      throw Meteor.Error("Authorization Error", "Failed to authorize");
    }

    return true;
  },

  authorizePaymentRequest: function(data) {
    var paymentRequest = PaymentRequests.findOne(data.paymentRequestId);
    if (paymentRequest.passcode !== data.passcode) {
      return false;
    }
    var customer = paymentRequest.getCustomer();

    var result = customer.charge(paymentRequest);
    if (!result) {
      throw Meteor.Error("Authorization Error", "Failed to charge");
    }

    try {
      paymentRequest.authorize();
    } catch (error) {
      throw Meteor.Error("Authorization Error", "Failed to authorize");
    }

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
