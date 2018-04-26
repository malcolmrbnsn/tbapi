var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");
var middleware = require('../middleware')

//root route
router.get("/", function(req, res) {
  res.render("landing");
});

// show register form
router.get("/register", function(req, res) {
  res.render("register");
});

//handle sign up logic
router.post("/register", function(req, res) {
  var newUser = new User({
    username: req.body.username
  });
  if (req.body.signupCode === process.env.ADMINKEY) {
    newUser.isAdmin = true;
  } else if (req.body.signupCode === process.env.USERKEY) {
    newUser.isAdmin = false;
  } else {
    req.flash("error", "Signup Code is incorrect");
    return res.redirect("back")
  }
  User.register(newUser, req.body.password, function(err, user) {
    if (err) {
      console.log(err);
      return res.render("register", {
        error: err.message
      });
    }
    passport.authenticate("local")(req, res, function() {
      req.flash("success", "Successfully Signed Up!");
      res.redirect("/houses");
    });
  });
});

//show login form
router.get("/login", function(req, res) {
  res.render("login", {
    page: 'login'
  });
});

//handling login logic
router.post("/login", passport.authenticate("local", {
  successRedirect: "/houses",
  failureRedirect: "/login",
  failureFlash: true,
  successFlash: "Welcome back!"
}), function(req, res) {});

// logout route
router.get("/logout", function(req, res) {
  req.logout();
  req.flash("success", "Logged Out!");
  res.redirect("/houses");
});

module.exports = router;