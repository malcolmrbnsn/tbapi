var express = require("express");
const router = express.Router({
  mergeParams: true
});
var Host = require("../models/host");
var House = require("../models/house");

// New
router.get("/new", function(req, res) {
  console.log(req.params);
  House.findById(req.params.id, function(err, house) {
    if (err) {
      console.log(err)
    } else {
      res.render("hosts/new", {
        house: house
      })
    }
  })
})

// Create
router.post("/", function(req, res) {
  House.findById(req.params.id, function(err, house) {
    if (err) {
      console.log(err)
      res.redirect("/houses/" + req.params.id)
    } else {
      Host.create(req.body.host, function(err, host) {
        if (err) {
          console.log(err)
        } else {
          host.house.id = req.params.id;
          host.house.name = house.name;
          // Save host
          host.save();
          // Link to house and save
          house.hosts.push(host);
          house.save();
          res.redirect("/houses/" + req.params.id)
        }
      })
    }
  })
})

module.exports = router;