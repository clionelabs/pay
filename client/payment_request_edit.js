Template.editPaymentRequest.helpers({
  customer: function() {
    return this.getCustomer();
  }
});

Template.editPaymentRequest.events({
  'click button.return_list': function() {
    Router.go("paymentRequest", {_id: this._id});
  }
});

AutoForm.hooks({
  editPaymentRequestForm: {
    onSuccess: function () {
      Router.go("paymentRequests");
    }
  }
});
