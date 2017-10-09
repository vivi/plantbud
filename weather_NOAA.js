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
//retrieves rainfall
function rainfallStat(latitude, longitude){
	var statPromise = retrieveData('station/station_precip.txt', stat_precDict);
	statPromise.then(function(statDict) {
		console.log('Station PrecDict is filled. It has ' + Object.keys(statDict).length + ' entries.');
		return retrieveData('precip/ann-prcp-normal.txt', precipDict);
	}).then(function(precipDict) {
		console.log('Precip Dict is filled. It has ' + Object.keys(precipDict).length + ' entries.');
	}).then(function() {
		var bestStat;
		var minDist = 100000000000;
		//finds closest weather station to given coordinates
		for (key in stat_precDict) {
			var currVal = euclideanDist(ourCoords,stat_precDict[key]);
			if (currVal < minDist) {
				minDist = currVal;
				bestStat = key;
			}
		}
		console.log('Closest precip station to your coordinates: ' + bestStat);
		console.log('Average annual rainfall for coordinates ' + '[' + latitude +',' + longitude + ']: ' + parseInt(precipDict[bestStat])/100 + ' inches');
		return parseInt(precipDict[bestStat])/100;
	})
};
// retrieves temperatures
function tempStat(latitude, longitude){
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
	}).then(function() {
		var bestStat;
		var minDist = 100000000000;
		//finds closest weather station to given coordinates
		for (key in stat_tempDict) {
			var currVal = euclideanDist(ourCoords,stat_tempDict[key]);
			if (currVal < minDist) {
				minDist = currVal;
				bestStat = key;
			}
		}
		console.log('Closest temp station to your coordinates: ' + bestStat);
		console.log('Average annual temp for coordinates ' + '[' + latitude +',' + longitude + ']: ' + parseInt(tempNormalDict[bestStat])/10 + ' degrees Farenheit');
		console.log('Max annual temp for coordinates ' + '[' + latitude +',' + longitude + ']: ' + parseInt(tempMaxDict[bestStat])/10 + ' degrees Farenheit');
		console.log('Min annual temp for coordinates ' + '[' + latitude +',' + longitude + ']: ' + parseInt(tempMinDict[bestStat])/10 + ' degrees Farenheit');

		return parseInt(tempNormalDict[bestStat])/100;
	})
};

