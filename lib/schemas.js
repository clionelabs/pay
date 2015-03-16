Schemas = {};

Schemas.CreatePaymentRequestForm = new SimpleSchema({
  title: {
    type: String,
    label: 'Title',
    max: 200
  },
  email: {
    type: String,
    label: 'Customer Email',
  },
  description: {
    type: String,
    label: 'Description',
    optional: true
  },
  company: {
    type: String,
    label: 'Company',
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
  notes: {
    type: String,
    label: 'Notes',
    autoform: {rows: 5},
    optional: true
  }
});
