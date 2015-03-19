Template.paymentRequestReturnAuthorization.events({
  'click button.authorize': function() {
    var data = {paymentRequestId: this._id};
    Meteor.call('authorizePaymentRequest', data, function(err, result) {
      console.log("authorizePaymentRequest result: ", result);
      redirectAuthorizationFinished(result, data.paymentRequestId);
    })
  }
});

Template.paymentRequestReturnAuthorization.helpers({
  paymentMethod: function() {
    var authorizationInfo = Session.get('authorizationInfo');
    var paymentMethod = authorizationInfo.paymentMethod;
    return paymentMethod;
  },

  paymentMethodTemplate: function() {
    var authorizationInfo = Session.get('authorizationInfo');
    var paymentMethod = authorizationInfo.paymentMethod;

    // There is no specific field indicating that the method is credit card/ paypal/ apple pay card
    if (paymentMethod.cardType && paymentMethod.last4) {
      return 'paymentMethodCreditCard';
    } else {
      return 'paymentMethodPaypal';
    }
  } 
});

Template.paymentRequestNewAuthorization.rendered = function() {
  Meteor.call('getAuthorizationToken', function(err, clientToken) {
    if (err) {
      console.log("error retrieving braintree client token", err);
      return;
    }
    initializeBraintree(clientToken);
  });
};

Template.paymentRequestReturnAuthorization.helpers({
  maskedCardLastFourDigits: function() {
    // var customer = Customers.findOne(this.customerId);
    // return customer.maskedCardLastFourDigits;
    return "1234";
  }
});

var initializeBraintree = function(clientToken) {
  braintree.setup(clientToken, 'dropin', {
    container: 'dropin',
    paymentMethodNonceReceived: function(event, nonce) {
      var paymentRequestId = $("input[name=paymentRequestId]").val();

      var data = {
        paymentRequestId: paymentRequestId,
        nonce: nonce
      }
      Meteor.call('authorizePaymentRequestWithNonce', data, function(err, result) {
        console.log("authorizePaymentRequestWithNonce result: ", result);
        redirectAuthorizationFinished(result, data.paymentRequestId);
      });
    }
  });
};

var redirectAuthorizationFinished = function(success, paymentRequestId) {
  if (success) {
    Router.go("paymentRequestAuthorizationSuccess", {_id: paymentRequestId}); 
  } else {
    Router.go("paymentRequestAuthorizationFail", {_id: paymentRequestId}); 
  }
}
