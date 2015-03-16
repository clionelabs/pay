Template.paymentAuthorization.rendered = function() {
  Meteor.call('getPaymentAuthorizationToken', function(err, clientToken) {
    if (err) {
      console.log("error retrieving braintree client token", err);
      return;
    }
    initializeBraintree(clientToken);
  });
};

var initializeBraintree = function(clientToken) {
  console.log("[initializeBraintree]: ", braintree);
  braintree.setup(clientToken, 'dropin', {
    container: 'dropin',
    paymentMethodNonceReceived: function(event, nonce) {
      var paymentId = $("input[name=paymentId]").val();

      var data = {
        paymentId: paymentId,
        nonce: nonce
      }
      Meteor.call('createPaymentTransaction', data, function(err, result) {
        console.log("createPaymentTransaction result: ", result);
        if (result) {
          //TODO redirect to auth success page
        } else {
          //TODO redirect to auth failed page
        }
      });
    }
  });
};

