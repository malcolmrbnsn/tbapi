#!/usr/bin/node
// SETUP
const express = require("express"),
  helmet = require("helmet"),
  bodyParser = require("body-parser"),
  passport = require("passport"),
  LocalStrategy = require("passport-local"),
  session = require("express-session"),
  mongoStore = require("connect-mongo")(session),
  methodOverride = require("method-override"),
  compression = require("compression"),
  flash = require("connect-flash"),
  morgan = require("morgan"),
  expressSanitizer = require("express-sanitizer"),
  app = express();
require("dotenv").config();

// Set up middleware, db
const db = require("./models");

const PORT = process.env.PORT || 3000,
  IP = process.env.IP || "0.0.0.0";

// Routes
const indexRoutes = require("./routes/index"),
  houseRoutes = require("./routes/houses"),
  hostRoutes = require("./routes/hosts"),
  alarmRoutes = require("./routes/alarms"),
  apiRoutes = require("./routes/api");
errorHandler = require("./helpers/error");

// Logger
app.use(morgan("dev"));

//Session
var sess = {
  secret: process.env.SESSION_SECRET,
  store: new mongoStore({
    url: process.env.DB_URI
  }),
  resave: false,
  saveUninitialized: false,
  secure: true,
  httponly: false,
  cookie: {
    maxAge: 3600000
  }
};

app.use(session(sess));
// Passport
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(db.User.authenticate()));
passport.serializeUser(db.User.serializeUser());
passport.deserializeUser(db.User.deserializeUser());

// app config
app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");
app.use(methodOverride("_method"));
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);
app.use(bodyParser.json());
app.use(expressSanitizer());
app.use(helmet());
app.use(compression());
app.use(flash());
app.use(function(req, res, next) {
  res.locals.currentUser = req.user;
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  next();
});

// Imported routes
app.use(indexRoutes);
app.use("/houses", houseRoutes);
app.use("/api", apiRoutes);
app.use("/houses/:id/hosts", hostRoutes);
app.use("/houses/:id/alarms", alarmRoutes);

// Error listener
app.use(function(error, req, res, next) {
  if (typeof error !== undefined) {
    return next(error);
  }

  const err = new Error("Not Found");
  next(err);
});

// Error Handler
app.use(errorHandler);

// Server //
app.listen(PORT, IP, () => console.log(`SERVER: Running on ${IP}:${PORT}`));
