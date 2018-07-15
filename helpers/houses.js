const db = require("../models")

// Cloundinary
var cloudinary = require('cloudinary');
cloudinary.config({
  cloud_name: 'tbapi',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const eagerOptions = {
  gravity: "center",
  height: 1000,
  quality: "auto",
  width: 600,
  crop: "thumb"
}


exports = {}

const populateQuery = [
  {
    path: 'hosts'
  },
  {
    path: 'alarms',
    populate: {
      path: 'hosts'
    }
  }
];

// Index
exports.getHouses = (req, res) => {
  db.House.find({}).
  then((houses) => {
    res.render("houses/index", {
      houses,
      page: 'index',
      pageName: "Houses"
    });
  }).
  catch((err) => {
    console.log(err);
  })
}

// New
exports.newHouse = (req, res) => {
  res.render("houses/new", {
    pageName: "New House"
  });
}

// Create
exports.createHouse = (req, res) => {
  cloudinary.v2.uploader.upload(req.file.path, {
    eager: eagerOptions
  }).
  then(result => {
    // add cloudinary url for the image to the house object under image property
    req.body.house.image = result.eager[0].secure_url;
    // add image's public_id to house object
    req.body.house.imageId = result.public_id;
    // add author to house
    req.body.house.author = req.user._id;
    db.House.create(req.body.house).
    then(() => {
      res.redirect('/houses');
    }).
    catch(err => {
      console.log(err);
      req.flash('error', err.message);

return res.redirect('back');
    })
  }).
  catch(err => {
    console.log(err);
    req.flash('error', err.message);

return res.redirect('back');
  })
}

// Show
exports.showHouse = (req, res) => {
  db.House.findById(req.params.id).
  populate(populateQuery).
  then(house => {
    res.render("houses/show", {
      house,
      pageName: house.name
    });
  }).
  catch((err) => {
    console.log(err);
    req.flash("err", err)

    return res.redirect('/houses');
  })
}

// Edit
exports.editHouse = (req, res) => {
  db.House.findById(req.params.id).
  then(house => {
    res.render("houses/edit", {
      house,
      pageName: "Edit House"
    });
  }).
  catch((err) => {
    res.flash("error", "An error occured");
    console.log(err);

    return res.redirect('/houses');
  })
}

// Update
exports.updateHouse = (req, res) => {
  db.House.findById(req.params.id).
  then(async function (house) {
    if (req.file) {
      try {
        await cloudinary.v2.uploader.destroy(house.imageId);
        var result = await cloudinary.v2.uploader.upload(req.file.path, {
          eager: eagerOptions
        });
        house.imageId = result.public_id;
        house.image = result.eager[0].secure_url;
      } catch (err) {
        req.flash("error", err.message);
        console.log(err.message);

        return res.redirect("back");
      }
    }
    house.name = req.body.house.name;
    house.save();
    console.log("House updated");
    req.flash("success", "Successfully Updated!");
    res.redirect("/houses/" + house._id);
  }).
  catch((err) => {
    req.flash("error", err.message);
    console.log(err.message);
    res.redirect("back");
  })
}

// Delete
exports.deleteHouse = (req, res) => {
  db.House.findById(req.params.id).
  populate(populateQuery).
  then(async house => {
    try {
      house.hosts.forEach(host => {
        db.Host.findByIdAndRemove(host._id)
      })
      house.alarms.forEach(alarm => {
        alarm.findByIdAndRemove(alarm)
      });
      await cloudinary.v2.uploader.destroy(house.imageId);
    } catch (error) {
      req.flash("error", err.message);
      console.log(err.message)

      return res.redirect("back");
    }
    house.remove();
  })

  req.flash('success', 'House deleted successfully!');
  console.log("House deleted");
  res.redirect('/houses');
}

module.exports = exports;
