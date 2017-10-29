var guide = require('./guideController.js');

/* We only display the mapping on a POST request that contains GPS coordinates */
exports.map_get = function(req, res, next) {
  res.render('map', {
    title: 'map'
  });
};

/* Serve the mapping tool */
exports.map_post = function(req, res, next) {
  var coord = new guide.Coord(req.body.lat, req.body.lon);
  res.render('map', {
    title: 'map',
    coord: coord
  });
};
