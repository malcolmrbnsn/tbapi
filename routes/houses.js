var express = require("express");
var router = express.Router(),
  fs = require("fs-extra"),
  multer = require('multer'),
  House = require("../models/house"),
  middleware = require("../middleware");
var {
  isLoggedIn,
  isAdmin
} = middleware;

// Multer
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
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

// Index
router.get("/", isLoggedIn, function(req, res) {
  House.find({}, function(err, allHouses) {
    if (err) {
      console.log(err)
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
// // Create
// router.post("/", isAdmin, function(req, res) {
//   var form = new formidable.IncomingForm();
//   //Formidable uploads to operating systems tmp dir by default
//   form.uploadDir = "./public/img"; //set upload directory
//   form.keepExtensions = true; //keep file extension
//
//   form.parse(req, function(err, fields, files) {
//     console.log("form.bytesReceived");
//     //TESTING
//     console.log("file size: " + JSON.stringify(files.fileUploaded.size));
//     console.log("file path: " + JSON.stringify(files.fileUploaded.path));
//     console.log("file name: " + JSON.stringify(files.fileUploaded.name));
//     console.log("file type: " + JSON.stringify(files.fileUploaded.type));
//     console.log("lastModifiedDate: " + JSON.stringify(files.fileUploaded.lastModifiedDate));
//     fs.rename(files.fileUploaded.path, './public/img/' + files.fileUploaded.name, function(err) {
//       if (err)
//         throw err;
//       console.log('renamed complete');
//     });
//     var house = {
//       name: fields.name,
//       img: files.fileUploaded.name
//     }
//     House.create(house, function(err, newlyCreated) {
//       if (err) {
//         console.log(err)
//       } else {
//         res.redirect("/houses")
//       }
//     })
//   })
// })
// Create
router.post("/", isAdmin, upload.single('image'), function(req, res) {
  eval(require("locus"))
  // var house = {
  //   name: fields.name,
  //   img: files.fileUploaded.name
  // }
  // House.create(house, function(err, newlyCreated) {
  //   if (err) {
  //     console.log(err)
  //   } else {
  //     res.redirect("/houses")
  //   }
  // })
})
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
      console.log(err);
      return res.redirect('/houses');
    }
    console.log(foundHouse)
    res.render("houses/show", {
      house: foundHouse
    });
  });
});

//Edit
router.get("/:id/edit", isAdmin, function(req, res) {
  House.findById(req.params.id, function(err, house) {
    if (err) {
      console.log(err)
      res.flash("error", "An error occured")
      return res.redirect('/houses');
    } else {
      console.log(house);
      res.render("houses/edit", {
        house: house
      })
    }
  })
})

// Update
router.put("/:id", isAdmin, function(req, res) {
  var form = new formidable.IncomingForm();
  //Formidable uploads to operating systems tmp dir by default
  form.uploadDir = "./public/img"; //set upload directory
  form.keepExtensions = true; //keep file extension

  form.parse(req, function(err, fields, files) {
    console.log(files.size)
    if (files.size > 0) {

      fs.rename(files.fileUploaded.path, './public/img/' + files.fileUploaded.name, function(err) {
        if (err)
          throw err;
      });
      var house = {
        name: fields.name,
        img: files.fileUploaded.name
      }
    } else {
      var house = {
        name: fields.name
      }
    }
    House.findByIdAndUpdate(req.params.id, house, function(err, house) {
      if (err) {
        console.log(err)
        return res.redirect('/houses');
      } else {
        res.redirect("/houses/" + req.params.id)
      }
    })
  })
})

// Delete
router.delete("/:id", isAdmin, function(req, res) {
  House.findByIdAndRemove(req.params.id, function(err) {
    if (err) {
      console.log(err);
      res.redirect("/houses")
    } else {
      res.redirect("/houses")
    }
  })
})

module.exports = router;