var express = require("express");
const router = express.Router({
  mergeParams: true
});
var Host = require("../models/host");
var House = require("../models/house");

// New
router.get("/new", function(req, res) {
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

//Edit
router.get("/:host_id/edit", function(req, res) {
  House.findById(req.params.id, function(err, house) {
    if (err) {
      console.log(err)
    } else {
      Host.findById(req.params.host_id, function(err, host) {
        if (err) {
          console.log(err)
        } else {
          res.render("hosts/edit", {
            house: house,
            host: host
          })
        }
      })
    }
  })
})

// Update
router.put("/:host_id", function(req, res) {
  Host.findByIdAndUpdate(req.params.host_id, req.body.host, function(err, host) {
    if (err) {
      console.log(err)
    } else {
      res.redirect("/houses/" + req.params.id)
    }
  })
})

// Delete
router.delete("/:host_id", function(req, res) {
  Host.findByIdAndRemove(req.params.host_id, function(err) {
    if (err) {
      console.log(err);
      res.redirect("/houses")
    } else {
      res.redirect("/houses/" + req.params.id)
    }
  })
})


module.exports = router;