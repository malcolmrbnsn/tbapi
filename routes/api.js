var express = require("express"),
  router = express.Router({
    mergeParams: true
  }),
  helpers = require("../helpers/api"),
  { clientAuth } = require("../middleware/auth");

// show json
router.get("/hosts/:hostname", clientAuth, helpers.getHost);

module.exports = router;
