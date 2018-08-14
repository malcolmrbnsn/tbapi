const db = require("../models"),
  middleware = require("../middleware"),
  { validateIPAddr } = middleware;

exports = {};

exports.newHost = async (req, res, next) => {
  try {
    const house = await db.House.findById(req.params.id);

    return res.render("hosts/new", {
      house,
      pageName: "New Host"
    });
  } catch (err) {
    return next(err);
  }
};

exports.createHost = async (req, res, next) => {
  try {
    const house = await db.House.findById(req.params.id);
    const host = await db.Host.create(req.body.host);
    if (!validateIPAddr(req.body.host.hostname)) {
      throw new Error({
        message: "Invalid hostname format"
      });
    }
    // Link to house
    host.house.id = req.params.id;
    // Save host
    host.save();
    // Link to house and save
    house.hosts.push(host);
    house.save();

    return res.redirect("/houses/" + req.params.id);
  } catch (err) {
    return next(err);
  }
};

exports.editHost = async (req, res, next) => {
  try {
    const house = await db.House.findById(req.params.id);
    const host = await db.Host.findById(req.params.host_id);

    return res.render("hosts/edit", {
      house,
      host,
      pagename: "Edit Host"
    });
  } catch (err) {
    return next(err);
  }
};

exports.updateHost = async (req, res, next) => {
  try {
    if (!validateIPAddr(req.body.host.hostname)) {
      throw new Error({
        message: "Invalid hostname format"
      });
    }
    await db.Host.findByIdAndUpdate(req.params.host_id, req.body.host);
    req.flash("success", "Host updated");

    return res.redirect("/houses/" + req.params.id);
  } catch (err) {
    if (err.code === 11000) {
      err.message = "Hostname is taken";
    }

    return next(err);
  }
};

// Delete
exports.deleteHost = async (req, res, next) => {
  try {
    const host = await db.Host.findById(req.params.host_id);
    host.remove();
    req.flash("success", "Host deleted");

    return res.redirect("/houses/" + req.params.id);
  } catch (err) {
    return next(err);
  }
};

module.exports = exports;
