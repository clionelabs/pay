AutoForm.hooks({
  createBillForm: {
    onSuccess: function() {
      Router.go("bills");
    }
  }
});
