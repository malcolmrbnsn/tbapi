var express = require("express");
const router = express.Router({
    mergeParams: true
  }),
  Rollbar = require("rollbar");
var Host = require("../models/host");
var House = require("../models/house");
var middleware = require("../middleware");
var rollbar = new Rollbar("3186dddb91ea4c0db986150bd3a37afa");
var {
  isLoggedIn,
  isAdmin
} = middleware;

// New
router.get("/new", isAdmin, function(req, res) {
  House.findById(req.params.id, function(err, house) {
    if (err) {
      rollbar.error(err)
      return res.redirect('/houses');
    } else {
      res.render("hosts/new", {
        house: house
      })
    }
  })
})

// Create
router.post("/", isAdmin, function(req, res) {
  House.findById(req.params.id, function(err, house) {
    if (err) {
      rollbar.error(err)
      return res.redirect('/houses');
    } else {
      Host.create(req.body.host, function(err, host) {
        if (err) {
          rollbar.error(err)
          req.flash("error", "Hostname must be unique")
          return res.redirect('back');
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
router.get("/:host_id/edit", isAdmin, function(req, res) {
  House.findById(req.params.id, function(err, house) {
    if (err) {
      rollbar.error(err)
      req.flash("error", "An error occured")
      return res.redirect('back');
    } else {
      Host.findById(req.params.host_id, function(err, host) {
        if (err) {
          rollbar.error(err)
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
router.put("/:host_id", isAdmin, function(req, res) {
  Host.findByIdAndUpdate(req.params.host_id, req.body.host, function(err, host) {
    if (err) {
      rollbar.error(err)
      req.flash("error", "Hostname must be unique")
      return res.redirect('back');
    } else {
      res.redirect("/houses/" + req.params.id)
    }
  })
})

// Delete
router.delete("/:host_id", isAdmin, function(req, res) {
  Host.findByIdAndRemove(req.params.host_id, function(err) {
    if (err) {
      rollbar.error(err);
      return res.redirect('/houses');
      res.redirect("/houses")
    } else {
      res.redirect("/houses/" + req.params.id)
    }
  })
})


module.exports = router;