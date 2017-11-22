var async = require('async');
var request = require('request');

function reduceDict(propDict, dictLength, divFactor){
	var avg = 0;
    for (var key in propDict) {
    	avg += propDict[key]/divFactor
    }
    return Math.round(100 * avg / dictLength)/100
}
// return dict of soil characteristics
exports.soilStat = function retrieveSoil(coord, shared, callback){
	var link = 'https://rest.soilgrids.org/query?lon='+ coord.lon + '&lat=' + coord.lat;
	console.log("Getting Soil Information")
    console.log("Current Link For Soil: " + link);
	request(link, function (error, response, body) {
	    if (!error && response.statusCode == 200) {
	        var soilProp= JSON.parse(body)['properties'];
        	// depth to bedrock in cm, can be interpreted as soil depth
        	shared.bedrock_depth = soilProp.BDRICM.M.BDRICM_M,
        	// approximate texture from fraction of clay, slit, and sand in soil
        	shared.clayFrac = reduceDict(soilProp.CLYPPT.M,Object.keys(soilProp.CLYPPT.M).length, 1);
        	shared.slitFrac = reduceDict(soilProp.SLTPPT.M,Object.keys(soilProp.SLTPPT.M).length, 1);
        	shared.sandFrac = reduceDict(soilProp.SNDPPT.M,Object.keys(soilProp.SNDPPT.M).length, 1);
        	// pH values are multiplied by 10 in database
        	shared.phavg = reduceDict(soilProp.PHIHOX.M,Object.keys(soilProp.PHIHOX.M).length, 10);
            callback(null);
	     }
	}
	)
};
