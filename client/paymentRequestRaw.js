Template.paymentRequestRaw.helpers({
  getRawString : function() {
    return JSON.stringify(this.raw, null, 2);
  },
  getRawHtml : function() {
    return encodeURIComponent(this.raw["body-html"]);
  }
});
