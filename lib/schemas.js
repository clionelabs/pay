Schemas = {};

Schemas.PaymentRequestForm = new SimpleSchema({
  "customerEmail": {
    type: String,
    label: 'Customer Email',
    regEx: SimpleSchema.RegEx.Email 
  },
  
  "customerFirstName": {
    type: String,
    label: "FirstName",
    optional: true
  },

  "customerLastName": {
    type: String,
    label: "LastName",
    optional: true
  },

  "bill.title": {
    type: String,
    label: 'Title',
    max: 200
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
    autoform: {
      type: "bootstrap-datepicker"
    },
    optional: true
  },
  "bill.notes": {
    type: String,
    label: 'Notes',
    autoform: {rows: 5},
    optional: true
  }
});

Schemas.EditPaymentRequestForm = new SimpleSchema([
  Schemas.PaymentRequestForm, {
    "paymentRequestId": {
      type: String
    } 
  }
])
