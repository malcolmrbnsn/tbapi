const express = require("express"),
  router = express.Router({
    mergeParams: true
  }),
  Host = require("../models/host"),
  House = require("../models/house"),
  middleware = require("../middleware"),
  {
    isAdmin
  } = middleware;

// New
router.get("/new", isAdmin, function(req, res) {
  House.findById(req.params.id, function(err, house) {
    if (err) {
      req.flash("error", err.message)
      console.log(err.message)
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
      console.log(err.message)
      return res.redirect('/houses');
    } else {
      Host.create(req.body.host, function(err, host) {
        if (err) {
          console.log(err);
          // HACK: Should check what the error is
          req.flash("error", "Hostname must be unique")
          console.log("Not unique hostname")
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
      console.log(err);
      req.flash("error", "An error occured")
      return res.redirect('back');
    } else {
      Host.findById(req.params.host_id, function(err, host) {
        if (err) {
          console.log(err);
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
  Host.findByIdAndUpdate(req.params.host_id.body.host, function(err) {
    if (err) {
      console.log(err)
      req.flash("error", "Hostname must be unique")
      return res.redirect('back');
    } else {
      console.log("Host updated")
      res.redirect("/houses/" + req.params.id);
    }
  });
});

// Delete
router.delete("/:host_id", isAdmin, function(req, res) {
  Host.findByIdAndRemove(req.params.host_id, function(err) {
    if (err) {
      console.log(err);
      return res.redirect('/houses');
    } else {
      console.log("Host deleted")
      res.redirect("/houses/" + req.params.id);
    }
  });
});


module.exports = router;