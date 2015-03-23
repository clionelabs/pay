Template.paymentRequestRaw.helpers({
  getRawString : function() {
    return this.raw ? JSON.stringify(this.raw, null, 2) : "";
  },
  getRawHtml : function() {
    return this.raw ? encodeURIComponent(this.raw["body-html"]) : "";
  }
});
