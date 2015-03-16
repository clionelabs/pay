Meteor.startup(() => {
  _.extend(Meteor,
    {
      copies : {
        "subjects": {
          "paid" : "Gilbert from Double: Your request is processed",
          "rejected" : "Gilbert from Double: Sorry that we rejected your request",
          "review": "Gilbert from Double: We are reviewing your request.",
          "authorization": "Gilbert from Double: Please authorize us to pay for you"
        }
      }
    }
  );
});