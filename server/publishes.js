Meteor.publish('bills', function () {
  return Bills.find();
});

Meteor.publish('bill', function(billId) {
  return Bills.find({_id: billId});
});

Meteor.publish('billAuthorizations', function(billId) {
  return BillAuthorizations.find({billId: billId});
});

Meteor.publish('billAuthorization', function(_id) {
  return BillAuthorizations.find({_id: _id});
});
