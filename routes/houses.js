const express = require("express"),
  router = express.Router(),
  helpers = require("../helpers/houses"),
  auth = require("../middleware/auth"),
  { isLoggedIn, isAdmin } = auth;

// MULTER
var multer = require("multer");
var storage = multer.diskStorage({
  filename(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function(req, file, cb) {
  // accept image files only
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
    return cb(new Error("Only image files are allowed!"), false);
  }
  cb(null, true);
};
var upload = multer({
  storage,
  fileFilter: imageFilter
});

// Index, create
router
  .route("/")
  .get(isLoggedIn, helpers.getHouses)
  .post(isAdmin, upload.single("image"), helpers.createHouse);

// New
router.get("/new", isAdmin, (req, res) => {
  res.render("houses/new", {
    pageName: "New House"
  });
});

// Show, update, delete
router
  .route("/:id")
  .get(isLoggedIn, helpers.showHouse)
  .put(isAdmin, upload.single("image"), helpers.updateHouse)
  .delete(isAdmin, helpers.deleteHouse);

//Edit
router.get("/:id/edit", isAdmin, helpers.editHouse);

module.exports = router;
