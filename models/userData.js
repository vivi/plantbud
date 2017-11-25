var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var UserDataSchema = new Schema({
  _user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    unique: true,
  },
  lat: {
    type: Number,
  },
  lon: {
    type: Number,
  },
  polygon: {
    type: String,
  },
  mpp: {
    type: Number,
  },
  plants: {
    type:String,
  },
});

var UserData = mongoose.model('UserData', UserDataSchema);
module.exports = UserData;
