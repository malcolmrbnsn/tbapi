// SETUP
const express = require('express'),
  bodyParser = require('body-parser'),
  passport = require('passport'),
  LocalStrategy = require('passport-local'),
  mongoose = require('mongoose'),
  methodOverride = require("method-override"),
  Rollbar = require("rollbar"),
  flash = require('connect-flash'),
  app = express();
require('dotenv').config();

const port = process.env.PORT || 3000;

// Models and seeds
const House = require('./models/house'),
  Host = require('./models/host'),
  User = require('./models/user'),
  Alarm = require('./models/alarm');

// Routes
const indexRoutes = require("./routes/index"),
  houseRoutes = require("./routes/houses"),
  hostRoutes = require("./routes/hosts"),
  alarmRoutes = require("./routes/alarms"),
  apiRoutes = require("./routes/api");

// Rollbar
var rollbar = new Rollbar({
  accessToken: '3186dddb91ea4c0db986150bd3a37afa',
  captureUncaught: true,
  captureUnhandledRejections: true
});
app.use(rollbar.errorHandler());

// Mongoose
mongoose.Promise = global.Promise;
const databaseUri = process.env.DB_URI || "mongodb://localhost/tbapi";

mongoose.connect(databaseUri)
  .then(() => rollbar.log(`Database connected`))
  .catch(err => rollbar.error(`Database connection error: ${err.message}`));

// Passport
app.use(require("express-session")({
  secret: "dsj kfhsda nbsdakf hsdjgseh gv hg gjkbv rlk hvout fl nbpygfsd jk fgpiusg",
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// app config
app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");
app.use(methodOverride("_method"));
app.use(flash());
app.use(function(req, res, next) {
  res.locals.currentUser = req.user;
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  rollbar.log("A " + req.method + " request was made to " + req.url);
  next();
});
app.use(bodyParser.urlencoded({
  extended: true
}));

// Imported routes
app.use(indexRoutes);
app.use("/houses", houseRoutes);
app.use("/api", apiRoutes);
app.use("/houses/:id/hosts", hostRoutes);
app.use("/houses/:id/alarms", alarmRoutes);
// Server //
app.listen(process.env.PORT, process.env.IP, () => rollbar.log("Server is running on port " + process.env.PORT));