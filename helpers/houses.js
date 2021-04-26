const db = require("../models");

// Cloundinary
const cloudinary = require("cloudinary");
cloudinary.config({
  cloud_name: "tbapi",
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const eagerOptions = {
  gravity: "center",
  height: 1000,
  quality: "auto",
  width: 600,
  crop: "thumb"
};

exports = {};

const populateQuery = [
  {
    path: "hosts"
  },
  {
    path: "alarms",
    populate: {
      path: "hosts"
    },
    options: {
      sort: {
        hour: +1,
        minute: +1
      }
    }
  }
];

// Index
exports.getHouses = async (req, res, next) => {
  try {
    const houses = await db.House.find({});

    return res.render("houses/index", {
      houses,
      page: "index",
      pageName: "Houses"
    });
  } catch (err) {
    return next(err);
  }
};

// New
exports.newHouse = (req, res) => {
  res.render("houses/new", {
    pageName: "New House"
  });
};

// Create
exports.createHouse = async (req, res, next) => {
  try {
    const result = await cloudinary.v2.uploader.upload(req.file.path, {
      eager: eagerOptions
    });

    // add cloudinary url for the image to the house object under image property
    req.body.house.image = result.eager[0].secure_url;

    // add image's public_id to house object
    req.body.house.imageId = result.public_id;

    // add author to house
    req.body.house.author = req.user._id;

    const house = await db.House.create(req.body.house);
    req.flash("success", "House created");

    return res.redirect("/houses/" + house._id);
  } catch (err) {
    return next(err);
  }
};

// Show
exports.showHouse = async (req, res, next) => {
  try {
    const house = await db.House.findById(req.params.id).populate(
      populateQuery
    );

    return res.render("houses/show", {
      house,
      pageName: house.name
    });
  } catch (err) {
    return next(err);
  }
};

// Edit
exports.editHouse = async (req, res, next) => {
  try {
    const house = await db.House.findById(req.params.id);

    return res.render("houses/edit", {
      house,
      pageName: "Edit House"
    });
  } catch (err) {
    return next(err);
  }
};

// Update
exports.updateHouse = async (req, res, next) => {
  try {
    const house = await db.House.findById(req.params.id);
    if (req.file) {
      await cloudinary.v2.uploader.destroy(imageId);
      const result = await cloudinary.v2.uploader.upload(req.file.path, {
        eager: eagerOptions
      });
      house.imageId = result.public_id;
      house.image = result.eager[0].secure_url;
    }
    house.name = req.body.house.name;
    house.save();
    req.flash("success", "Successfully Updated!");

    return res.redirect("/houses/" + house._id);
  } catch (err) {
    return next(err);
  }
};

// Delete
exports.deleteHouse = async (req, res, next) => {
  try {
    const house = await db.House.findById(req.params.id);
    await cloudinary.v2.uploader.destroy(house.imageId);
    req.flash("success", "House deleted successfully!");
    house.remove();

    return res.redirect("/houses");
  } catch (err) {
    return next(err);
  }
};

module.exports = exports;
