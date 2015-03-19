AutoForm.hooks({
  paymentRequestForm: {
    before : {
      insert : function(doc) {
        var initDoc = {
          events: [],
          state: 'created',
          createdAt: new Date()
        };
        _.extend(doc, initDoc);
        return doc;
      }
    },
    onSuccess: function(formType, result) {
      Router.go("paymentRequest", {_id: result});
    }
  }
});
