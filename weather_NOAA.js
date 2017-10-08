var fs = require('fs');
async = require("async");
var dataset = 'NOAA DataSet/';
// change so that it's modified by user input
var latitude = '37.862612';
var longitude = '-122.261762';
// Read File line by line and store into key-value pairings
var stationDict = [];
var precipDict = [];
// For Station GPS Coordinates
var statReader = require('readline').createInterface({
  input: require('fs').createReadStream(dataset + 'station.txt')
});
statReader.on('line', function (line) {
	var lineArr = line.split(" ").filter(String);
	stationDict.push({
		key: lineArr[0],
		value : [lineArr[1], lineArr[2]]
	});
});
// For precipitation of stations
var precReader = require('readline').createInterface({
  input: require('fs').createReadStream(dataset + 'ann-prcp-normal.txt')
});
precReader.on('line', function (line) {
	var lineArr = line.split(" ").filter(String);
	precipDict.push({
		key: lineArr[0],
		value : [lineArr[1], lineArr[2]]
	});
});

