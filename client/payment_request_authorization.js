Template.paymentRequestReturnAuthorization.events({
  'click button.authorize': function() {
    var data = {paymentRequestId: this._id};
    Meteor.call('authorizePaymentRequest', data, function(err, result) {
      console.log("authorizePaymentRequest result: ", result);
      redirectAuthorizationFinished(result, data.paymentRequestId);
    })
  }
});

Template.paymentMethodPaypal.helpers({
  maskedEmail: function(email) {
    var index = email.lastIndexOf('@');
    var id = email.slice(0, index);
    var domain = email.slice(index + 1, email.length);
    var domainFirstPart = domain.slice(0, domain.indexOf('.'));
    var domainLastPart = domain.slice(domain.indexOf('.') + 1, domain.length);
    var maskedDomainFirstPart = domainFirstPart[0] + domainFirstPart.replace(/./g, '*').slice(1, domainFirstPart.length);
    var maskedId = id[0] + id.replace(/./g, '*').slice(1, id.length);
    var masked = maskedId + "@" + maskedDomainFirstPart + "." + domainLastPart; 
    return masked;
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
  var authorizationInfo = Session.get('authorizationInfo');
  var clientToken = authorizationInfo.clientToken;
  initializeBraintree(clientToken);
};

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
