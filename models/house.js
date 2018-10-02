const mongoose = require("mongoose"),
  Host = require("./host"),
  Alarm = require("./alarm");

var houseSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true
  },
  image: String,
  imageId: String,
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
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
    if (house.hosts) {
      house.hosts.forEach(host => {
        Host.findByIdAndRemove(host._id);
      });
    }
    if (house.alarms) {
      house.alarms.forEach(alarm => {
        Alarm.findByIdAndRemove(alarm);
      });
    }

    return next();
  } catch (err) {
    return next(err);
  }
});

module.exports = mongoose.model("House", houseSchema);
