const mongoose = require("mongoose"),
  Host = require("./host"),
  Alarm = require("./alarm");

var houseSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  imageId: {
    type: String,
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  hosts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Host"
    }
  ],
  alarms: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Alarm"
    }
  ]
});

houseSchema.pre("remove", function(next) {
  try {
    if (this.hosts) {
      this.hosts.forEach(host => {
        Host.findByIdAndRemove(host._id);
      });
    }
    if (this.alarms) {
      this.alarms.forEach(alarm => {
        Alarm.findByIdAndRemove(alarm);
      });
    }

    return next();
  } catch (err) {
    return next(err);
  }
});

module.exports = mongoose.model("House", houseSchema);
