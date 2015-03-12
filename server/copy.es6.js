Meteor.startup(() => {
  _.extend(Meteor,
    {
      copies : {
        "subjects": {
          "review": "Gilbert from Double: We are reviewing your request."
        }
      }
    }
  );
});