exports = {};

const options = {
  apikey: process.env.API_KEY,
  adminKey: process.env.ADMINKEY,
  userKey: process.env.USERKEY
};

exports.showOptions = (req, res) => {
  res.render("options/show", {
    page: "options",
    pageName: "Options",
    options
  });
};

module.exports = exports;
