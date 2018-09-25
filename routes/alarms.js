const express = require("express"),
  router = express.Router({
    mergeParams: true
  }),
  helpers = require("../helpers/alarms"),
  middleware = require("../middleware"),
  auth = require("../middleware/auth"),
  { checkDirectorySync } = middleware,
  { isLoggedIn } = auth;

// Check sound directory exists
checkDirectorySync(process.env.SOUND_DIR);
// MULTER
var multer = require("multer");
var storage = multer.diskStorage({
  //Setup where the user's file will go
  destination(req, file, callback) {
    callback(null, process.env.SOUND_DIR);
  },
  filename(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var soundFilter = function(req, file, cb) {
  // accept sound files only
  if (!file.originalname.match(/\.(wav|mp3|wma)$/i)) {
    return cb(new Error("Only sound files are allowed!"), false);
  }
  cb(null, true);
};
var upload = multer({
  storage,
  fileFilter: soundFilter
});

// New
router.get("/new", isLoggedIn, helpers.newAlarm);

// Create
router.post("/", isLoggedIn, upload.single("sound"), helpers.createAlarm);

router
  .route("/:alarm_id")
  .put(isLoggedIn, upload.single("sound"), helpers.updateAlarm)
  .delete(isLoggedIn, helpers.deleteAlarm);

//Edit
router.get("/:alarm_id/edit", isLoggedIn, helpers.editAlarm);

module.exports = router;
