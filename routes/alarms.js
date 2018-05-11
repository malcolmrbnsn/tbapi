const express = require("express"),
  router = express.Router({
    mergeParams: true
  }),
  Alarm = require("../models/alarm"),
  House = require("../models/house"),
  Host = require("../models/host"),
  middleware = require("../middleware"),
  isLoggedIn = middleware.isLoggedIn;

// Rollbar
var Rollbar = require("rollbar");
var rollbar = new Rollbar({
  accessToken: '3186dddb91ea4c0db986150bd3a37afa',
  captureUncaught: true,
  captureUnhandledRejections: true
});

// New
router.get("/new", isLoggedIn, function(req, res) {
  House.findById(req.params.id).
  populate("hosts").
  exec(function(err, house) {
    if (err) {
      rollbar.error(err);
      return res.redirect('/houses');
    } else {
      res.render("alarms/new", {
        house: house,
        pageName: "New Alarm"
      });
    }
  });
});

// Create
router.post("/", isLoggedIn, function(req, res) {
  House.findById(req.params.id, function(err, house) {
    if (!req.body.alarm.dow) {
      req.flash("error", "You must select at least one day!");
      return res.redirect("back");
    }
    if (!req.body.alarm.hosts) {
      req.flash("error", "You need to select at least one host!");
      return res.redirect("back");
    }
    newAlarm = {
      name: req.body.alarm.name,
      hour: req.body.alarm.hour,
      minute: req.body.alarm.minute,
      dow: req.body.alarm.dow,
      hosts: req.body.alarm.hosts
    }
    Alarm.create(newAlarm, function(err, alarm) {
      if (err) {
        rollbar.error(err);
        return res.redirect('/houses');
      } else {
        alarm.house.id = req.params.id;
        // Save alarm
        alarm.save();
        // Link to house and save
        house.alarms.push(alarm);
        house.save();
        res.redirect("/houses/" + req.params.id);
      }
    });
  });
});

//Edit
router.get("/:alarm_id/edit", isLoggedIn, function(req, res) {
  House.findById(req.params.id).
  populate("hosts").
  exec(function(err, house) {
    if (err) {
      rollbar.error(err);
      return res.redirect('/houses');
    } else {
      Alarm.findById(req.params.alarm_id).
      populate("hosts").
      exec(function(err, alarm) {
        if (err) {
          rollbar.error(err);
        } else {
          var selectedHosts = [];
          house.hosts.forEach(function(host) {
            alarm.hosts.forEach(function(aHost) {
              if (aHost._id.equals(host._id)) {
                selectedHosts.push(aHost._id.toString())
              }
            });
          });
          res.render("alarms/edit", {
            house: house,
            alarm: alarm,
            selectedHosts: selectedHosts,
            pageName: "Edit Alarm"
          });
        }
      });
    }
  });
});

// Update
router.put("/:alarm_id", isLoggedIn, function(req, res) {
  if (!req.body.alarm.dow) {
    req.flash("error", "You must select at least one day!");
    return res.redirect("back");
  }
  if (!req.body.alarm.hosts) {
    req.flash("error", "You need to select at least one host!");
    return res.redirect("back");
  }
  newAlarm = {
    name: req.body.alarm.name,
    hour: req.body.alarm.hour,
    minute: req.body.alarm.minute,
    dow: req.body.alarm.dow,
    hosts: req.body.alarm.hosts
  };
  console.log(req.body);
  if (typeof req.body.active === "undefined") {
    newAlarm.active = false;
  } else if (req.body.active === "false") { // HACK: Should be sent as true from form but it works for now
    newAlarm.active = true;
  }
  console.log(typeof req.body.active);
  Alarm.findByIdAndUpdate(req.params.alarm_id, newAlarm, function(err, alarm) {
    if (err) {
      rollbar.error(err)
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
      rollbar.error(err);
      res.redirect("/houses")
    } else {
      res.redirect("/houses/" + req.params.id)
    }
  })
})

module.exports = router;