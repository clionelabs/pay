Meteor.startup(() => {
  _.extend(Meteor,
    {
      copies : {
        "subjects": {
          "review": "Gilbert from Double: We are reviewing your request.",
          "authorization": "Gilbert from Double: Please authorize us to pay for you"
        }
      }
    }
  );
});