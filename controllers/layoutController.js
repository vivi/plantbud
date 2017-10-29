var async = require('async');

var guide = require('./guideController.js');

/* We only display the mapping on a POST request that contains GPS coordinates */
exports.layout_get = function(req, res, next) {
  res.render('plant_layout', {
    title: 'layout',
    show: false,
  });
};

/* Serve the mapping tool */
exports.layout_post = function(req, res, next) {
  console.log(req.body.verts);
  var verts = req.body.verts.split(';');
  var bracket_verts = [];
  verts.forEach(function (el) {
    bracket_verts.push("[" + el.slice(1, -1) + "]");
  });
  var coord = new guide.Coord(req.body.lat, req.body.lon);
  var state = {};
  async.series([
      guide.getPlantsFromCoord(coord, state),
    ],
    function(err) {
      if (err) {
          res.render('plant_layout', {
              title: 'layout',
              coord: coord,
              error: err,
              show: false,
          });
      } else {
          res.render('plant_layout', {
              title: 'layout',
              coord: coord,
              error: err,
              plants: state.plantlist,
              coord: coord,
              verts: bracket_verts, // XXX: Do some parsing
              mpp: req.body.mpp,
              show: true,
          });
          console.log("Loaded plants into viewer!");
      }
    });
}
