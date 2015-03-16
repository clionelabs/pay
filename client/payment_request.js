Template.paymentRequest.helpers({
  actionTemplate: function() {
    switch (this.state()) {
      case PaymentRequest.States.REVIEWED:
        return 'reviewedAction';
      case PaymentRequest.States.AUTHORIZING:
        return 'authorizingAction';
      case PaymentRequest.States.AUTHORIZED:
        return 'authorizedAction';
      case PaymentRequest.States.PROCESSED:
        return 'processedAction';
    } 
  },

  logs: function() {
    return _.map(this.events, function(event) {
      var template;
      if (event.type === PaymentRequest.Events.REVIEWED) {
        template = 'reviewedLog';
      } else if (event.type === PaymentRequest.Events.SENT_AUTH) {
        template = 'sentAuthLog';
      } else if (event.type === PaymentRequest.Events.AUTHORIZED) {
        template = 'authorizedLog';
      } else if (event.type === PaymentRequest.Events.PROCESSED) {
        template = 'processedLog';
      }

      return {
        template: template,
        event: event 
      }
    });
  }
});

Template.sentAuthLog.helpers({
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
