const mongoose = require("mongoose");

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
  alarms: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Alarm"
    }
  ],
  created: {
    type: Date,
    default: Date.now
  }
});

hostSchema.pre("remove", async function(next) {
  try {
    const house = await db.House.findById(this.house.id);
    await house.hosts.remove(this._id);
    await house.save();

    return next();
  } catch (err) {
    return next(err);
  }
});
module.exports = mongoose.model("Host", hostSchema);
