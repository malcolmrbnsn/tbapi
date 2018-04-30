const mongoose = require('mongoose');

var alarmSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  minute: Number,
  hour: Number,
  sound: {
    type: String
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