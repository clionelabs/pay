Template.bill.helpers({
  isStatusReviewed: function() {
    return this.bill.status === Bill.Status.REVIEWED;
  },
  isStatusAuthorizing: function(bill) {
    return this.bill.status === Bill.Status.AUTHORIZING;
  },
  isStatusAuthorized: function(bill) {
    return this.bill.status === Bill.Status.AUTHORIZED;
  },
  isStatusProcessed: function(bill) {
    return this.bill.status === Bill.Status.PROCESSED;
  },
  isStatusCancelled: function(bill) {
    return this.bill.status === Bill.Status.CANCELLED;
  },

  actionPanelName: function() {
    switch(this.bill.status) {
      case Bill.Status.REVIEWED:
        return 'reviewed_action_panel';
      case Bill.Status.AUTHORIZING:
        return 'authorizing_action_panel';
      case Bill.Status.AUTHORIZED:
        return 'authorized_action_panel';
      case Bill.Status.PROCESSED:
        return 'processed_action_panel';
      default:
        throw 'invalid status';
    }
  }
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
