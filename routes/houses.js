var express = require("express");
var router = express.Router(),
  formidable = require('formidable'),
  path = require('path'),
  fs = require('fs-extra')
var House = require("../models/house");

// Index
router.get("/", function(req, res) {
  House.find({}, function(err, allHouses) {
    if (err) {
      console.log(err)
    } else {
      res.render("houses/index", {
        houses: allHouses
      })
    }
  })
})

// New
router.get("/new", function(req, res) {
  res.render("houses/new");
})
// Create
router.post("/", function(req, res) {
  var form = new formidable.IncomingForm();
  //Formidable uploads to operating systems tmp dir by default
  form.uploadDir = "./public/img"; //set upload directory
  form.keepExtensions = true; //keep file extension

  form.parse(req, function(err, fields, files) {
    console.log("form.bytesReceived");
    //TESTING
    console.log("file size: " + JSON.stringify(files.fileUploaded.size));
    console.log("file path: " + JSON.stringify(files.fileUploaded.path));
    console.log("file name: " + JSON.stringify(files.fileUploaded.name));
    console.log("file type: " + JSON.stringify(files.fileUploaded.type));
    console.log("lastModifiedDate: " + JSON.stringify(files.fileUploaded.lastModifiedDate));
    fs.rename(files.fileUploaded.path, './public/img/' + files.fileUploaded.name, function(err) {
      if (err)
        throw err;
      console.log('renamed complete');
    });
    var house = {
      name: fields.name,
      img: files.fileUploaded.name
    }
    House.create(house, function(err, newlyCreated) {
      if (err) {
        console.log(err)
      } else {
        res.redirect("/houses")
      }
    })
  })
})
// Show
var populateQuery = [{
  path: 'hosts'
}, {
  path: 'alarms'
}];
router.get("/:id", function(req, res) {
  House.findById(req.params.id).
  populate(populateQuery).
  exec(function(err, foundHouse) {
    if (err || !foundHouse) {
      console.log(err);
      return res.redirect('/houses');
    }
    console.log(foundHouse)
    res.render("houses/show", {
      house: foundHouse
    });
  });
});

//Edit
router.get("/:id/edit", function(req, res) {
  House.findById(req.params.id, function(err, house) {
    if (err) {
      console.log(err)
    } else {
      console.log(house);
      res.render("houses/edit", {
        house: house
      })
    }
  })
})
// Update
router.put("/:id", function(req, res) {
  House.findByIdAndUpdate(req.params.id, req.body.house, function(err, house) {
    if (err) {
      console.log(err)
    } else {
      res.redirect("/houses/" + req.params.id)
    }
  })
})

// Delete
router.delete("/:id", function(req, res) {
  House.findByIdAndRemove(req.params.id, function(err) {
    if (err) {
      console.log(err);
      res.redirect("/houses")
    } else {
      res.redirect("/houses")
    }
  })
})

module.exports = router;