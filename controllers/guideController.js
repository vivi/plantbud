var async = require('async');
var Plant = require('../models/plant.js');
var NOAA = require('./weather_NOAA.js');
var Soil = require('./soil_query.js');

function Coord(lat, lon) {
    this.lat = lat;
    this.lon = lon;
}

exports.Coord = Coord;

exports.guide_get = function(req, res, next) {
  res.render('guide', { title: 'guide' });
};

function getWeather(coord) {
    return function(callback) {
        var shared = {};
        async.series([
                function(callback) {
                    NOAA.rainfallStat(coord, shared, callback);
                },
                function(callback) {
                    NOAA.tempStat(coord, shared, callback);
                }
            ], function(err) {
                callback(null, shared);
            }
        );
    };
}

function getPlants(weather, callback) {
    console.log("Getting Plants");
    console.log(JSON.stringify(weather));
    var type;
    if (weather.avgRain < 40 && weather.avgRain > 25) {
        type = "medium";
    }
    callback(null, weather, Plant
        .find()
        .where('min_temp').lt(weather.avgTemp)
        .where('max_temp').gt(weather.maxTemp)
        .where('water').equals(type));
}

function getPlantsFromCoord(coord, state) {
  return function(cb) {
    async.waterfall([
          getWeather(coord),
          getPlants,
          function(weather, plantlist, callback) {
              state.weather = weather;
              plantlist.exec(function (err, plantlist) {
                  console.log("Plant List" + plantlist);
                  state.plantlist = plantlist;
                  callback(err);
              });
          }
      ], function(err) {
          console.log("Got Plants from Coord.!");
          cb(err);
      }
    );
  };
}

exports.getPlantsFromCoord = getPlantsFromCoord;

exports.guide_post = function(req, res, next) {
    req.checkBody('lat', 'Lat coordinate required').notEmpty();
    req.checkBody('lon', 'Long coordinate required').notEmpty();

    req.sanitize('lat').escape();
    req.sanitize('lat').trim();
    req.sanitize('lon').escape();
    req.sanitize('lon').trim();

    var errors = req.validationErrors();
    if (errors) {
        res.render('guide', { title: 'guide', coord: coord, errors: errors});
        return;
    }

    var coord = new Coord(req.body.lat, req.body.lon);

    var state = {};
    async.series([
        getPlantsFromCoord(coord, state),
      ],
      function(err) {
        if (err) {
            res.render('guide', {
                title: 'guide',
                coord: coord,
                errors: [err],
            });
        } else {
            res.render('guide', {
                title: 'guide',
                weather: state.weather,
                plants: state.plantlist,
                coord: coord
            });
        }
      });
};
