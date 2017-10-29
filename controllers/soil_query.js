var async = require('async');
var request = require('request');

function retrieveSoil(coord){
	var link = 'https://rest.soilgrids.org/query?lon='+ coord.lat + '&lat=' + coord.lon;
	console.log("Getting Soil Information")
	request(link, function (error, response, body) {
	    if (!error && response.statusCode == 200) {
	        var soilProp= JSON.parse(body)['properties'];

	        var allDict = {}

	        var soilPHDict = soilProp['properties'].PHIHOX.M;
	        // depth to bedrock in cm, can be interpreted as soil depth
	        var bedrock_depth = soilJSO.properties.BDRICM.M.BDRICM_M;
	        // approximate texture from fraction of clay, slit, and sand in soil
	        var clayFract = soilJSON.properties.CLYPPT.M;
	        var slitFract = soilJSON.properties.SLTPPT.M;
	        var sandFract = soilJSON.properties.SNDPPT.M;
	        var avg = 0;
	        for (var key in soilPHDict) {
	        	// soil pH values are multiplied by 10 in json 
	        	avg += soilPHDict[key]/10
	        }
	        avg /= Object.keys(soilPHDict).length
	        console.log(bedrock_depth)
	        console.log(avg)
	        console.log(clayFract)
	        console.log(slitFract)
	        console.log(sandFract)
	        console.log(soilPHDict)
	        return avg
	     }
	})
}

var coord = {
	lon : 37.8758719,
	lat : -122.25887979999997
}
console.log(retrieveSoil(coord))