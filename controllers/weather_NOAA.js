var async = require('async');
var fs = require('fs');

/* Filenames */
var DATASET = 'NOAA DataSet/';
var STATION_PRECIP_FILE = 'station/station_precip.txt';
var PRECIP_FILE = 'precip/ann-prcp-normal.txt';

var STATION_TEMP_FILE = 'station/station_temp.txt';
var TEMP_NORM_FILE = 'temp/ann-tavg-normal.txt';
var TEMP_MAX_FILE = 'temp/ann-tmax-normal.txt';
var TEMP_MIN_FILE = 'temp/ann-tmin-normal.txt';

var promises = {}; // file name -> promise (so we don't recompute)
var dicts = {};    // file name -> associated dictionary

function retrieveData(file){
    return function(callback) {
        /* Cache promises. */
        if (file in promises) {
            callback(null, promises[file]);
            return;
        }
        dicts[file] = {};
        promises[file] = new Promise(function(resolve, reject) {
            var lineReader = require('readline').createInterface({
                input: require('fs').createReadStream(DATASET + file)
            });

            var givenDict = dicts[file];

            lineReader.on('line', function (line) {
                var lineArr = line.split(" ").filter(String);
                if (lineArr.length == 2) {
                    givenDict[lineArr[0]] = lineArr[1];
                } else {
                    /* It is a coordinate mapping */
                    var coord = {}
                    coord.lat = parseFloat(lineArr[1]);
                    coord.lon = parseFloat(lineArr[2]);
                    givenDict[lineArr[0]] = coord;
                }
            }).on('close', function() {
                resolve(givenDict);
            });
        });
        callback(null);
    }
};

function euclideanDist(first, second) {
    return Math.pow(first.lat - second.lat, 2) +
           Math.pow(first.lon - second.lon, 2);
};

/* Find the closest weather station given some set of coordinates. */
function bestStat(coord, data) {
    var best;
    var minDist = Number.POSITIVE_INFINITY;
    for (key in data) {
        var currVal = euclideanDist(coord, data[key]);
        if (currVal < minDist) {
            minDist = currVal;
            best = key;
        }
    }
    return best;
};

/* Retrieve average annual rainfall */
exports.rainfallStat = function(coord, shared, callback) {
    async.series([
        retrieveData(STATION_PRECIP_FILE),
        retrieveData(PRECIP_FILE),
        function(callback) {
            var station_promise = promises[STATION_PRECIP_FILE];
            var precip_promise = promises[PRECIP_FILE];
            var station = dicts[STATION_PRECIP_FILE];
            station_promise.then(function(station) {
                var key = bestStat(coord, station);
                console.log('Closest precip station: ' + key);
                var precip = dicts[PRECIP_FILE];
                precip_promise.then(function() {
                    shared.avgRain = parseInt(precip[key]) / 100;
                    console.log('Precip: ' + shared.avgRain);
                    callback(null);
                });
            });
        }
    ], function(error) {
        if (error) {
            console.log("Error getting rainfall stat: " + error);
        }
        callback(null);
    }
    );
};

/* Retrieve average temperature, minimum temperature, and maximum
 * temperature. */
exports.tempStat = function(coord, shared, callback){
    async.series([
            retrieveData(STATION_TEMP_FILE),
            retrieveData(TEMP_NORM_FILE),
            retrieveData(TEMP_MIN_FILE),
            retrieveData(TEMP_MAX_FILE),
            function(callback) {
                var station_promise = promises[STATION_TEMP_FILE];
                var norm_promise = promises[TEMP_NORM_FILE];
                var max_promise = promises[TEMP_MAX_FILE];
                var min_promise = promises[TEMP_MIN_FILE];
                var norm = dicts[TEMP_NORM_FILE];
                var min = dicts[TEMP_MIN_FILE];
                var max = dicts[TEMP_MAX_FILE];

                station_promise.then(function(statDict) {
                    var station = dicts[STATION_TEMP_FILE];
                    var key = bestStat(coord, station);
                    console.log('Closest temp station: ' + key);
                    Promise.all([norm_promise, min_promise, max_promise])
                        .then(function() {
                        shared.avgTemp = parseInt(norm[key])/10;
                        shared.minTemp = parseInt(min[key])/10;
                        shared.maxTemp = parseInt(max[key])/10;
                        callback(null);
                    });
                });
            }
        ], function(error) {
            if (error) {
                console.log("Error getting temperature stat: " + error);
            }
            callback(null);
        }
        );
};
