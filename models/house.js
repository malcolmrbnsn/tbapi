const mongoose = require("mongoose");

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
module.exports = mongoose.model("House", houseSchema);
