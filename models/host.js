const mongoose = require('mongoose');

var hostSchema = new mongoose.Schema({
  hostname: {
    type: String,
    unique: true
  },
  name: String,
  house: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "House"
    }
  },
  alarms: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Alarm"
  }],
  created: {
    type: Date,
    default: Date.now
  }
});
module.exports = mongoose.model("Host", hostSchema);