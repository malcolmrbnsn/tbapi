var express = require("express"),
  router = express.Router({
    mergeParams: true
  }),
  Host = require("../models/host"),
  Alarm = require("../models/alarm");

// show json
router.get("/hosts/:hostname", function(req, res) {
  // sanatise ip address
  if (req.params.hostname) {
    var ipformat = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (!req.params.hostname.match(ipformat)) {
      return res.json({
        "error": "incorrect hostname format"
      })
    }
    Host.findOne({
      hostname: req.params.hostname,
    }).exec(function(err, foundHost) {
      if (err) {
        console.log(err);
        return res.json({
          "error": JSON.stringify(err)
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
                url: alarm.file.url
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
  } else {
    return res.json({
      error: "No hostname included"
    })
  }
});

module.exports = router;