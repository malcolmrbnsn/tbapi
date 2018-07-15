const db = require("../models"),
  middleware = require('../middleware'),
  {
    validateIPAddr
  } = middleware

exports = {}

exports.newHost = (req, res) => {
  // Make sure house exists
  console.log(req.params)
  db.House.findById(req.params.id).
  then((house) => {
    if (!house) {
      const err = {
        message: "House could not be found"
      }
      req.flash("error", err.message);
      console.log(err.message);

      return res.redirect('/houses');
    }
    res.render("hosts/new", {
      house,
      pageName: "New Host"
    });
  }).
  catch(err => {
    req.flash("error", err.message);
    console.log(err.message);

    return res.redirect('back');
  })
}

exports.createHost = (req, res) => {
  // Find house to add host to
  db.House.findById(req.params.id).
  then(house => {
    if (!house) {
      const err = {
        message: "House could not be found"
      }
      console.log(err.message);

      return res.redirect('back');
    }
    // Create the host
    db.Host.create(req.body.host).
    then(host => {
      if (!validateIPAddr(req.body.host.hostname)) {
        console.log("Not valid hostname");
        req.flash("error", "You must enter a valid IP Address!")

        return res.redirect("back")
      }
      // Link to house
      host.house.id = req.params.id;
      // Save host
      host.save();
      // Link to house and save
      house.hosts.push(host);
      house.save();
      res.redirect("/houses/" + req.params.id)
    }).
    catch(err => {
      req.flash("error", err.message)
      console.log(err.message)

      return res.redirect('back');
    })
  }).
  catch((err) => {
    req.flash("error", err.message)
    console.log(err.message)

    return res.redirect('back');
  })
}

exports.editHost = (req, res) => {
  // Make sure house exists
  db.House.findById(req.params.id).
  then(house => {
    if (!house) {
      console.log(err);
      req.flash("error", "An error occured")

      return res.redirect('back');
    }

    db.Host.findById(req.params.host_id).
    then(host => {
      res.render("hosts/edit", {
        house,
        host,
        pageName: "Edit Host"
      });
    }).
    catch(err => {
      console.log(err.message);
      req.flash("error", "An error occured")

      return res.redirect('back');
    })
  }).
  catch(err => {
    console.log(err.message);
    req.flash("error", "An error occured")

    return res.redirect('back');
  })
}

exports.updateHost = (req, res) => {
  // Check ip address
  if (validateIPAddr(req.body.host.hostname) === false) {
    console.log("Not valid hostname");
    req.flash("error", "You must enter a valid IP Address!")

    return res.redirect("back")
  }
  // Update the host
  db.Host.findByIdAndUpdate(req.params.host_id, req.body.host).
  then(() => {
    req.flash("success", "Host updated")
    res.redirect("/houses/" + req.params.id)
  }).
  catch(err => {
    // HACK: Should check what the error is
    req.flash("error", "Hostname must be unique")
    console.log(err)

    return res.redirect('back');
  });
}

// Delete
exports.deleteHost = (req, res) => {
  const host = req.params.host_id
  db.Host.findByIdAndRemove(host).
  then(() => {
    db.House.findById(req.params.id).
    then(house => {
      const hosts = house.hosts.filter(h => h.toString() !== host);
      house.hosts = hosts;
      house.save();
      console.log("Host deleted")
      res.redirect("/houses/" + req.params.id);
    }).
    catch(err => {
      console.log(err.message);
      req.flash("error", err.message);

      return res.redirect('back');
    })
  }).
  catch(err => {
    console.log(err.message);
    req.flash("error", err.message);

    return res.redirect('back');
  })
}

module.exports = exports;
