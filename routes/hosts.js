const express = require("express"),
  router = express.Router({
    mergeParams: true
  }),
  helpers = require("../helpers/hosts");
(auth = require("../middleware/auth")), ({ isAdmin } = auth);

// New
router.get("/new", isAdmin, helpers.newHost);

// Create
router.post("/", isAdmin, helpers.createHost);

//Edit
router.get("/:host_id/edit", isAdmin, helpers.editHost);

// Update, delete
router
  .route("/:host_id")
  .put(isAdmin, helpers.updateHost)
  .delete(isAdmin, helpers.deleteHost);

module.exports = router;
