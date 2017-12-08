// Credits for configuration go to annot8!!
var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth20').Strategy;
var User = require('../models/user.js')

var keys = require('../conf/keys.js');

passport.serializeUser(function (user, done) {
  done(null, user._id);
});

passport.deserializeUser(function (id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(new GoogleStrategy({
    clientID: keys.googleClientID,
    clientSecret: keys.googleClientSecret,
    callbackURL: '/auth/google/callback',
}, function (accessToken, refreshToken, profile, done) {
  User.findOne({  googleId: profile.id  }, function(err, user) {
    if (user) {
      return done(null, user);
    } else {
      user = new User();
      user.googleId = profile.id;
      user.name = profile.displayName;
      user.email = profile.emails[0].value;
      user.save(function(err) {
        if (err) {
          throw err;
        }
        return done(null, user);
      });
    }
  });
}));
