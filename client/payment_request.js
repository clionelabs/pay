Template.paymentRequest.helpers({
  actionTemplate: function() {
    var state = this.state;
    var stateName = s.capitalize(state); // capitalize
    var templateName = 'paymentRequest' + stateName + 'Action';
    return templateName;
  },

  logTime: function(timestamp) {
    return moment(timestamp).format();
  },

  customer: function() {
    return this.getCustomer();
  }
});

Template.paymentRequest.events({
  'click button.return_list': function() {
    Router.go("paymentRequests");
  },
  'click button.edit' : function() {
    Router.go('editPaymentRequest', this);
  },
  'click button.send_again' : function() {

    Meteor.call('sendAuthEmail', this._id);
  },
  'click button.send_accept': function() {
    Meteor.call('acceptPaymentRequest', this._id);
  },
  'click button.send_reject': function() {
    Meteor.call('rejectPaymentRequest', this._id);
  },
  'click button.send_complete': function() {
    Meteor.call('completePaymentRequest', this._id);
  }
});

//TODO will remove
Template.paymentRequestTestEvents.events({
  'click button.send_initialize': function () {
    Meteor.call('testPaymentRequestEvents', this._id, 'initialize');
  },
  'click button.send_accept': function () {
    Meteor.call('testPaymentRequestEvents', this._id, 'accept');
  },
  'click button.send_reject': function () {
    Meteor.call('testPaymentRequestEvents', this._id, 'reject');
  },
  'click button.send_authorize': function () {
    Meteor.call('testPaymentRequestEvents', this._id, 'authorize');
  },
  'click button.send_complete': function () {
    Meteor.call('testPaymentRequestEvents', this._id, 'complete');
  }
});
