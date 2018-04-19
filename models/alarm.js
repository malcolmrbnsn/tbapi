const mongoose = require('mongoose');

var alarmSchema = new mongoose.Schema({
  name: String,
  file: String,
  minute: Number,
  hour: Number,
  dow: {
    mon: Boolean,
    tue: Boolean,
    wed: Boolean,
    thu: Boolean,
    fri: Boolean,
    sat: Boolean,
    sun: Boolean
  },
  house: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "House"
    },
    name: String
  },
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