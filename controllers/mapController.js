var guide = require('./guideController.js');
var UserData = require('../models/userData.js');

/* We only display the mapping on a POST request that contains GPS coordinates */
exports.map_get = function(req, res, next) {
  res.render('map', {
    title: 'map',
    user: req.email,
  });
};

/* Serve the mapping tool */
exports.map_post = function(req, res, next) {
  var query = {'_user': req.session.userId};
  var update = {
    'plants': req.body.select_plant.join(','),
  };
  UserData.findOneAndUpdate(query, update, function(err, doc){
    if (err) return res.send(500, { error: err });
    var coord = new guide.Coord(doc.lat, doc.lon);
    res.render('map', {
      title: 'map',
      coord: coord,
      user: req.email,
    });
  });
};
