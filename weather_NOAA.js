var fs = require('fs');
var dataset = 'NOAA DataSet/';
// change so that it's modified by user input
var latitude = '37.862612';
var longitude = '-122.261762';
// Read File line by line and store into key-value pairings
var stationDict = [];
var precipDict = [];

function retrieveData(fileName, givenDict){
	return new Promise(function(resolve,reject){
		var lineReader = require('readline').createInterface({
		  input: require('fs').createReadStream(dataset + fileName)
		});
		lineReader.on('line', function (line) {
			var lineArr = line.split(" ").filter(String);
			givenDict.push({
				key: lineArr[0],
				value : [lineArr[1], lineArr[2]]
			});
		}).on('close', function() {
	  		resolve(givenDict);
		});
	});
};
var statPromise = retrieveData('station.txt', stationDict);
statPromise.then(function(statDict) {
	console.log('Station Dict is filled. It has ' + Object.keys(statDict).length + ' entries.');
	return retrieveData('ann-prcp-normal.txt', precipDict);
}).then(function(precipDict) {
	console.log('Precip Dict is filled. It has ' + Object.keys(precipDict).length + ' entries.');
}).then(function() {
	
})