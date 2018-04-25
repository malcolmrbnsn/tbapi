var mongoose = require("mongoose");
var Host = require("./models/host");
var House = require("./models/house");
var Alarm = require("./models/alarm");

var data = [{
    name: "Macarthur Waddy"
  },
  {
    name: "Baker Hake"
  },
  {
    name: "Bishop Barker"
  },
  {
    name: "Gowan Brae"
  },
  {
    name: "Forrest"
  },

]

function seedDB() {
  //Remove all campgrounds
  House.remove({}, function(err) {
    if (err) {
      console.log(err);
    }
    console.log("Houses dropped");
    Host.remove({}, function(err) {
      if (err) {
        console.log(err);
      }
      console.log("Hosts dropped");
      Alarm.remove({}, function(err) {
        if (err) {
          console.log(err);
        }
        console.log("Alarms dropped");
        // data.forEach(function(seed) {
        //   House.create(seed, function(err, house) {
        //     if (err) {
        //       console.log(err)
        //     } else {
        //       console.log("House added");
        //     }
        //   });
        // });
      });
    });
  });
}

module.exports = seedDB;