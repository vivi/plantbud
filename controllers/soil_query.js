var async = require('async');
var request = require('request');

function retrieveSoil(coord){
	var link = 'https://rest.soilgrids.org/query?lon='+ coord.lat + '&lat=' + coord.lon;
	console.log("Getting Soil Information")
	request(link, function (error, response, body) {
	    if (!error && response.statusCode == 200) {
	        var soilProp= JSON.parse(body)['properties'];
	        var soilDict = {
	        	// depth to bedrock in cm, can be interpreted as soil depth
	        	bedrock_depth : soilProp.BDRICM.M.BDRICM_M,
	        	// approximate texture from fraction of clay, slit, and sand in soil
	        	clayFrac : reduceDict(soilProp.CLYPPT.M,Object.keys(soilProp.CLYPPT.M).length, 1),
	        	slitFrac : reduceDict(soilProp.SLTPPT.M,Object.keys(soilProp.SLTPPT.M).length, 1),
	        	sandFrac : reduceDict(soilProp.SNDPPT.M,Object.keys(soilProp.SNDPPT.M).length, 1),
	        	// pH values are multiplied by 10 in database
	        	phavg : reduceDict(soilProp.PHIHOX.M,Object.keys(soilProp.PHIHOX.M).length, 10)
	        };
	        return soilDict
	     }
	})
}

var coord = {
	lon : 37.8758719,
	lat : -122.25887979999997
}
console.log(retrieveSoil(coord))
