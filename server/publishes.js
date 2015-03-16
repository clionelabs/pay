Meteor.publish('paymentRequests', function() {
  return PaymentRequests.find();
});

Meteor.publish('paymentRequest', function(paymentRequestId) {
  return [
    PaymentRequests.find(paymentRequestId),
    Payments.find({paymentRequestId: paymentRequestId})
  ]
});

Meteor.publish('payment', function(paymentId) {
  var payment = Payments.findOne(paymentId);
  return [
    Payments.find(paymentId),
    PaymentRequests.find(payment.paymentRequestId)
  ]
});
