Template.paymentRequest.helpers({
  logs: function() {
    return _.map(this.events, function(event) {
      var template;
      if (event.type === PaymentRequest.Events.REVIEWED) {
        template = 'reviewedLog';
      } else if (event.type === PaymentRequest.Events.SENT_AUTH) {
        template = 'sentAuthLog';
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
    console.log("paymentID: ", this.paymentId);
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
  }
});
