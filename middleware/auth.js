var exports = {};

exports.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash("error", "Please log in first");

  return res.redirect("/login");
};

exports.isAdmin = (req, res, next) => {
  if (req.isAuthenticated()) {
    if (req.user.isAdmin === true) {
      return next();
    }
    req.flash("error", "You don't have the correct permissions to access that");

    return res.redirect("/login");
  }
  req.flash("error", "Please log in first");

  return res.redirect("/login");
};

module.exports = exports;
