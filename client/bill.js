Template.bill.helpers({
  isStatusReviewed: function() {
    return this.status === Bill.Status.REVIEWED;
  },
  isStatusAuthorizing: function() {
    return this.status === Bill.Status.AUTHORIZING;
  },
  isStatusAuthorized: function() {
    return this.status === Bill.Status.AUTHORIZED;
  },
  isStatusProcessed: function() {
    return this.status === Bill.Status.PROCESSED;
  },
  isStatusCancelled: function() {
    return this.status === Bill.Status.CANCELLED;
  },

  actionPanelName: function() {
    switch(this.status) {
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
    var billId = this._id;
    var result = Meteor.call('sendBillAuthorization', billId);
  },

  'click #resend_authorize_button': function() {
    var billId = this._id;
    var result = Meteor.call('sendBillAuthorization', billId);
  },

  'click #processed_button': function() {
    var billId = this._id;
    var result = Meteor.call('processedBill', billId);
  }
});
