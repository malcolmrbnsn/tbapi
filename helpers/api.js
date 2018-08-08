const db = require("../models"),
  middleware = require("../middleware"),
  {
    validateIPAddr
  } = middleware

exports = {}

exports.getHost = async (req, res) => {
  try {
    const {
      hostname
    } = req.params;
    // sanatise ip address
    if (!validateIPAddr(hostname)) {
      console.log("Not valid hostname");

      return res.json({
        "error": "Invalid hostname format"
      });
    }
    const foundHost = await db.Host.findOne({
      hostname
    })
    if (!foundHost) {
      return res.json({
        "error": "No host found"
      });
    }
    const foundAlarms = await db.Alarm.find({
      "hosts": foundHost._id,
      active: true
    })
    const toSend = []
    foundAlarms.map(alarm => {
      const addToSend = {
        dow: alarm.dow,
        hour: alarm.hour,
        minute: alarm.minute,
        name: alarm.name,
        url: alarm.file.url,
        filename: alarm.file.name
      }
      toSend.push(addToSend);
    })

    return res.status(200).json({
      "result": toSend
    });
  } catch (err) {
    return res.status(500).json({
      err
    })
  }
}

module.exports = exports;
