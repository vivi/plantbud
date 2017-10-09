var Plant = require('../models/plant.js');
var NOAA = require('./weather_NOAA.js');

function Coord(lat, lon) {
    this.lat = lat;
    this.lon = lon;
}

exports.guide_get = function(req, res, next) {
  res.render('guide', { title: 'guide' });
};

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

    var avgRain = NOAA.rainfallStat(coord.lat, coord.lon);
    var temp = NOAA.tempStat(coord.lat, coord.lon);

    var weather = {
        avgRain: avgRain,
        avgTemp: temp.avgTemp,
        minTemp: temp.minTemp,
        maxTemp: temp.maxTemp,
    };

    var plants = getPlants(weather);
    plants.exec(function (err, plant_list) {
        console.log(plant_list);
        if (err) {
            res.render('guide', { title: 'guide', coord: coord, errors: errors});
        } else {
            res.render('guide', { title: 'guide', weather: weather, plants: plant_list, coord: coord });
        }
    });
};

function getPlants(weather) {
    var type;
    if (weather.avgRain < 40 && weather.avgRain > 25) {
        type = "medium"
    }
    return Plant
        .find()
        .where('min_temp').lt(weather.avgTemp)
        .where('max_temp').gt(weather.maxTemp)
        .where('water').equals(type);
}
