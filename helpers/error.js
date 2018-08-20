// eslint-disable-line
function errorHandler(error, req, res, next) {
  req.flash("error", error.message);
  console.log(error);

  if (req.isAuthenticated()) {
    return res.redirect("/houses");
  }

  return res.redirect("/");
}

module.exports = errorHandler;
