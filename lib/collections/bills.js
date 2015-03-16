Bills = new Meteor.Collection('bills', {
  transform: function(doc) {
    return new Bill(doc);
  }
});

Bill = function(doc) {
  _.extend(this, doc);
};

Bill.prototype.sendAuthorization = function() {
  if (!this.hasBeenAuthorized()) {
    throw 'Bill has already been authorized';
  }
  var billAuthorizationId = BillAuthorizations.create(this);
  var modifier = {
    $set: {status: Bill.Status.AUTHORIZING}
  }
  Bills.upsert({_id: this._id}, modifier);

  return billAuthorizationId;
}

Bill.prototype.hasBeenAuthorized = function() {
  return _.indexOf([Bill.Status.REVIEWED, Bill.Status.AUTHORIZING], this.status) !== -1;
}

Bill.prototype.authorize = function() {
  var modifier = {
    $set: {status: Bill.Status.AUTHORIZED}
  }
  Bills.upsert({_id: this._id}, modifier);
}

Bill.prototype.processed = function() {
  var modifier = {
    $set: {status: Bill.Status.PROCESSED}
  }
  Bills.upsert({_id: this._id}, modifier);
}

Bill.prototype.test = function() {
  return this.status === Bill.Status.PROCESSED;
}

Bill.Status = {
  REVIEWED: 'Reviewed',
  AUTHORIZING: 'Authorizing',
  AUTHORIZED: 'Authorized',
  PROCESSED: 'Processed',
  CANCELLED: 'Cancelled'
}
