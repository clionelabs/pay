Schemas = {};

Schemas.CreateBillForm = new SimpleSchema({
  from : {
    type: String,
    label: "From Email",
    regEx: SimpleSchema.RegEx.Email
  },
  title: {
    type: String,
    label: 'Title',
    max: 200
  },
  recipient: {
    type: String,
    label: 'Recipient',
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
