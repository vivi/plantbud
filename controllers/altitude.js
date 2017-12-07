var request = require('request');
var ELEVATION_BASE_URL = 'https://maps.googleapis.com/maps/api/elevation/json?locations=';
var API_KEY = process.env.GOOGLE_API_KEY;
const NODATA = 'no data';


exports.altStat = function getAltitude(coord, shared, callback){
	var link = ELEVATION_BASE_URL+ coord.lat + ',' + coord.lon + '&key=' + API_KEY;
  console.log("Getting Altitude Information")
  request(link, function (error, response, body) {
    if (!error && response.statusCode == 200) {	
    	var altProp = JSON.parse(body)['results'];
    	// results given in meters, convert to feet
    	if (altProp[0]['elevation']){
    		shared.elevation = Math.round(100*altProp[0]['elevation'] * 3.28084)/100;
    	} else {
    		shared.elevation = NODATA;
    	}
    };
    callback(null);
  });
};
