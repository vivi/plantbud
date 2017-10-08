//NOAA dataset retrieval
//npm install request@2.81.0 in the directory where your code is
var request = require('request');
var token = 'pYWnSyioUrDrMQYqYIGxLwfJISswfjPV';
var endPoint = 'https://www.ncdc.noaa.gov/cdo-web/api/v2/datacategories?limit=41';
headers = {'token': token}
var latitude = "37.776289";
var longitude = "-122.395234";
var options = {
        method: 'GET',
        url: endPoint,
        headers: {
        	'token': token
        }
    };
console.log('testing ' + endPoint);
request(options, function(error,response,body){
	currData = JSON.parse(body)
	//idk why key is wrong
    console.log(currData);
});
