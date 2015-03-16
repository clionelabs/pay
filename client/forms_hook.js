AutoForm.hooks({
  createPaymentRequestForm: {
    onSuccess: function(formType, result) {
      Router.go("paymentRequest", {_id: result});
    }
  }
});
