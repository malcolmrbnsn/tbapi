var express = require("express");
var router = express.Router(),
  House = require("../models/house"),
  middleware = require("../middleware");
var {
  isLoggedIn,
  isAdmin
} = middleware;
var multer = require('multer');
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});

// Rollbar
var Rollbar = require("rollbar")
var rollbar = new Rollbar({
  accessToken: '3186dddb91ea4c0db986150bd3a37afa',
  captureUncaught: true,
  captureUnhandledRejections: true
});

var imageFilter = function(req, file, cb) {
  // accept image files only
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
    return cb(new Error('Only image files are allowed!'), false);
  }
  cb(null, true);
};
var upload = multer({
  storage: storage,
  fileFilter: imageFilter
})

var cloudinary = require('cloudinary');
cloudinary.config({
  cloud_name: 'tbapi',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

var eager_options = {
  gravity: "center",
  height: 1000,
  quality: "auto",
  width: 600,
  crop: "thumb"
}

// Index
router.get("/", isLoggedIn, function(req, res) {
  House.find({}, function(err, allHouses) {
    if (err) {
      rollbar.error(err)
    } else {
      res.render("houses/index", {
        houses: allHouses,
        page: 'index'
      })
    }
  })
})

// New
router.get("/new", isAdmin, function(req, res) {
  res.render("houses/new");
})

// Create
router.post("/", isLoggedIn, upload.single('image'), function(req, res) {
  cloudinary.v2.uploader.upload(req.file.path, {
    eager: eager_options
  }, function(err, result) {
    if (err) {
      req.flash('error', err.message);
      return res.redirect('back');
    }
    // add cloudinary url for the image to the house object under image property
    req.body.house.image = result.eager[0].secure_url;
    // add image's public_id to house object
    req.body.house.imageId = result.public_id;
    // add author to house
    req.body.house.author = req.user._id
    House.create(req.body.house, function(err, house) {
      if (err) {
        req.flash('error', err.message);
        return res.redirect('back');
      }
      res.redirect('/houses');
    });
  });
});
// Show
var populateQuery = [{
  path: 'hosts'
}, {
  path: 'alarms',
  populate: {
    path: 'hosts'
  }
}];
router.get("/:id", isLoggedIn, function(req, res) {
  House.findById(req.params.id).
  populate(populateQuery).
  exec(function(err, foundHouse) {
    if (err || !foundHouse) {
      rollbar.error(err);
      return res.redirect('/houses');
    }
    res.render("houses/show", {
      house: foundHouse
    });
  });
});

//Edit
router.get("/:id/edit", isAdmin, function(req, res) {
  House.findById(req.params.id, function(err, house) {
    if (err) {
      rollbar.error(err)
      res.flash("error", "An error occured")
      return res.redirect('/houses');
    } else {
      res.render("houses/edit", {
        house: house
      })
    }
  })
})

// Update
router.put("/:id", upload.single('image'), function(req, res) {
  House.findById(req.params.id, async function(err, house) {
    if (err) {
      req.flash("error", err.message);
      res.redirect("back");
    } else {
      if (req.file) {
        try {
          await cloudinary.v2.uploader.destroy(house.imageId);
          var result = await cloudinary.v2.uploader.upload(req.file.path, {
            eager: eager_options
          })
          house.imageId = result.public_id;
          house.image = result.eager[0].secure_url;
        } catch (err) {
          req.flash("error", err.message);
          return res.redirect("back");
        }
      }
      house.name = req.body.name;
      house.save();
      req.flash("success", "Successfully Updated!");
      res.redirect("/houses/" + house._id);
    }
  })
})

router.delete('/:id', function(req, res) {
  House.findById(req.params.id, async function(err, house) {
    if (err) {
      req.flash("error", err.message);
      return res.redirect("back");
    }
    try {
      await cloudinary.v2.uploader.destroy(house.imageId);
      house.remove();
      req.flash('success', 'House deleted successfully!');
      res.redirect('/houses');
    } catch (err) {
      if (err) {
        req.flash("error", err.message);
        return res.redirect("back");
      }
    }
  });
});

module.exports = router;