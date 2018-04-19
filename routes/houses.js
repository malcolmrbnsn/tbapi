var express = require("express");
var router = express.Router();
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
  var house = {
    name: req.body.name,
    hosts: [],
    alarms: []
  }
  House.create(house, function(err, newlyCreated) {
    if (err) {
      console.log(err)
    } else {
      res.redirect("/houses")
    }
  })
})

module.exports = router;