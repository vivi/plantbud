var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var UserSchema = new Schema({
  googleId: {
    type: String,
    unique: true,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
});

var User = mongoose.model('User', UserSchema);
module.exports = User;
