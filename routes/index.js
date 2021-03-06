const express = require("express"),
  router = express.Router(),
  passport = require("passport"),
  helpers = require("../helpers");

// Show landing page
router.get("/", helpers.showLanding);

// Register get and post
router
  .route("/register")
  .get(helpers.newUser)
  .post(helpers.createUser);

// Login get and post
router
  .route("/login")
  .get(helpers.showLogin)
  .post(
    passport.authenticate("local", {
      successRedirect: "/houses",
      failureRedirect: "/login",
      failureFlash: true,
      successFlash: "Welcome back!"
    })
  );

// Logout
router.get("/logout", helpers.logoutUser);

module.exports = router;
