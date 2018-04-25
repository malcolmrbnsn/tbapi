var express = require("express");
const router = express.Router({
  mergeParams: true
});
var Alarm = require("../models/alarm");
var House = require("../models/house");

// New
router.get("/new", function(req, res) {
  House.findById(req.params.id).
  populate("hosts").
  exec(function(err, house) {
    if (err) {
      console.log(err)
      return res.redirect('/houses');
    } else {
      res.render("alarms/new", {
        house: house
      })
    }
  })
})

// Create
router.post("/", function(req, res) {
  console.log(req.body);
  House.findById(req.params.id, function(err, house) {
    if (err) {
      console.log(err)
      res.redirect("/houses/")
    } else {
      if (req.body.dow) {
        dow = req.body.dow.i
      } else {
        res.redirect("back")
      }
      newAlarm = {
        name: req.body.alarm.name,
        hour: req.body.alarm.hour,
        minute: req.body.alarm.minute,
        dow: dow,
        hosts: req.body.alarm.hosts
      };
      Alarm.create(newAlarm, function(err, alarm) {
        if (err) {
          console.log(err)
          return res.redirect('/houses');
        } else {
          alarm.house.id = req.params.id;
          // Save host
          alarm.save();
          // Link to house and save
          house.alarms.push(alarm);
          house.save();
          res.redirect("/houses/" + req.params.id)
        }
      })
    }
  })
})

//Edit
router.get("/:alarm_id/edit", function(req, res) {
  House.findById(req.params.id).
  populate("hosts").
  exec(function(err, house) {
    if (err) {
      console.log(err)
      return res.redirect('/houses');
    } else {
      Alarm.findById(req.params.alarm_id, function(err, alarm) {
        if (err) {
          console.log(err)
        } else {
          res.render("alarms/edit", {
            house: house,
            alarm: alarm
          })
        }
      })
    }
  })
})

// Update
router.put("/:alarm_id", function(req, res) {
  console.log(req.body)
  if (req.body.dow.i) {
    dow = req.body.dow.i
  } else {
    dow = []
  }
  newAlarm = {
    name: req.body.alarm.name,
    hour: req.body.alarm.hour,
    minute: req.body.alarm.minute,
    dow: dow,
    hosts: req.body.alarm.hosts
  };
  Alarm.findByIdAndUpdate(req.params.alarm_id, newAlarm, function(err, alarm) {
    if (err) {
      console.log(err)
      return res.redirect('/houses');
    } else {
      res.redirect("/houses/" + req.params.id)
    }
  })
})

// Delete
router.delete("/:alarm_id", function(req, res) {
  Alarm.findByIdAndRemove(req.params.alarm_id, function(err) {
    if (err) {
      console.log(err);
      res.redirect("/houses")
    } else {
      res.redirect("/houses/" + req.params.id)
    }
  })
})

module.exports = router;