AutoForm.hooks({
  createBillForm: {
    onSuccess: function(formType, result) {
      Router.go("bill", {_id: result.billId});
    }
  }
});
