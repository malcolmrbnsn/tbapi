var express = require("express"),
  router = express.Router({
    mergeParams: true
  }),
  rollbar = require("../middleware/rollbar"),
  Host = require("../models/host"),
  Alarm = require("../models/alarm");

// show json
router.get("/hosts/:hostname", function(req, res) {
  if (req.params.hostname) {
    Host.findOne({
      hostname: req.params.hostname,
    }).exec(function(err, foundHost) {
      if (err) {
        rollbar.error(err);
        res.json(JSON.stringify(err));
      } else {
        console.log(foundHost); //Seems to work
        Alarm.find({
          "hosts": foundHost._id,
          active: true
        }).exec(function(err, foundAlarms) {
          if (err) {
            rollbar.error(err);
            res.json(JSON.stringify(err));
          } else {
            res.json(foundAlarms);
          }
        });
      }
    });
  } else {
    res.json("No Hostname Included!")
  }
});

module.exports = router;