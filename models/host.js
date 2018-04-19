const mongoose = require('mongoose');

var hostSchema = new mongoose.Schema({
  hostname: String,
  house: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "House"
    },
    name: String
  },
  alarms: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Alarm"
  }],
  active: {
    type: Boolean,
    default: true
  },
  created: {
    type: Date,
    default: Date.now
  }
});
module.exports = mongoose.model("Host", hostSchema);