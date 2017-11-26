var async = require('async');
var guide = require('./guideController.js');
var Plant = require('../models/plant.js');
var UserData = require('../models/userData.js');

/* We only display the tool on a POST request that contains perimeter info. */
exports.layout_get = function(req, res, next) {
  res.render('plant_layout', {
    title: 'layout',
    show: false,
    user: req.email,
  });
};

function getPlantsFromStr(doc, callback) {
  var plants = doc.plants.split(',');
  console.log(plants);
  var plantlist = [];
  async.each(plants, function(el, callback) {
    Plant.findById(el)
      .exec(function(err, plant) {
        console.log(plant);
        if (err) return callback(err);
        plant.common_name = plant.common_name.split(', ')[0];
        plantlist.push(plant);
        callback();
      });
  },
  function(err) {
    if (err) return callback(err);
    console.log(plantlist);
    callback(null, plantlist, doc);
  });
};

/* Serve the laying out tool */
exports.layout_post = function(req, res, next) {
  console.log(req.body.verts);
  async.waterfall([
      function(callback) {
          var query = {'_user': req.session.userId};
          var update = {
            'polygon': req.body.verts,
            'mpp': req.body.mpp,
          };
          UserData.findOneAndUpdate(query, update,
              {upsert:true}, function(err, doc){
            if (err) return res.send(500, { error: err });
            console.log(doc);
            callback(null, doc);
          });
      },
      getPlantsFromStr,
    ],
    function(err, plantlist, doc) {
      console.log(plantlist);
      if (err) {
          res.render('plant_layout', {
              title: 'layout',
              error: err,
              show: false,
              user: req.email,
          });
      } else {
          res.render('plant_layout', {
              title: 'layout',
              error: err,
              plants: plantlist,
              verts: req.body.verts.split(';').join(',')
                .split('(').join('[')
                .split(')').join(']'),
              mpp: req.body.mpp,
              coord: {lat: doc.lat, lon: doc.lon},
              show: true,
              user: req.email,
          });
          console.log("Loaded plants into viewer!");
      }
    });
};
