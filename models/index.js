const mongoose = require("mongoose");

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

 mongoose.set("useCreateIndex", true); // Hides collection.ensureIndex deprication warning

module.exports.House = require("./house");
module.exports.User = require("./user");
module.exports.Host = require("./host");
module.exports.Alarm = require("./alarm");
