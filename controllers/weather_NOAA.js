/* TODO: Place this in the database so we don't have to read from disk everytime */
var async = require('async');
var fs = require('fs');
var dataset = 'NOAA DataSet/';
var STATION_PRECIP_FILE = 'station/station_precip.txt';
var PRECIP_FILE = 'precip/ann-prcp-normal.txt';

var STATION_TEMP_FILE = 'station/station_temp.txt';
var TEMP_NORM_FILE = 'temp/ann-tavg-normal.txt';
var TEMP_MAX_FILE = 'temp/ann-tmax-normal.txt';
var TEMP_MIN_FILE = 'temp/ann-tmin-normal.txt';


// change so that it's modified by user input
var latitude = '37.862612';
var longitude = '-122.261762';
var ourCoords = [latitude, longitude];

// Read File line by line and store into key-value pairings
var promises = {};
var dicts = {}

function retrieveData(file){
    return function(callback) {
        if (file in promises) {
            callback(null, promises[file]);
            return;
        }
        dicts[file] = {}
        promises[file] = new Promise(function(resolve, reject) {
            var lineReader = require('readline').createInterface({
                input: require('fs').createReadStream(dataset + file)
            });

            var givenDict = dicts[file];

            lineReader.on('line', function (line) {
                var lineArr = line.split(" ").filter(String);
                if (lineArr.length == 2) {
                    givenDict[lineArr[0]] = lineArr[1];
                } else {
                    givenDict[lineArr[0]] = [lineArr[1], lineArr[2]];
                }
            }).on('close', function() {
                resolve(givenDict);
            });
        });
        callback(null);
    }
};

function euclideanDist(firstCoords, secCoords) {
    return Math.pow((parseFloat(firstCoords.lat) - parseFloat(secCoords[0])),2) + Math.pow((parseFloat(firstCoords.lon) - parseFloat(secCoords[1])),2)
}

function bestStat(coord, data) {
    var best;
    var minDist = Number.POSITIVE_INFINITY;
    //finds closest weather station to given coordinates
    for (key in data) {
        var currVal = euclideanDist(coord, data[key]);
        if (currVal < minDist) {
            minDist = currVal;
            best = key;
        }
    }
    return best;
}

// Retrieves rainfall.
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

// retrieves temperatures
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
