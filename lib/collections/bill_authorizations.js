BillAuthorizations = new Meteor.Collection('bill_authorizations', {
  transform: function(doc) {
    return new BillAuthorization(doc);
  }
});

BillAuthorizations.create = function(bill) {
  var token = Random.secret(32);
  var createdAt = new Date();
  var doc = {
    billId: bill._id,
    token: token,
    createdAt: createdAt
  }

  var billAuthorizationId = BillAuthorizations.insert(doc);
  return billAuthorizationId;
}

BillAuthorization = function(doc) {
  _.extend(this, doc);
}
