AutoForm.hooks({
  createBillForm: {
    onSuccess: function(formType, result) {
      Router.go("bill", {_id: result.billId});
    }
  },

  createPaymentRequestForm: {
    onSuccess: function(formType, result) {
      Router.go("paymentRequest", {_id: result});
    }
  }
});
