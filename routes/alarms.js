var express = require("express");
const router = express.Router({
    mergeParams: true
  }),
  Rollbar = require("rollbar")
var Alarm = require("../models/alarm");
var House = require("../models/house");
var Host = require("../models/host");
var middleware = require("../middleware");
var rollbar = new Rollbar("3186dddb91ea4c0db986150bd3a37afa");
var {
  isLoggedIn
} = middleware;
// New
router.get("/new", isLoggedIn, function(req, res) {
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
router.post("/", isLoggedIn, function(req, res) {
  House.findById(req.params.id, function(err, house) {
    if (!req.body.alarm.dow) {
      req.flash("error", "You must select at least one day!")
      return res.redirect("back")
    }
    if (!req.body.alarm.hosts) {
      req.flash("error", "You need to select at least one host!")
      return res.redirect("back")
    }
    newAlarm = {
      name: req.body.alarm.name,
      hour: req.body.alarm.hour,
      minute: req.body.alarm.minute,
      dow: req.body.alarm.dow,
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
  })
})

//Edit
router.get("/:alarm_id/edit", isLoggedIn, function(req, res) {
  House.findById(req.params.id).
  populate("hosts").
  exec(function(err, house) {
    if (err) {
      console.log(err)
      return res.redirect('/houses');
    } else {
      Alarm.findById(req.params.alarm_id).
      populate("hosts").
      exec(function(err, alarm) {
        if (err) {
          console.log(err)
        } else {
          var selectedHosts = []
          house.hosts.forEach(function(host) {
            alarm.hosts.forEach(function(aHost) {
              if (aHost._id.equals(host._id)) {
                console.log("yes");
                selectedHosts.push(aHost._id.toString())
              } else {
                console.log("no");
              }
            })
          })
          console.log(house);
          console.log(alarm);
          res.render("alarms/edit", {
            house: house,
            alarm: alarm,
            selectedHosts: selectedHosts
          })
        }
      })
    }
  })
})

// Update
router.put("/:alarm_id", isLoggedIn, function(req, res) {
  if (!req.body.alarm.dow) {
    req.flash("error", "You must select at least one day!")
    return res.redirect("back")
  }
  if (!req.body.alarm.hosts) {
    req.flash("error", "You need to select at least one host!")
    return res.redirect("back")
  }
  newAlarm = {
    name: req.body.alarm.name,
    hour: req.body.alarm.hour,
    minute: req.body.alarm.minute,
    dow: req.body.alarm.dow,
    hosts: req.body.alarm.hosts,
    active: JSON.parse(req.body.alarm.active)
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
router.delete("/:alarm_id", isLoggedIn, function(req, res) {
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