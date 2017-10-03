//npm install request@2.81.0 in the directory where your code is
var request = require('request');
var apiKey = "943689fb5bbe6e54";
var latitude = "37.776289";
var longitude = "-122.395234";
var monthDict = {
	'Jan': '01010131',
	'Feb': '02010228',
	'Mar': '03010331',
	'Apr': '04010430',
	'May': '05010531',
	'Jun': '06010630',
	'Jul': '07010731',
	'Aug': '08010831',
	'Sep': '09010930',
	'Oct': '10011031',
	'Nov': '11011130',
	'Dec': '12011231'
}
for (var key in monthDict){ 
	var url = 'http://api.wunderground.com/api/' + apiKey +'/planner_' + monthDict[key] +'/geolookup/q/' + latitude + ',' + longitude + '.json'
	var options = {
	        method: 'GET',
	        url: url,
	    };
	console.log('testing ' + url);
	request(options, function(error,response,body){
		currData = JSON.parse(body)
		//idk why key is wrong
	    console.log('Avg precipitation for ' + key + ': ' +  currData.trip.precip.avg.in + ' inches');
	});
}