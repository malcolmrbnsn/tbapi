// SETUP
const express = require('express'),
  bodyParser = require('body-parser'),
  mongoose = require('mongoose'),
  methodOverride = require("method-override"),
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

// Imported routes
app.use(indexRoutes);
app.use("/houses", houseRoutes);
app.use("/houses/:id/hosts", hostRoutes);
// Server //
app.listen(3000, () => console.log("Server is running at port 3000"));