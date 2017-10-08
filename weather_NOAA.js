var fs = require('fs');
var dataset = 'NOAA DataSet/';
// change so that it's modified by user input
var latitude = '37.862612';
var longitude = '-122.261762';
// Read File line by line and store into key-value pairings
var lineReader = require('readline').createInterface({
  input: require('fs').createReadStream(dataset + 'station.txt')
});
lineReader.on('line', function (line) {
  console.log('Line from file:', line);
});

//fs.readFile(dataset + 'ann-prcp-normal.txt', 'utf8', function(err, data) {  
//    if (err) throw err;
//    console.log(data);
//});