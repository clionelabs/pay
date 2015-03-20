Template.paymentRequestAuthorization.helpers({
  contentTemplate: function() {
    var authorizationInfo = this;
    if (authorizationInfo.isAuthorized) {
      return 'paymentRequestAuthorized';
    } else if (authorizationInfo.isReturning) {
      return 'paymentRequestReturnAuthorization';
    } else {
      return 'paymentRequestNewAuthorization';
    }
  },
});

Template.paymentRequestNewAuthorization.helpers({
  paymentRequest: function() {
    return new PaymentRequest(this.paymentRequestDoc);
  }
});

Template.paymentRequestNewAuthorization.rendered = function() {
  var clientToken = this.data.clientToken;
  var paymentRequestId = this.data.paymentRequestDoc._id;
  var requestSent = false;
  braintree.setup(clientToken, 'dropin', {
    container: 'dropin',
    paymentMethodNonceReceived: function(event, nonce) {
      var data = {
        paymentRequestId: paymentRequestId,
        nonce: nonce
      }

      // The submit button might have been clicked multiple times by customers
      // But there is no easy way to disable the submit button using braintree drop-in UI
      // So we simply allow sending request to our server once 
      if (requestSent) return; // There is no way to  
      resquestSent = true;
      Meteor.call('authorizePaymentRequestWithNonce', data, function(err, result) {
        handleAuthorizationCallback(result, data.paymentRequestId);
      });
    }
  });
};

Template.paymentRequestReturnAuthorization.helpers({
  paymentRequest: function() {
    return new PaymentRequest(this.paymentRequestDoc);
  },

  paymentMethodTemplate: function() {
    // There is no specific field indicating that the method is credit card/ paypal/ apple pay card
    if (this.paymentMethod.cardType && this.paymentMethod.last4) {
      return 'paymentMethodCreditCard';
    } else {
      return 'paymentMethodPaypal';
    }
  } 
});

Template.paymentRequestReturnAuthorization.events({
  'click button.authorize': function() {
    $("button.authorize").attr("disabled", true);
    var data = {paymentRequestId: this.paymentRequestDoc._id, passcode: $("#passcode").val()};
    Meteor.call('authorizePaymentRequest', data, function(err, result) {
      $("button.authorize").removeAttr("disabled");
      handleAuthorizationCallback(result, data.paymentRequestId);
    });
  },

  'keyup #passcode': function() {
    Meteor.call('verifyAuthorizationPasscode', this.paymentRequestDoc._id, $("#passcode").val(), function(error, result){
      if (result) {
        $("button.authorize").removeAttr("disabled");
        $("#passcode_result").show();
      } else {
        $("button.authorize").attr("disabled", true);
        $("#passcode_result").hide();
      }
    }); 
  } 
});

Template.paymentMethodPaypal.helpers({
  maskedEmail: function(email) {
    var index = email.lastIndexOf('@');
    var id = email.slice(0, index);
    var domain = email.slice(index + 1, email.length);
    var domainFirstPart = domain.slice(0, domain.lastIndexOf('.'));
    var domainLastPart = domain.slice(domain.lastIndexOf('.') + 1, domain.length);
    var maskedDomainFirstPart = domainFirstPart[0] + domainFirstPart.replace(/./g, '*').slice(1, domainFirstPart.length);
    var maskedId = id[0] + id.replace(/./g, '*').slice(1, id.length);
    var masked = maskedId + "@" + maskedDomainFirstPart + "." + domainLastPart; 
    return masked;
  }
});

var handleAuthorizationCallback = function(success, paymentRequestId) {
  if (success) {
    Notifications.success('Successful', 'We have successfully received your authorization');
    var authorizationInfo = Session.get('authorizationInfo');
    authorizationInfo.isAuthorized = true;
    Session.set('authorizationInfo', authorizationInfo);
  } else {
    Notifications.error('Authorization failed', 'There is some error processing your authorization.');
  }
}
