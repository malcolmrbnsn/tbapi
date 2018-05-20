const express = require("express"),
  router = express.Router({
    mergeParams: true
  }),
  Host = require("../models/host"),
  House = require("../models/house"),
  rollbar = require("../middleware/rollbar"),
  middleware = require("../middleware"),
  {
    isLoggedIn,
    isAdmin
  } = middleware;

// New
router.get("/new", isAdmin, function(req, res) {
  House.findById(req.params.id, function(err, house) {
    if (err) {
      req.flash("error", err.message)
      rollbar.error(err.message, req)
      return res.redirect('/houses');
    } else {
      res.render("hosts/new", {
        house: house,
        pageName: "New Host"
      });
    }
  });
});

// Create
router.post("/", isAdmin, function(req, res) {
  House.findById(req.params.id, function(err, house) {
    if (err) {
      rollbar.error(err.message, req)
      return res.redirect('/houses');
    } else {
      Host.create(req.body.host, function(err, host) {
        if (err) {
          rollbar.error(err, req);
          // HACK: Should check what the error is
          req.flash("error", "Hostname must be unique")
          rollbar.warning("Not unique hostname", req)
          return res.redirect('back');
        } else {
          var ipformat = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
          if (!req.body.host.hostname.match(ipformat)) {
            req.flash("error", "You must enter a valid IP Address!")
            return res.redirect("back")
          }
          // Link to house
          host.house.id = req.params.id;
          // Save host
          host.save();
          // Link to house and save
          house.hosts.push(host);
          house.save();
          res.redirect("/houses/" + req.params.id)
        }
      });
    }
  });
});

//Edit
router.get("/:host_id/edit", isAdmin, function(req, res) {
  House.findById(req.params.id, function(err, house) {
    if (err) {
      rollbar.error(err, req);
      req.flash("error", "An error occured")
      return res.redirect('back');
    } else {
      Host.findById(req.params.host_id, function(err, host) {
        if (err) {
          rollbar.error(err, req);
        } else {
          res.render("hosts/edit", {
            house: house,
            host: host,
            pageName: "Edit Host"
          });
        }
      });
    }
  });
});

// Update
router.put("/:host_id", isAdmin, function(req, res) {
  Host.findByIdAndUpdate(req.params.host_id, req.body.host, function(err, host) {
    if (err) {
      rollbar.error(err)
      req.flash("error", "Hostname must be unique")
      return res.redirect('back');
    } else {
      rollbar.log("Host updated", req)
      res.redirect("/houses/" + req.params.id);
    }
  });
});

// Delete
router.delete("/:host_id", isAdmin, function(req, res) {
  Host.findByIdAndRemove(req.params.host_id, function(err) {
    if (err) {
      rollbar.error(err, req);
      return res.redirect('/houses');
    } else {
      rollbar.log("Host deleted", req)
      res.redirect("/houses/" + req.params.id);
    }
  });
});


module.exports = router;