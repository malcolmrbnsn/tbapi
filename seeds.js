var mongoose = require("mongoose");
var Host = require("./models/host");
var House = require("./models/house");

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
      //add a few campgrounds
      data.forEach(function(seed) {
        House.create(seed, function(err, campground) {
          if (err) {
            console.log(err)
          } else {
            console.log("House added");
            //create a comment
          }
        });
      });
    });
  });
  //add a few comments
}

module.exports = seedDB;