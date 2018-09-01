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

exports.clientAuth = (req, res, next) => {
  if (
    req.headers.authorization &&
    req.headers.authorization === process.env.API_KEY
  ) {
    return next();
  }

  return res.status(401).json({
    error: "API Token incorrect"
  });
};

module.exports = exports;
