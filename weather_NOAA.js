var fs = require('fs');
var dataset = 'NOAA DataSet/';
// change so that it's modified by user input
var latitude = '37.862612';
var longitude = '-122.261762';
var ourCoords = [latitude, longitude];
// Read File line by line and store into key-value pairings
var stationDict = {};
var precipDict = {};

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
var statPromise = retrieveData('station.txt', stationDict);
statPromise.then(function(statDict) {
	console.log('Station Dict is filled. It has ' + Object.keys(statDict).length + ' entries.');
	return retrieveData('ann-prcp-normal.txt', precipDict);
}).then(function(precipDict) {
	console.log('Precip Dict is filled. It has ' + Object.keys(precipDict).length + ' entries.');
}).then(function() {
	var bestStat;
	var minDist = 100000000000;
	//finds closest weather station to given coordinates
	for (key in stationDict) {
		var currVal = euclideanDist(ourCoords,stationDict[key]);
		if (currVal < minDist) {
			minDist = currVal;
			bestStat = key;
		}
	}
	console.log('Closest station to your coordinates: ' + bestStat);
	console.log('Average annual rainfall for coordinates ' + '[' + latitude +',' + longitude + ']: ' + parseInt(precipDict[bestStat])/100 + ' inches');
})