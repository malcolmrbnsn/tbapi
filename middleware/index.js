var middlewareObj = {};

middlewareObj.isLoggedIn = function(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash("error", "You must be signed in to do that!");
  res.redirect("/login");
}

middlewareObj.isAdmin = function(req, res, next) {
  if (req.user.isAdmin === true) {
    next();
  } else {
    req.flash('error', 'You must be an administrator to do that!');
    res.redirect('/houses');
  }
}

module.exports = middlewareObj;