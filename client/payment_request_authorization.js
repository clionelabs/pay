Template.paymentRequestReturnAuthorize.events({
  'click button.authorize': function() {
    var data = {paymentRequestId: this._id};
    Meteor.call('authorizePaymentRequest', data, function(err, result) {
      console.log("authorizePaymentRequest result: ", result);
      if (result) {
        //TODO redirect to auth success page
      } else {
        //TODO redirect to auth failed page
      }
    })
  }
});

Template.paymentRequestNewAuthorize.rendered = function() {
  Meteor.call('getAuthorizationToken', function(err, clientToken) {
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
      var paymentRequestId = $("input[name=paymentRequestId]").val();

      var data = {
        paymentRequestId: paymentRequestId,
        nonce: nonce
      }
      Meteor.call('authorizePaymentRequestWithNonce', data, function(err, result) {
        console.log("authorizePaymentRequestWithNonce result: ", result);
        if (result) {
          //TODO redirect to auth success page
        } else {
          //TODO redirect to auth failed page
        }
      });
    }
  });
};


