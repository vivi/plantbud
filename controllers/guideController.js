var async = require('async');
var Plant = require('../models/plant.js');
var NOAA = require('./weather_NOAA.js');
var Soil = require('./soil_query.js');

function Coord(lat, lon) {
    this.lat = lat;
    this.lon = lon;
}

exports.guide_get = function(req, res, next) {
  res.render('guide', { title: 'guide' });
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
        .where('optimal_min_temp').lt(coordInfo.minTemp)
        .where('optimal_max_temp').gt(coordInfo.maxTemp)
        .where('opt_min_rain').lt(coordInfo.avgRain)
        .where('opt_max_rain').gt(coordInfo.avgRain)
        .where('opt_min_pH').lt(coordInfo.phavg)
        .where('opt_max_pH').gt(coordInfo.phavg)
    );
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
            getInfo(coord),
            getOptPlants,
            function(coordInfo, plantlist, callback) {
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
                            coordInfo: coordInfo,
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
