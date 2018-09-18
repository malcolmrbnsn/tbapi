const mongoose = require("mongoose");
const env = process.env.NODE_ENV || "development";

if (env !== "production") {
  // mongoose.set('debug', true);
}
// Mongoose
mongoose.Promise = global.Promise;
const databaseUri = process.env.DB_URI || "mongodb://localhost/tbapi";

mongoose
  .connect(
    databaseUri,
    { useNewUrlParser: true }
  )
  .then(() => console.log(`Database connected`))
  .catch(err => console.log(`Database connection error: ${err.message}`));

module.exports.House = require("./house");
module.exports.User = require("./user");
module.exports.Host = require("./host");
module.exports.Alarm = require("./alarm");
