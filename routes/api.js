var express = require("express");
const router = express.Router({
  mergeParams: true
});
var Host = require("../models/host");
var House = require("../models/house");
var Alarm = require("../models/alarm");

// show json
router.get("/hosts/:ip", function(req, res) {
  Host.find({
    hostname: req.params.ip,
  }).exec(function(err, foundHost) {
    if (err) {
      console.log(err)
      res.json(err)
    } else {
      Alarm.find({
        "host._id": foundHost._id,
        active: true
      }).exec(function(err, foundAlarms) {
        if (err) {
          console.log(err)
          res.json(err)
        } else {
          res.json(foundAlarms)
        }
      })
    }
  })
});

module.exports = router;