/* TODO: Place this in the database so we don't have to read from disk everytime */
var fs = require('fs');
var dataset = 'NOAA DataSet/';
// change so that it's modified by user input
var latitude = '37.862612';
var longitude = '-122.261762';
var ourCoords = [latitude, longitude];
// Read File line by line and store into key-value pairings
var stat_precDict = {};
var precipDict = {};
var stat_tempDict = {};
var tempNormalDict = {};
var tempMaxDict = {};
var tempMinDict = {};

function retrieveData(fileName, givenDict){
    return new Promise(function(resolve,reject){
        var lineReader = require('readline').createInterface({
          input: require('fs').createReadStream(dataset + fileName)
        });
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
};

function euclideanDist(firstCoords, secCoords){
    return Math.pow((parseFloat(firstCoords[0]) - parseFloat(secCoords[0])),2) + Math.pow((parseFloat(firstCoords[1]) - parseFloat(secCoords[1])),2)
}

function bestStat(lat, long, data) {
    var best;
    var minDist = 100000000000;
    ourCoords = [lat, long]
    //finds closest weather station to given coordinates
    for (key in data) {
        var currVal = euclideanDist(ourCoords, data[key]);
        if (currVal < minDist) {
            minDist = currVal;
            best = key;
        }
    }
    return best;
}

//retrieves rainfall
exports.rainfallStat = function(lat, lon, key){
    var statPromise = retrieveData('station/station_precip.txt', stat_precDict);
    statPromise.then(function(statDict) {
        console.log('Station PrecDict is filled. It has ' + Object.keys(statDict).length + ' entries.');
        return retrieveData('precip/ann-prcp-normal.txt', precipDict);
    }).then(function(precipDict) {
        console.log('Precip Dict is filled. It has ' + Object.keys(precipDict).length + ' entries.');
    });
    var key = bestStat(lat, lon, stat_precDict);
    console.log('Closest precip station to your coordinates: ' + key);
    return parseInt(precipDict[key])/100;
};


// retrieves temperatures
exports.tempStat = function(lat, lon){
    var statPromise = retrieveData('station/station_temp.txt', stat_tempDict);
    statPromise.then(function(statDict) {
        console.log('Station Temp Dict is filled. It has ' + Object.keys(stat_tempDict).length + ' entries.');
        return retrieveData('temp/ann-tavg-normal.txt', tempNormalDict);
    }).then(function(tempNDict) {
        console.log('Temp Normal Dict is filled. It has ' + Object.keys(tempNormalDict).length + ' entries.');
        return retrieveData('temp/ann-tmax-normal.txt', tempMaxDict);
    }).then(function(precipDict) {
        console.log('Temp Max Dict is filled. It has ' + Object.keys(tempMaxDict).length + ' entries.');
        return retrieveData('temp/ann-tmin-normal.txt', tempMinDict);
    });
    var key = bestStat(lat, lon, stat_tempDict);
    console.log('Closest temp station to your coordinates: ' + key);

    avg = parseInt(tempNormalDict[key])/10;
    max = parseInt(tempMaxDict[key])/10;
    min = parseInt(tempMinDict[key])/10;
    return {
        avgTemp: avg,
        maxTemp: max,
        minTemp: min
    };
};
