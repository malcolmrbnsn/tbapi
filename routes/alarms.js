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

// MULTER
var multer = require('multer');
var storage = multer.diskStorage({
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

// Cloundinary
var cloudinary = require('cloudinary');
cloudinary.config({
  cloud_name: 'tbapi',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
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
  cloudinary.v2.uploader.upload(req.file.path, {
    resource_type: "video"
  }, function(err, result) {
    if (err) {
      req.flash('error', err.message);
      return res.redirect('back');
    }
    newAlarm = {
      name: req.body.alarm.name,
      hour: req.body.alarm.hour,
      minute: req.body.alarm.minute,
      dow: req.body.alarm.dow,
      hosts: req.body.alarm.hosts,
      author: req.user._id,
      file: {
        url: result.secure_url,
        id: result.public_id,
        name: req.file.originalname
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
          rollbar.error(err);
          req.flash("error", err.message)
          return res.redirect('/houses');
        }
        alarm.house.id = req.params.id;
        // Save alarm
        alarm.save();
        // Link to house and save
        house.alarms.push(alarm);
        house.save();
        res.redirect("/houses/" + req.params.id);
      });
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