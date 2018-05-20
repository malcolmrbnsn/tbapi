var express = require("express"),
  router = express.Router({
    mergeParams: true
  }),
  rollbar = require("../middleware/rollbar"),
  Host = require("../models/host"),
  House = require("../models/house"),
  Alarm = require("../models/alarm");

// show json
router.get("/hosts/:ip", function(req, res) {
  Host.find({
    hostname: req.params.ip,
  }).exec(function(err, foundHost) {
    if (err) {
      rollbar.error(err);
      res.json(err);
    } else {
      Alarm.find({
        "host._id": foundHost._id,
        active: true
      }).exec(function(err, foundAlarms) {
        if (err) {
          rollbar.error(err);
          res.json(err);
        } else {
          res.json(foundAlarms);
        }
      });
    }
  });
});

module.exports = router;