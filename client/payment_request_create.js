Template.createPaymentRequest.events({
  'keyup input[name=customerEmail]': function() {
    var email = $("input[name=customerEmail]").val();
    Meteor.call('lookupCustomerEmail', email, function(error, result) {
      if (result.found) {
        $("input[name=customerFirstName]").attr("disabled", true);
        $("input[name=customerLastName]").attr("disabled", true);
        $("input[name=customerFirstName]").val(result.firstName);
        $("input[name=customerLastName]").val(result.lastName);
      } else {
        $("input[name=customerFirstName]").removeAttr("disabled");
        $("input[name=customerLastName]").removeAttr("disabled");
      }
    });
  }
});

AutoForm.hooks({
  createPaymentRequestForm: {
    onSuccess: function () {
      Router.go("paymentRequests");
    }
  }
});
