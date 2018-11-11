const express = require("express"),
  router = express.Router(),
  helpers = require("../helpers/options"),
  auth = require("../middleware/auth"),
  { isAdmin } = auth;

router.get("/", isAdmin, helpers.showOptions);

module.exports = router;
