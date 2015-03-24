Meteor.publish('paymentRequests', function() {
  return [
    PaymentRequests.find(),
    Customers.find()
  ]
});

Meteor.publish('paymentRequest', function(paymentRequestId) {
  var paymentRequest = PaymentRequests.findOne(paymentRequestId, {transform: null});
  return [
    PaymentRequests.find(paymentRequestId),
    Customers.find(paymentRequest.customerId)
  ]
});
