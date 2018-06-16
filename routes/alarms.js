const express = require("express"),
  router = express.Router({
    mergeParams: true
  }),
  fs = require("fs"),
  Alarm = require("../models/alarm"),
  House = require("../models/house"),
  Host = require("../models/host"),
  middleware = require("../middleware"),
  rollbar = require("../middleware/rollbar"),
  isLoggedIn = middleware.isLoggedIn;


// MULTER
var multer = require('multer');
var storage = multer.diskStorage({
  //Setup where the user's file will go
  destination: function(req, file, callback) {
    callback(null, './public/sounds');
  },
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var soundFilter = function(req, file, cb) {
  // accept sound files only
  if (!file.originalname.match(/\.(wav|mp3|wma)$/i)) {
    return cb(new Error('Only sound files are allowed!'), false);
  }
  cb(null, true);
}
var upload = multer({
  storage: storage,
  fileFilter: soundFilter
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
router.post("/", isLoggedIn, upload.single('sound'), function(req, res) {
  console.log(req.file);
  newAlarm = {
    name: req.body.alarm.name,
    hour: req.body.alarm.hour,
    minute: req.body.alarm.minute,
    dow: req.body.alarm.dow,
    hosts: req.body.alarm.hosts,
    author: req.user._id,
    file: {
      name: req.file.originalname,
      url: "/sounds/" + req.file.filename,
      fullpath: req.file.path
    }
  }
  House.findById(req.params.id, function(err, house) {
    if (!req.body.alarm.dow) {
      req.flash("error", "You must select at least one day!");
      return res.redirect("back");
    }
    if (!req.body.alarm.hosts) {
      req.flash("error", "You need to select at least one host!");
      return res.redirect("back");
    }
    Alarm.create(newAlarm, function(err, alarm) {
      if (err) {
        req.flash("error", err.message)
        rollbar.error(err.message, req)
        return res.redirect('/houses');
      }
      alarm.house.id = req.params.id;
      // Save alarm
      alarm.save();
      // Link to house and save
      house.alarms.push(alarm);
      house.save();
      rollbar.log("House created", req)
      res.redirect("/houses/" + req.params.id);
    });
  });
});

//Edit
router.get("/:alarm_id/edit", isLoggedIn, function(req, res) {
  House.findById(req.params.id).
  populate("hosts").
  exec(function(err, house) {
    if (err) {
      rollbar.error(err, req);
      return res.redirect('/houses');
    } else {
      Alarm.findById(req.params.alarm_id).
      populate("hosts").
      exec(function(err, alarm) {
        if (err) {
          rollbar.error(err, req);
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
router.put("/:alarm_id", isLoggedIn, upload.single('sound'), function(req, res) {
  Alarm.findById(req.params.alarm_id, async function(err, alarm) {
    if (!req.body.alarm.dow) {
      req.flash("error", "You must select at least one day!");
      return res.redirect("back");
    }
    if (!req.body.alarm.hosts) {
      req.flash("error", "You need to select at least one host!");
      return res.redirect("back");
    }
    if (err) {
      req.flash("error", err.message)
      return res.redirect("back")
    }
    if (req.file) {
      try {
        // Delete the old file
        console.log(typeof alarm.file.fullpath);
        fs.unlink(alarm.file.fullpath, (err) => {
          if (err) throw err;
          rollbar.log('successfully deleted sound', req);
        });
        // Save the new file to db
        alarm.file.url = "/sounds/" + req.file.filename
        alarm.file.name = req.file.originalname;
        alarm.file.fullpath = req.file.path
      } catch (err) {
        req.flash("error", err.message)
        rollbar.error(err.message, req)
        return res.redirect("back")
      }
    }
    alarm.name = req.body.alarm.name;
    alarm.hour = req.body.alarm.hour;
    alarm.minute = req.body.alarm.minute;
    alarm.dow = req.body.alarm.dow;
    alarm.hosts = req.body.alarm.hosts;
    alarm.author = req.user._id;
    if (typeof req.body.active === "undefined") {
      alarm.active = false;
    } else if (req.body.active === "false") { // HACK: Should be sent as true from form but it works for now ¯\_(ツ)_/¯
      alarm.active = true;
    }
    alarm.save();
    req.flash("success", "Successfully Updated!");
    rollbar.log("alarm updated", req)
    res.redirect("/houses/" + alarm.house.id);
  });
});

// Delete
router.delete("/:alarm_id", isLoggedIn, function(req, res) {
  House.findByIdAndUpdate(req.params.id, {
    $pull: {
      alarms: req.params.alarm_id
    }
  }, function(err) {
    if (err) {
      req.flash("error", err.message);
      return res.redirect("back");
    }
    Alarm.findById(req.params.alarm_id, function(err, alarm) {
      if (err) {
        rollbar.error(err);
        res.redirect("/houses");
      }
      // Delete the file
      fs.unlink(alarm.file.fullpath, (err) => {
        if (err) throw err;
        rollbar.log('successfully deleted sound', req);
      });
      alarm.remove();
      req.flash('success', 'Alarm deleted successfully!');
      rollbar.log("alarm deleted", req)
      res.redirect("/houses/" + req.params.id);
    });
  });
});

module.exports = router;