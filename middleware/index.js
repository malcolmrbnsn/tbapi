var middlewareObj = {};

middlewareObj.isLoggedIn = function(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash("error", "You must be signed in to do that!");
  console.log("No Login error");
  res.redirect("/login");
}

middlewareObj.isAdmin = function(req, res, next) {
  if (req.isAuthenticated()) {
    if (req.user.isAdmin === true) {
      return next();
    } else {
      req.flash('error', 'You must be an administrator to do that!');
      console.log("Not Admin error")
      return res.redirect('/houses');
    }
  }
  req.flash("error", "You must be signed in to do that!");
  res.redirect("/login");
}

module.exports = middlewareObj;