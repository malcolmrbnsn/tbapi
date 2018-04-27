var express = require("express");
const router = express.Router({
    mergeParams: true
  }),
  formidable = require('formidable'),
  path = require('path'),
  fs = require('fs-extra')
var Alarm = require("../models/alarm");
var House = require("../models/house");
var Host = require("../models/host");
var middleware = require("../middleware");
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
  var form = new formidable.IncomingForm();
  //Formidable uploads to operating systems tmp dir by default
  form.uploadDir = "./public/sounds"; //set upload directory
  form.keepExtensions = true; //keep file extension

  form.parse(req, function(err, fields, files) {
    console.log("form.bytesReceived");
    //TESTING
    console.log("file size: " + JSON.stringify(files.fileUploaded.size));
    console.log("file path: " + JSON.stringify(files.fileUploaded.path));
    console.log("file name: " + JSON.stringify(files.fileUploaded.name));
    console.log("file type: " + JSON.stringify(files.fileUploaded.type));
    console.log("lastModifiedDate: " + JSON.stringify(files.fileUploaded.lastModifiedDate));
    fs.rename(files.fileUploaded.path, './public/sounds/' + files.fileUploaded.name, function(err) {
      if (err)
        throw err;
      console.log('renamed complete');
    });
    House.findById(req.params.id, function(err, house) {
      if (err) {
        console.log(err)
        res.redirect("/houses/")
      } else {
        if (fields.dow) {
          dow = fields.dow.i
        } else {
          req.flash("Please include at least one day of the week.")
          res.redirect("back")
        }
        newAlarm = {
          name: fields.alarm.name,
          hour: fields.alarm.hour,
          minute: fields.alarm.minute,
          sound: files.fileUploaded.name,
          dow: dow,
          hosts: fields.alarm.hosts
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
router.put("/:alarm_id", isLoggedIn, function(req, res) {
  var form = new formidable.IncomingForm();
  //Formidable uploads to operating systems tmp dir by default
  form.uploadDir = "./public/sounds"; //set upload directory
  form.keepExtensions = true; //keep file extension

  form.parse(req, function(err, fields, files) {
    if (files.size > 0) {
      console.log("form.bytesReceived");
      //TESTING
      console.log("file size: " + JSON.stringify(files.fileUploaded.size));
      console.log("file path: " + JSON.stringify(files.fileUploaded.path));
      console.log("file name: " + JSON.stringify(files.fileUploaded.name));
      console.log("file type: " + JSON.stringify(files.fileUploaded.type));
      console.log("lastModifiedDate: " + JSON.stringify(files.fileUploaded.lastModifiedDate));
      fs.rename(files.fileUploaded.path, './public/sounds/' + files.fileUploaded.name, function(err) {
        if (err)
          throw err;
        console.log('renamed complete');
      });
      newAlarm = {
        name: fields.alarm.name,
        hour: fields.alarm.hour,
        minute: fields.alarm.minute,
        dow: dow,
        hosts: fields.alarm.hosts,
        sound: fields.alarm.sound
      };
    } else {
      newAlarm = {
        name: fields.alarm.name,
        hour: fields.alarm.hour,
        minute: fields.alarm.minute,
        dow: dow,
        hosts: fields.alarm.hosts
      };
    }
    if (form.dow.i) {
      dow = form.dow.i
    } else {
      dow = []
    }
    if (form.alarm.active === 'true') {
      newAlarm.active = true
    } else {
      newAlarm.active = false
    }
    // eval(require('locus'))
    Alarm.findByIdAndUpdate(req.params.alarm_id, newAlarm, function(err, alarm) {
      if (err) {
        console.log(err)
        return res.redirect('/houses');
      } else {
        res.redirect("/houses/" + req.params.id)
      }
    })
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