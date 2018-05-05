var express = require("express");
var router = express.Router();
Rollbar = require("rollbar")
var passport = require("passport");
var User = require("../models/user");
var middleware = require('../middleware')
var async = require("async");
var nodemailer = require("nodemailer");
var crypto = require("crypto");
var rollbar = new Rollbar("3186dddb91ea4c0db986150bd3a37afa");

//root route
router.get("/", function(req, res) {
  res.render("landing", {
    page: 'landing'
  });
});

// show register form
router.get("/register", function(req, res) {
  res.render("register", {
    page: 'register'
  })
});

//handle sign up logic
router.post("/register", function(req, res) {
  var newUser = new User({
    username: req.body.username,
    email: req.body.email
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
  res.redirect("/");
});

// forgot password
router.get('/forgot', function(req, res) {
  res.render('forgot');
});

router.post('/forgot', function(req, res, next) {
  async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
      User.findOne({
        email: req.body.email
      }, function(err, user) {
        if (!user) {
          req.flash('error', 'No account with that email address exists.');
          return res.redirect('/forgot');
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        user.save(function(err) {
          done(err, token, user);
        });
      });
    },
    function(token, user, done) {
      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: process.env.GMAIL_USERNAME,
          pass: process.env.GMAIL_PASSWORD
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'calumrobinson9@gmail.com',
        subject: 'TBAPi Password Reset',
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + '/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        console.log('mail sent');
        req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
        done(err, 'done');
      });
    }
  ], function(err) {
    if (err) return next(err);
    res.redirect('/forgot');
  });
});

router.get('/reset/:token', function(req, res) {
  User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: {
      $gt: Date.now()
    }
  }, function(err, user) {
    if (!user) {
      req.flash('error', 'Password reset token is invalid or has expired.');
      return res.redirect('/forgot');
    }
    res.render('reset', {
      token: req.params.token
    });
  });
});

router.post('/reset/:token', function(req, res) {
  async.waterfall([
    function(done) {
      User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: {
          $gt: Date.now()
        }
      }, function(err, user) {
        if (!user) {
          req.flash('error', 'Password reset token is invalid or has expired.');
          return res.redirect('back');
        }
        if (req.body.password === req.body.confirm) {
          user.setPassword(req.body.password, function(err) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            user.save(function(err) {
              req.logIn(user, function(err) {
                done(err, user);
              });
            });
          })
        } else {
          req.flash("error", "Passwords do not match.");
          return res.redirect('back');
        }
      });
    },
    function(user, done) {
      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: process.env.GMAIL_USERNAME,
          pass: process.env.PASSWORD
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'calumrobinson9@gmail.com',
        subject: 'Your password has been changed',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        req.flash('success', 'Success! Your password has been changed.');
        done(err);
      });
    }
  ], function(err) {
    res.redirect('/houses');
  });
});

module.exports = router;