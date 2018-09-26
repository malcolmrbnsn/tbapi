const db = require("../models"),
  passport = require("passport");

exports = {};

exports.showLanding = (req, res) => {
  res.render("landing", {
    page: "landing"
  });
};

exports.newUser = (req, res) => {
  res.render("register", {
    page: "register",
    pageName: "Register"
  });
};

exports.createUser = (req, res) => {
  var newUser = new db.User({
    username: req.body.username,
    email: req.body.email
  });
  if (req.body.signupCode === process.env.ADMINKEY) {
    newUser.isAdmin = true;
  } else if (req.body.signupCode === process.env.USERKEY) {
    newUser.isAdmin = false;
  } else {
    console.log("Incorrect signup code");
    req.flash("error", "Signup Code is incorrect");

    return res.redirect("back");
  }
  db.User.register(newUser, req.body.password)
    .then(() => {
      passport.authenticate("local")(req, res, () => {
        req.flash("success", "Successfully Signed Up!");
        console.log("User successfully signed up");
        res.redirect("/houses");
      });
    })
    .catch(err => {
      console.log(err);

      return res.render("register", {
        error: err.message
      });
    });
};

exports.showLogin = (req, res) => {
  res.render("login", {
    page: "login",
    pageName: "Login"
  });
};

exports.logoutUser = (req, res) => {
  req.logout();
  req.flash("success", "Logged Out!");
  res.redirect("/");
};
module.exports = exports;
