var User = require('../models/user.js');
var UserData = require('../models/userData.js');

exports.register_post = function(req, res, next) {
    req.checkBody('email', 'Email required')
      .escape()
      .isEmail()
      .trim()
      .normalizeEmail();

    req.checkBody('password', 'Passwords must be at least 5 chars long and contain one number')
      .isLength({ min: 5 })
      .matches(/\d/);

    req.checkBody('passwordConf', 'Passwords must match')
      .equals(req.body.password);

    var errors = req.validationErrors();
    if (errors) {
        res.render('register', {
          title: 'register',
          email: req.body.email,
          success: false,
          errors: errors,
        });
        return;
    }

    var userData = {
      email: req.body.email,
      password: req.body.password,
    }

    User.create(userData, function(err, user) {
      if (err) {
        console.log(err);
        res.render('register', {
          title: 'register',
          email: req.body.email,
          success: false,
          errors: [{msg: 'An account with that email already exists'}],
        });
      } else {
        var userDataData = {
          email: req.body.email,
        };
        UserData.create(userDataData, function(err, userData) {
          res.render('register', {
            title: 'register',
            success: true,
          });
        });
      }
    });
};

exports.login_post = function(req, res, next) {
    req.checkBody('email', 'Valid email required')
      .escape()
      .isEmail()
      .trim()
      .normalizeEmail();

    req.checkBody('password', 'Password is empty')
      .notEmpty();

    var errors = req.validationErrors();
    if (errors) {
        res.render('login', {
          title: 'login',
          email: req.body.email,
          success: false,
          errors: errors,
        });
        return;
    }

    User.authenticate(req.body.email, req.body.password, function(err, user) {
      if (err || !user) {
        res.render('login', {
          title: 'login',
          email: req.body.email,
          success: false,
          errors: [{msg: 'Login failed'}],
        });
      } else {
        req.session.userId = user._id;
        res.render('login', {
          title: 'login',
          success: true,
          user: req.body.email,
        });
      }
    });
};
