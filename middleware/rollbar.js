var Rollbar = require("rollbar");
var rollbar = new Rollbar({
  accessToken: '3186dddb91ea4c0db986150bd3a37afa',
  captureUncaught: true,
  captureUnhandledRejections: true
});

module.exports = rollbar;