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
  var query = {'_user': req.session.userId};
  var conditions = {'lat': true, 'lon': true, 'plants': true};
  UserData.findOne(query, conditions, (err, userInfo) => {
    if (userInfo) {
      var coord = new Coord(userInfo.lat, userInfo.lon);
      console.log(userInfo.plants);
      async.waterfall([
        getInfo(coord),
        getAbsPlants,
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
                        coord: coord,
                        sel_plants: userInfo.plants
                    });
                }
            });
            callback();
        }
      ], function(err) {
          console.log("Done!");
        }
      );
    } else {
      res.render('guide', {
        title: 'guide',
        user: req.email,
      });  
    }
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
    console.log("Getting Optimal Plants");
    console.log(JSON.stringify(coordInfo));
    var type;
    callback(null, coordInfo, Plant
        .find()
        .where('common_name').ne("")
        .where('optimal_min_temp').lte(coordInfo.minTemp)
        .where('optimal_max_temp').gte(coordInfo.maxTemp)
        .where('opt_min_rain').lte(coordInfo.avgRain)
        .where('opt_max_rain').gte(coordInfo.avgRain)
        //.where('opt_min_pH').lt(coordInfo.phavg)
        //.where('opt_max_pH').gt(coordInfo.phavg)
    );
}

function getAbsPlants(coordInfo, callback) {
    console.log("Getting Abs Plants");
    var type;
    callback(null, coordInfo, Plant
        .find()
        .where('common_name').ne("")
        .where('absolute_min_temp').lte(coordInfo.minTemp)
        .where('absolute_max_temp').gte(coordInfo.maxTemp)
        .where('abs_min_rain').lte(coordInfo.avgRain)
        .where('abs_max_rain').gte(coordInfo.avgRain)
        .where('abs_min_pH').lt(coordInfo.phavg)
        .where('abs_max_pH').gt(coordInfo.phavg)
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
    req.checkBody('lat', 'Lat Coordinate is not valid. Please make sure you input a number.').isFloat();
    req.checkBody('lon', 'Lon Coordinate is not valid. Please make sure you input a number.').isFloat();

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
          var query = {'_user': req.user._id};
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
        getAbsPlants,
        function(coordInfo, plantlist, callback) {
            plantlist.exec(function (err, plant_list) {
                if (err) {
                    res.render('guide', {
                        title: 'guide',
                        coord: coord,
                        errors: errors,
                        user: req.user,
                    });
                } else {
                    res.render('guide', {
                        title: 'guide',
                        coordInfo: coordInfo,
                        plants: plant_list,
                        user: req.user,
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
