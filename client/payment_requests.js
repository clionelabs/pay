Template.paymentRequests.events({
  'click #create_button': function() {
    Router.go("createPaymentRequest");
  }
});

Template.paymentRequestRow.events({
  'click .payment_request_row': function() {
    Router.go("paymentRequest", {_id: this._id});
  }
});
