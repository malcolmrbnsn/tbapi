const express = require("express"),
  router = express.Router(),
  passport = require("passport"),
  User = require("../models/user"),
  async = require("async"),
  nodemailer = require("nodemailer"),
  crypto = require("crypto"),
  rollbar = require("../middleware/rollbar")

//root route
router.get("/", function(req, res) {
  res.render("landing", {
    page: 'landing'
  });
});

// show register form
router.get("/register", function(req, res) {
  res.render("register", {
    page: 'register',
    pageName: "Register"
  });
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
    rollbar.warning("Incorrect signup code", req)
    req.flash("error", "Signup Code is incorrect");
    return res.redirect("back")
  }
  User.register(newUser, req.body.password, function(err) {
    if (err) {
      rollbar.error(err);
      return res.render("register", {
        error: err.message
      });
    }
    passport.authenticate("local")(req, res, function() {
      req.flash("success", "Successfully Signed Up!");
      rollbar.log("User successfully signed up", req)
      res.redirect("/houses");
    });
  });
});

//show login form
router.get("/login", function(req, res) {
  res.render("login", {
    page: 'login',
    pageName: "Login"
  });
});

//handling login logic
router.post("/login", passport.authenticate("local", {
  successRedirect: "/houses",
  failureRedirect: "/login",
  failureFlash: true,
  successFlash: "Welcome back!"
}));

// logout route
router.get("/logout", function(req, res) {
  req.logout();
  req.flash("success", "Logged Out!");
  res.redirect("/");
});

// forgot password
router.get('/forgot', function(req, res) {
  res.render('forgot', {
    pageName: "Forgot Password"
  });
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
        rollbar.log('mail sent');
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
      token: req.params.token,
      pageName: "Password Reset"
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
          user.setPassword(req.body.password, () => {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            user.save(() => {
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
        subject: 'Your password for TBAPi has been changed',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        req.flash('success', 'Success! Your password has been changed.');
        rollbar.log("User changed password", req)
        done(err);
      });
    }
  ], () => {
    res.redirect('/houses');
  });
});

module.exports = router;