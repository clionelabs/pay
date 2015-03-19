Meteor.startup(() => {
  _.extend(Meteor,
    {
      copies : {
        "subjects": {
          "paid" : "Gilbert from Double: Your request is processed",
          "rejection" : "Gilbert from Double: Sorry that we have rejected your request",
          "review": "Gilbert from Double: We are reviewing your request.",
          "authorization": "Gilbert from Double: Please authorize us to pay for you"
        }
      }
    }
  );
});