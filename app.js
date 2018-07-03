// SETUP
const express = require('express'),
  helmet = require('helmet'),
  bodyParser = require('body-parser'),
  passport = require('passport'),
  LocalStrategy = require('passport-local'),
  mongoose = require('mongoose'),
  methodOverride = require("method-override"),
  compression = require("compression"),
  flash = require('connect-flash'),
  morgan = require("morgan"),
  path = require('path'),
  rfs = require('rotating-file-stream'),
  fs = require('fs'),
  app = express();
require('dotenv').config();

// Set up middleware
middleware = require("./middleware")

const checkDirectorySync = middleware.checkDirectorySync;

const port = process.env.PORT || 3000,
  ip = process.env.IP || "0.0.0.0"

// Models and seeds
const User = require('./models/user')

// Routes
const indexRoutes = require("./routes/index"),
  houseRoutes = require("./routes/houses"),
  hostRoutes = require("./routes/hosts"),
  alarmRoutes = require("./routes/alarms"),
  apiRoutes = require("./routes/api");

// Check if logging dir exists
checkDirectorySync("./logs");

// Logger
var logDirectory = path.join(__dirname, 'logs')

// create a rotating write stream
var accessLogStream = rfs('access.log', {
  interval: '1d', // rotate daily
  path: logDirectory
})

// File logger
app.use(morgan('combined', {
  stream: accessLogStream
}))

// Console logger
app.use(morgan('dev'))

// Mongoose
mongoose.Promise = global.Promise;
const databaseUri = process.env.DB_URI || "mongodb://localhost/tbapi";

mongoose.connect(databaseUri)
  .then(() => console.log(`Database connected`))
  .catch(err => console.log(`Database connection error: ${err.message}`));

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
app.use(helmet());
app.use(compression());
app.use(flash());
app.use(function(req, res, next) {
  res.locals.currentUser = req.user;
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  res.locals.env = process.env.NODE_ENV || 'development';
  next();
});
app.use(bodyParser.urlencoded({
  extended: true
}));
// error handlers
// catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   var err = new Error('Not Found');
//   err.status = 404;
//   next(err);
// });
// development error handler
// will print stacktrace
// if (app.get('env') === 'development') {
//   app.use(function(err, req, res, next) {
//     res.status(err.status || 500);
//     res.render('error', {
//       message: err.message,
//       error: err
//     });
//   });
// }
//
// // production error handler
// // no stacktraces leaked to user
// app.use(function(err, req, res, next) {
//   res.status(err.status || 500);
//   res.render('error', {
//     message: err.message,
//     error: {}
//   });
// });


// Imported routes
app.use(indexRoutes);
app.use("/houses", houseRoutes);
app.use("/api", apiRoutes);
app.use("/houses/:id/hosts", hostRoutes);
app.use("/houses/:id/alarms", alarmRoutes);
// Server //
app.listen(port, () => console.log("Server is running on port " + process.env.PORT));