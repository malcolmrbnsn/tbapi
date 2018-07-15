var express = require("express"),
  router = express.Router({
    mergeParams: true
  }),
  helpers = require("../helpers/api")

  // show json
router.get("/hosts/:hostname", helpers.getHost)

module.exports = router;
