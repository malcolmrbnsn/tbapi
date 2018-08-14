const fs = require("fs");

var middlewareObj = {};

middlewareObj.checkDirectorySync = directory => {
  try {
    fs.statSync(directory);
  } catch (e) {
    fs.mkdirSync(directory);
  }
};

middlewareObj.validateIPAddr = hostname => {
  const ipformat = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  // Some regex i found online
  if (!hostname.match(ipformat)) {
    return false;
  }
  // Check length is in normal ipv4 length range
  if (hostname.length >= 7 && hostname.length <= 15) {
    return true;
  }

  return false;
};

middlewareObj.validateAlarm = alarm => {
  if (!alarm.dow) {
    req.flash("error", "You must select at least one day!");

    return res.redirect("back");
  }
  if (!alarm.hosts) {
    req.flash("error", "You need to select at least one host!");

    return res.redirect("back");
  }
};

module.exports = middlewareObj;
