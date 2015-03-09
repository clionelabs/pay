Template.bill.helpers({
  is_status_reviewed: function() {
    return this.bill.status === Bill.Status.REVIEWED;
  },
  is_status_authorizing: function(bill) {
    return this.bill.status === Bill.Status.AUTHORIZING;
  },
  is_status_authorized: function(bill) {
    return this.bill.status === Bill.Status.AUTHORIZED;
  },
  is_status_processed: function(bill) {
    return this.bill.status === Bill.Status.PROCESSED;
  },
  is_status_cancelled: function(bill) {
    return this.bill.status === Bill.Status.CANCELLED;
  },
});

Template.bill.events({
  'click button.return_list': function() {
    Router.go("bills");
  },

  'click #send_authorize_button': function() {
    var billId = this.bill._id;
    var result = Meteor.call('sendBillAuthorization', billId);
  },

  'click #resend_authorize_button': function() {
    var billId = this.bill._id;
    var result = Meteor.call('sendBillAuthorization', billId);
  },

  'click #processed_button': function() {
    var billId = this.bill._id;
    var result = Meteor.call('processedBill', billId);
  }
});
