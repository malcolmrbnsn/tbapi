var express = require("express");
const router = express.Router({
  mergeParams: true
})
var Host = require("../models/host");
var House = require("../models/house");
var Alarm = require("../models/alarm");

// Rollbar
var Rollbar = require("rollbar");
var rollbar = new Rollbar({
  accessToken: '3186dddb91ea4c0db986150bd3a37afa',
  captureUncaught: true,
  captureUnhandledRejections: true
});

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