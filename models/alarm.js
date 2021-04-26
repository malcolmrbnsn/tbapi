const mongoose = require("mongoose"),
  db = require("./index");

var alarmSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  minute: {
    type: Number,
    required: true
  },
  hour: {
    type: Number,
    required: true
  },
  dow: [Number],
  house: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "House",
      required: true
    }
  },
  hosts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Host"
    }
  ],
  file: {
    url: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    fullpath: {
      type: String,
      required: true
    }
  },
  sound: {
    type: String,
    required: true
  },
  soundId: {
    type: String,
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  created: {
    type: Date,
    default: Date.now
  },
  active: {
    type: Boolean,
    default: true,
    required: true
  }
});

alarmSchema.pre("remove", async function(next) {
  try {
    const house = await db.House.findById(this.house.id);
    await house.alarms.remove(this._id);
    await house.save();

    return next();
  } catch (err) {
    return next(err);
  }
});

module.exports = mongoose.model("Alarm", alarmSchema);
