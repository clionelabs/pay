Schemas = {};

Schemas.CreatePaymentRequestForm = new SimpleSchema({
  "bill.title": {
    type: String,
    label: 'Title',
    max: 200
  },
  "bill.email": {
    type: String,
    label: 'Customer Email',
    regEx: SimpleSchema.RegEx.Email
  },
  "bill.recipientFirstName": {
    type: String,
    label: 'First Name',
    max: 50,
    optional: true
  },
  "bill.recipientLastName": {
    type: String,
    label: 'Last Name',
    max: 50,
    optional: true
  },
  "bill.description": {
    type: String,
    label: 'Description',
    optional: true
  },
  "bill.company": {
    type: String,
    label: 'Company',
    optional: true
  },
  "bill.currency": {
    type: String,
    label: 'Currency',
    allowedValues: ['HKD'],
    defaultValue: 'HKD'
  },
  "bill.amount": {
    type: Number,
    label: 'Amount',
    decimal: true
  },
  "bill.deadline": {
    type: Date,
    label: 'Deadline',
    optional: true
  },
  "bill.notes": {
    type: String,
    label: 'Notes',
    autoform: {rows: 5},
    optional: true
  }
});
