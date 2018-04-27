const mongoose = require('mongoose');

var alarmSchema = new mongoose.Schema({
  name: String,
  file: String,
  minute: Number,
  hour: Number,
  sound: {
    type: String,
    required: true
  },
  dow: [],
  house: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "House"
    }
  },
  hosts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Host"
  }],
  created: {
    type: Date,
    default: Date.now
  },
  active: {
    type: Boolean,
    default: true
  }
});
module.exports = mongoose.model("Alarm", alarmSchema);