var mongoose = require("mongoose");

var houseSchema = new mongoose.Schema({
  name: String,
  hosts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Host"
  }],
  alarms: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Alarm"
  }],
});
module.exports = mongoose.model("House", houseSchema);