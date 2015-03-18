Meteor.publish('paymentRequests', function() {
  return PaymentRequests.find();
});

Meteor.publish('paymentRequest', function(paymentRequestId) {
  return [
    PaymentRequests.find(paymentRequestId)
  ]
});
