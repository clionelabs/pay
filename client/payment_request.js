Template.paymentRequest.helpers({
  actionTemplate: function() {
    var state = this.state();
    var stateName = s.capitalize(state); // capitalize
    var templateName = 'paymentRequest' + stateName + 'Action';
    return templateName;
  },

  logs: function() {
    return _.map(this.events, function(event) {
      var eventName = s.capitalize(event.type); // capitalize
      var templateName = 'paymentRequest' + eventName + 'Log';
      return {
        template: templateName,
        event: event
      }
    });
  }
});

Template.paymentRequestSentAuthLog.helpers({
  authorizationURL: function() {
    return Payments.findOne(this.paymentId).authorizationURL();
  } 
});

Template.paymentRequest.events({
  'click button.return_list': function() {
    Router.go("paymentRequests");
  },

  'click #send_auth_button': function() {
    var paymentRequestId = this._id;
    var result = Meteor.call('sendPaymentAuthorization', paymentRequestId); 
  },

  'click #set_processed_button': function() {
    var paymentRequestId = this._id;
    var result = Meteor.call('setPaymentRequestProcessed', paymentRequestId);
  } 
});

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
