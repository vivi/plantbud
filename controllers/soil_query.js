var request = require('request');

exports.soilStat = function retrieveSoil(coord){
	var link = 'https://rest.soilgrids.org/query?lon='+coord.lat + '&lat=' + coord.lon;
	request(link, function (error, response, body) {
	    if (!error && response.statusCode == 200) {
	        var soilJSON= JSON.parse(body);
	        var soilPHDict = soilJSON.properties.PHIHOX.M
	        var avg = 0;
	        for (var key in soilPHDict) {
	        	// soil pH values are multiplied by 10 in json 
	        	avg += soilPHDict[key]/10
	        }
	        avg /= Object.keys(soilPHDict).length
	        return avg
	     }
	})
}