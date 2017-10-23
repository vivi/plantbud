var async = require('async');
var Plant = require('../models/plant.js');
var NOAA = require('./weather_NOAA.js');

function Coord(lat, lon) {
    this.lat = lat;
    this.lon = lon;
}

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
    }
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

exports.guide_post = function(req, res, next) {
    req.checkBody('lat', 'Lat coordinate required').notEmpty();
    req.checkBody('lon', 'Long coordinate required').notEmpty();

    req.sanitize('lat').escape();
    req.sanitize('lat').trim();
    req.sanitize('lon').escape();
    req.sanitize('lon').trim();

    var errors = req.validationErrors();

    var coord = new Coord(req.body.lat, req.body.lon);
    if (errors) {
        res.render('guide', { title: 'guide', coord: coord, errors: errors});
        return;
    }

    async.waterfall([
            getWeather(coord),
            getPlants,
            function(weather, plantlist, callback) {
                plantlist.exec(function (err, plant_list) {
                    console.log("Plant List" + plant_list);
                    if (err) {
                        res.render('guide', {
                            title: 'guide',
                            coord: coord,
                            errors: errors
                        });
                    } else {
                        res.render('guide', {
                            title: 'guide',
                            weather: weather,
                            plants: plant_list,
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
