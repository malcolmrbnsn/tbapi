const mongoose = require('mongoose');

var alarmSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  minute: Number,
  hour: Number,
  dow: [],
  house: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "House"
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
      type: String
    },
    name: {
      type: String
    },
    fullpath: {
      type: String
    }
  },
  sound: {
    type: String
  },
  soundId: String,
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
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

alarmSchema.pre("remove", async function(next) {
  try {
    const house = await db.House.findById(this.house.id)
    await house.alarms.remove(this._id)
    await house.save()

    return next()
  } catch (err) {
     return next(err)
  }
})

module.exports = mongoose.model("Alarm", alarmSchema);
