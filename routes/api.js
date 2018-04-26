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
    hostname: req.params.ip
  }).
  populate('alarms').
  exec(function(err, foundHost) {
    if (err) {
      console.log(err)
      res.json(err)
    } else {
      res.json(foundHost)
    }
  })
});

module.exports = router;