Template.paymentRequestRow.helpers({
  customer: function() {
    return this.getCustomer(); 
  }
});

Template.paymentRequests.events({
  'click #create_button': function() {
    Router.go("createPaymentRequest");
  },

  'click #logout_button': function() {
    Meteor.logout();
  }
});

Template.paymentRequestRow.events({
  'click .payment_request_row': function() {
    Router.go("paymentRequest", {_id: this._id});
  }
});
