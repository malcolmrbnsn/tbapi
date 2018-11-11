#!/usr/bin/node
// ============================================ //
// index.js
// https://github.com/robthr/tbapi
// Copyright (c) 2018 Malcolm Robinson
// Usable under MIT license
// ============================================ //

// SETUP
const express = require("express"),
  http = require("http"),
  https = require("https"),
  fs = require("fs"),
  path = require("path"),
  app = express();
require("dotenv").config();

// Options
const databaseUri = process.env.DB_URI || "mongodb://localhost/tbapi",
  HTTP_PORT = process.env.HTTP_PORT || 3000,
  HTTPS_PORT = process.env.HTTPS_PORT || 3001,
  IP = process.env.IP || "0.0.0.0";

// Routes
const indexRoutes = require("./routes/index"),
  houseRoutes = require("./routes/houses"),
  hostRoutes = require("./routes/hosts"),
  alarmRoutes = require("./routes/alarms"),
  apiRoutes = require("./routes/api"),
  optionRoutes = require("./routes/options"),
  errorHandler = require("./helpers/error");

// Logger
const morgan = require("morgan");
app.use(morgan("dev"));

//Session
const session = require("express-session"),
  mongoStore = require("connect-mongo")(session),
  sess = {
    secret: process.env.SESSION_SECRET,
    store: new mongoStore({
      url: databaseUri
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
const db = require("./models"),
  passport = require("passport"),
  LocalStrategy = require("passport-local");
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(db.User.authenticate()));
passport.serializeUser(db.User.serializeUser());
passport.deserializeUser(db.User.deserializeUser());

// app config
app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");

const methodOverride = require("method-override");
app.use(methodOverride("_method"));

const bodyParser = require("body-parser");
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);
app.use(bodyParser.json());

const expressSanitizer = require("express-sanitizer");
app.use(expressSanitizer());

const helmet = require("helmet");
app.use(helmet());

const compression = require("compression");
app.use(compression());

const flash = require("connect-flash");
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
app.use("/options", optionRoutes);

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

// HTTP server
http.createServer(app).listen(HTTP_PORT, IP);
console.log(`HTTP-SERVER: Running on http://${IP}:${HTTP_PORT}`);

// HTTPS server
const HTTPS_status = process.env.HTTPS_STATUS || "off";
if (HTTPS_status === "on") {
  const certDir = process.env.SSL_CERT_DIR;
  // Certificate
  const privateKey = fs.readFileSync(path.join(certDir, "privkey.pem"), "utf8");
  const certificate = fs.readFileSync(path.join(certDir, "cert.pem"), "utf8");

  const credentials = {
    key: privateKey,
    cert: certificate
  };
  https.createServer(credentials, app).listen(HTTPS_PORT, IP);
  console.log(`HTTPS-SERVER: Running on https://${IP}:${HTTPS_PORT}`);
}
