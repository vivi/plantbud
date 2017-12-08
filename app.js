var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var session = require('express-session');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var passport = require('passport');

var keys = require('./conf/keys.js');
require('./conf/passport.js');

var User = require('./models/user');
var index = require('./routes/index');
var users = require('./routes/users');
var guide = require('./routes/guide');
var map = require('./routes/map');
var layout = require('./routes/layout');
var login = require('./routes/login');
var logout = require('./routes/logout');

var app = express();

console.log(keys);
var mongoose = require('mongoose');
mongoose.connect(keys.mongoURI, {
  useMongoClient: true
});
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Sessions
app.use(session({
  secret: keys.cookieSecret,
  resave: true,
  saveUninitialized: false,
  store: new MongoStore({
    mongooseConnection: db
  })
}));

// Passport Auth
app.use(passport.initialize());
app.use(passport.session());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressValidator());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Retrieve session info.
app.all('*', function(req, res, next) {
  if (!req.session.userId) {
    console.log("no uid");
    return next();
  }

  User.findById(req.session.userId)
    .exec(function(err, user) {
      if (err) {
        return next(err);
      } else {
        req.user = user;
        req.email = user.email;
        console.log(req.email);
        next();
      }
    });
});

function requiresLogin(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    return res.render('restricted', {});
  }
};

app.use('/', index);
app.use('/', login);
app.use('/guide', requiresLogin);
app.use('/guide', guide);
app.use('/map', requiresLogin);
app.use('/map', map);
app.use('/layout', requiresLogin);
app.use('/layout', layout);
app.use('/users', users);
app.use('/logout', logout);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
