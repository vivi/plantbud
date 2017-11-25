var async = require('async');
var Plant = require('../models/plant.js');
var NOAA = require('./weather_NOAA.js');
var Soil = require('./soil_query.js');
var UserData = require('../models/userData.js');

function Coord(lat, lon) {
    this.lat = lat;
    this.lon = lon;
}

exports.Coord = Coord;

exports.guide_get = function(req, res, next) {
  res.render('guide', {
    title: 'guide',
    user: req.email,
  });
};

function getInfo(coord) {
    return function(callback) {
        var shared = {};
        async.series([
                function(callback) {
                    NOAA.rainfallStat(coord, shared, callback);
                },
                function(callback) {
                    NOAA.tempStat(coord, shared, callback);
                },
                function(callback) {
                    Soil.soilStat(coord, shared ,callback);
                }
            ], function(err) {
                callback(null, shared);
            }
        );
    };
};


function getOptPlants(coordInfo, callback) {
    console.log("Getting Plants");
    console.log(JSON.stringify(coordInfo));
    var type;
    callback(null, coordInfo, Plant
        .find()
        .where('common_name').ne("")
        .where('optimal_min_temp').lte(coordInfo.minTemp * 1.2)
        .where('optimal_max_temp').gte(coordInfo.maxTemp * 0.8)
        .where('opt_min_rain').lte(coordInfo.avgRain)
        .where('opt_max_rain').gte(coordInfo.avgRain)
        //.where('opt_min_pH').lt(coordInfo.phavg)
        //.where('opt_max_pH').gt(coordInfo.phavg)
    );
}

function getPlantsFromCoord(coord, state) {
  return function(cb) {
    async.waterfall([
          getWeather(coord),
          getPlants,
          function(weather, plantlist, callback) {
              state.weather = weather;
              plantlist.exec(function (err, plantlist) {
                  //console.log("Plant List" + plantlist);
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
    async.waterfall([
        function(callback) {
          var query = {'_user': req.session.userId};
          var update = {
            'email': req.email,
            'lat': req.body.lat,
            'lon': req.body.lon,
          };
          UserData.findOneAndUpdate(query, update,
              {upsert:true}, function(err, doc){
            if (err) return res.send(500, { error: err });
            callback(null);
          });
        },
        getInfo(coord),
        getOptPlants,
        function(coordInfo, plantlist, callback) {
            plantlist.exec(function (err, plant_list) {
                if (err) {
                    res.render('guide', {
                        title: 'guide',
                        coord: coord,
                        errors: errors,
                        user: req.email,
                    });
                } else {
                    res.render('guide', {
                        title: 'guide',
                        coordInfo: coordInfo,
                        plants: plant_list,
                        user: req.email,
                        coord: coord
                    });
                }
            });
            callback();
        }
    ], function(err) {
        console.log("Done!");
    }
  );
};
