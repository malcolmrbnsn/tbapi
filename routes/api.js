var express = require("express"),
  router = express.Router({
    mergeParams: true
  }),
  Host = require("../models/host"),
  Alarm = require("../models/alarm");

// show json
router.get("/hosts/:hostname", function(req, res) {
  // sanatise ip address
  var ipformat = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
  if (!req.params.hostname.match(ipformat)) {
    return res.json({
      "error": "incorrect hostname format"
    })
  }
  Host.findOne({
    hostname: req.params.hostname,
  }).exec(function(err, foundHost) {
    console.log(foundHost);
    if (!foundHost || err) {
      console.log("API ERROR: " + error);
      return res.json({
        "error": "No host found"
      });
    } else {
      Alarm.find({
        "hosts": foundHost._id,
        active: true
      }).exec(function(err, foundAlarms) {
        if (err) {
          console.log(err);
          return res.json({
            error: JSON.stringify(err)
          });
        } else {
          var toSend = []
          foundAlarms.forEach((alarm) => {
            var addToSend = {
              dow: alarm.dow,
              hour: alarm.hour,
              minute: alarm.minute,
              name: alarm.name,
              url: alarm.file.url,
              filename: alarm.file.name
            }
            toSend.push(addToSend)
          })
          res.json({
            "result": toSend
          });
        }
      });
    }
  });
});

module.exports = router;