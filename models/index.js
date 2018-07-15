const mongoose = require('mongoose');
// Mongoose

mongoose.set('debug', true);

mongoose.Promise = global.Promise;
const databaseUri = process.env.DB_URI || "mongodb://localhost/tbapi";

mongoose.connect(databaseUri)
  .then(() => console.log(`Database connected`))
  .catch(err => console.log(`Database connection error: ${err.message}`));

module.exports.House = require('./house')
module.exports.User = require('./user')
module.exports.Host = require('./host')
module.exports.Alarm = require('./alarm')
