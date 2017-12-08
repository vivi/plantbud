var passport = require('passport');

var User = require('../models/user.js');
var UserData = require('../models/userData.js');

exports.login = function(req, res, next) {
  console.log("doing a login");
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account"
  })(req, res, next);
};

exports.login_callback = function(req, res, next) {
  passport.authenticate("google", {
      failureRedirect: "/", // CHANGE TO FAILED
      successRedirect: "/",
  })(req, res, next);
}
