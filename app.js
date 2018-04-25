// SETUP
const express = require('express'),
  bodyParser = require('body-parser'),
  formidible = require('formidable'),
  path = require('path'),
  fs = require('fs-extra'),
  mongoose = require('mongoose'),
  methodOverride = require("method-override"),
  Rollbar = require("rollbar"),
  app = express()

// Models and seeds
const House = require('./models/house'),
  Host = require('./models/host'),
  seedDB = require('./seeds'),
  Alarm = require('./models/alarm');

// Routes
const indexRoutes = require("./routes/index")
const houseRoutes = require("./routes/houses")
const hostRoutes = require("./routes/hosts")
const alarmRoutes = require("./routes/alarms")

// Mongoose
mongoose.Promise = global.Promise;
const databaseUri = 'mongodb://localhost/tbapi';

mongoose.connect(databaseUri)
  .then(() => console.log(`Database connected`))
  .catch(err => console.log(`Database connection error: ${err.message}`));
seedDB(); // Seed the database

// app config
app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");
app.use(methodOverride("_method"));
app.use(bodyParser.urlencoded({
  extended: true
}));

// Rollbar
var rollbar = new Rollbar("3186dddb91ea4c0db986150bd3a37afa");
// rollbar.log("Hello world!");

// Imported routes
app.use(indexRoutes);
app.use("/houses", houseRoutes);
app.use("/houses/:id/hosts", hostRoutes);
app.use("/houses/:id/alarms", alarmRoutes);
// Server //
app.listen(3000, () => console.log("Server is running at port 3000"));