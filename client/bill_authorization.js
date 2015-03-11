Template.bill_authorization.rendered = function() {
  Meteor.call('getAuthorizeBillToken', function(err, clientToken) {
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

      var firstName = $("input[name=firstName]").val();
      var lastName = $("input[name=lastName]").val();
      var billAuthorizationId = $("input[name=billAuthorizationId]").val();

      var data = {
        billAuthorizationId: billAuthorizationId,
        firstName: firstName,
        lastName: lastName,
        nonce: nonce
      }
      Meteor.call('createAuthorizeBillTransaction', data, function(err, result) {
        console.log("createAuthTransaction result: ", result);
        if (result) {

        } else {

        }
      });
    }
  });
};
