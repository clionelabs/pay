Bills = new Meteor.Collection('bills', {
  transform: function(doc) {
    return new Bill(doc);
  }
});

Bills.Status = {
  REVIEWED: 'Reviewed',
  AUTHORIZING: 'Authorizing',
  AUTHORIZED: 'Authorized',
  PROCESSING: 'Processing',
  PROCESSED: 'Processed',
  CANCELLED: 'Cancelled'
}

Bills.attachSchema(new SimpleSchema({
  title: {
    type: String,
    label: 'Title',
    max: 200
  },
  description: {
    type: String,
    label: 'Description',
    autoform: {rows: 5},
    optional: true
  },
  currency: {
    type: String,
    label: 'Currency',
    allowedValues: ['HKD'],
    defaultValue: 'HKD'
  },
  amount: {
    type: Number,
    label: 'Amount',
    decimal: true
  },
  deadline: {
    type: Date,
    label: 'Deadline',
    optional: true
  },
  status: {
    type: String,
    label: 'Status',
    allowedValues: _.values(Bills.Status),
    defaultValue: Bills.Status.REVIEWED
  }
}));

Bill = function(doc) {
  _.extend(this, doc);
};
