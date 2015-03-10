Schemas = {};

Schemas.CreateBillForm = new SimpleSchema({
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
  }
});
