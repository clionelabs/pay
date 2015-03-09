Bills = new Meteor.Collection('bills', {
  transform: function(doc) {
    return new Bill(doc);
  }
});

Bill = function(doc) {
  _.extend(this, doc);
};

Bill.Status = {
  REVIEWED: 'Reviewed',
  AUTHORIZING: 'Authorizing',
  AUTHORIZED: 'Authorized',
  PROCESSING: 'Processing',
  PROCESSED: 'Processed',
  CANCELLED: 'Cancelled'
}
