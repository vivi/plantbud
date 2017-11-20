#! /usr/bin/env node

console.log('This script populates a some test books, authors, genres and bookinstances to your database. Specified database as argument - e.g.: populatedb mongodb://your_username:your_password@your_dabase_url');

//Get arguments passed on command line
var userArgs = process.argv.slice(2);
if (!userArgs[0].startsWith('mongodb://')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}

var async = require('async');
var fs = require("fs");
var FRUIT_DATASET = 'data/fruits/';
var ECO_DATASET = 'data/plants/';
var Plant = require('./models/plant');

var mongoose = require('mongoose');
var mongoDB = userArgs[0];
mongoose.connect(mongoDB);
var db = mongoose.connection;
mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));

var plants = [];

var plantsData = [];
// -10000 set as default value if NaN produced
function readDataSet(directory) {
    var fs = require("fs");
    var files = fs.readdirSync(directory);
    for (file in files) {
        var currFile = ECO_DATASET + files[file];
        var data = fs.readFileSync(currFile);
        var content = JSON.parse(data);
        console.log("*START*");
        console.log(currFile);
        var plantDict = {
            plant_name: content['Plant Name'][0],
            opt_min_pH: parseFloat(content['Soil PH'][0])|| -10000,
            opt_max_pH: parseFloat(content['Soil PH'][1])|| -10000,
            abs_max_pH: parseFloat(content['Soil PH'][2])|| -10000,
            abs_min_pH: parseFloat(content['Soil PH'][3])|| -10000,
            opt_min_rain: Math.round(100*(parseFloat(content['Rainfall (annual)'][0])/25.4))/100|| -10000,
            opt_max_rain: Math.round(100*(parseFloat(content['Rainfall (annual)'][1])/25.4))/100|| -10000,
            abs_min_rain: Math.round(100*(parseFloat(content['Rainfall (annual)'][2])/25.4))/100|| -10000,
            abs_max_rain: Math.round(100*(parseFloat(content['Rainfall (annual)'][3])/25.4))/100|| -10000,
            opt_soil_depth: content['Soil depth'][0],
            abs_soil_depth: content['Soil depth'][1],
            opt_soil_text: content['Soil texture'][0],
            abs_soil_text: content['Soil texture'][1],
            category: content['Category'][0],
            // temperature is in Celsius 
            optimal_min_temp: Math.round(10*(parseInt(content["Temperat. requir."][0])*1.8 + 32))/10|| -10000,
            optimal_max_temp: Math.round(10*(parseInt(content["Temperat. requir."][1])*1.8 + 32))/10|| -10000,
            absolute_min_temp: Math.round(10*(parseInt(content["Temperat. requir."][2])*1.8 + 32))/10|| -10000,
            absolute_max_temp: Math.round(10*(parseInt(content["Temperat. requir."][3])*1.8 + 32))/10|| -10000,
            opt_min_light: content['Light intensity'][0],
            opt_max_light: content['Light intensity'][1],
            abs_min_light: content['Light intensity'][2],
            abs_max_light: content['Light intensity'][3],
            lifespan: content["Life span"][0],
            min_crop_cycle: parseInt(content['Crop cycle'][0]) || -10000,
            max_crop_cycle: parseInt(content['Crop cycle'][1]) || -10000
        }
        plantsData.push(plantDict)
        console.log("*EXIT* ");
    }
}


function plantCreate(plantDict, cb) {
    var plant = new Plant(plantDict);
    plant.save(function (err) {
    if (err) {
      cb(err, null);
      return
    }
    console.log('New Plant: ' + plant.plant_name);
    plants.push(plant);
    cb(null, plant)
    });
}

function createPlants(cb) {
    async.map(
      plantsData,
      plantCreate,
      // optional callback
      cb);
}

function emptyPlants(cb) {
  Plant.remove({}, function(err) {
    console.log('collection removed');
    cb(null);
  });
}

function readPlants(cb) {
  readDataSet(ECO_DATASET);
  return cb(null);
}

async.series([
    emptyPlants,
    readPlants,
    createPlants,
],

// optional callback
function(err, results) {
    if (err) {
        console.log('FINAL ERR: '+ err);
    }
    else {
        console.log('Plants: '+ plants);
    }
    //All done, disconnect from database
    mongoose.connection.close();
});
