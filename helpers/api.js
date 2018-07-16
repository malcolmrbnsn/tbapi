const db = require("../models"),
  middleware = require("../middleware"),
  {
    validateIPAddr
  } = middleware

exports = {}

exports.getHost = (req, res) => {
  // sanatise ip address
  if (!validateIPAddr(req.params.hostname)) {
    console.log("Not valid hostname");

    return res.json({
      "error": "Invalid hostname format"
    });

  }
  db.Host.findOne({
    hostname: req.params.hostname
  }).
  then((foundHost) => {
    console.log(foundHost);
    if (!foundHost) {
      console.log("API ERROR: NO HOST FOUND");

      return res.json({
        "error": "No host found"
      });
    }
    db.Alarm.find({
      "hosts": foundHost._id,
      active: true
    }).
    then((foundAlarms) => {
      const toSend = []
      console.log(foundAlarms)
      foundAlarms.map((alarm) => {
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

      return res.json({
        "result": toSend
      });
    }).
    catch((err) => {
      console.log(err)

      return res.json({
        err
      })
    })
  }).
  catch((err) => {
    console.log(err)

    return res.json({
      err
    })
  })
}

module.exports = exports;
