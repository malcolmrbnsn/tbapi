const fs = require("fs")

var middlewareObj = {};

middlewareObj.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {

    return next();
  }
  req.flash("error", "You must be signed in to do that!");
  console.log("No Login error");
  res.redirect("/login");
}

middlewareObj.isAdmin = (req, res, next) => {
  if (req.isAuthenticated()) {
    if (req.user.isAdmin === true) {
      return next();
    }
      req.flash('error', 'You must be an administrator to do that!');
      console.log("Not Admin error")

return res.redirect('/houses');
  }
  req.flash("error", "You must be signed in to do that!");
  res.redirect("/login");
}

middlewareObj.checkDirectorySync = (directory) => {
  try {
    fs.statSync(directory);
  } catch (e) {
    fs.mkdirSync(directory);
  }
}

middlewareObj.validateIPAddr = (hostname) => {
  const ipformat = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  // Some regex i found online
  if (!hostname.match(ipformat)) {
    req.flash("error", "You must enter a valid IP Address!")

return false;
  }
  // Check length is in normal ipv4 length range
  if (hostname.length >= 7 && hostname.length <= 15) {
return true
  }

  req.flash("Hostname not valid");

return false;
}

middlewareObj.validateAlarm = (alarm) => {
  if (!alarm.dow) {
    req.flash("error", "You must select at least one day!");

    return res.redirect("back");
  }
  if (!alarm.hosts) {
    req.flash("error", "You need to select at least one host!");

    return res.redirect("back");
  }
}


module.exports = middlewareObj;
