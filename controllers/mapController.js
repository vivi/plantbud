var guide = require('./guideController.js');

exports.map_get = function(req, res, next) {
  res.render('map', {
      title: 'map'
  });
};

exports.map_post = function(req, res, next) {
  var coord = new guide.Coord(req.body.lat, req.body.lon);
  res.render('map', {
      title: 'map',
      coord: coord
  });
};
