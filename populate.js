#! /usr/bin/env node

console.log('This script populates a some test books, authors, genres and bookinstances to your database. Specified database as argument - e.g.: populatedb mongodb://your_username:your_password@your_dabase_url');

//Get arguments passed on command line
var userArgs = process.argv.slice(2);
if (!userArgs[0].startsWith('mongodb://')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}

var async = require('async')
var Plant = require('./models/plant')

var mongoose = require('mongoose');
var mongoDB = userArgs[0];
mongoose.connect(mongoDB);
var db = mongoose.connection;
mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));

var plants = []

function plantCreate(common_name, water, min_temp, max_temp, cb) {
    plantdetail = {common_name: common_name,
                   water: water,
                   min_temp: min_temp,
                   max_temp: max_temp};
    var plant = new Plant(plantdetail);
    plant.save(function (err) {
    if (err) {
      cb(err, null)
      return
    }
    console.log('New Plant: ' + plant);
    plants.push(plant)
    cb(null, plant)
    });
}

function createPlants(cb) {
    async.parallel([
        function(callback) {
          plantCreate('Avocado', 'medium', 60, 85, callback);
        },
        function(callback) {
          plantCreate('Banana', 'medium', 56, 85, callback);
        },
        ],
        // optional callback
        cb);
}

async.series([
    createPlants,
],
// optional callback
function(err, results) {
    if (err) {
        console.log('FINAL ERR: '+err);
    }
    else {
        console.log('Plants: '+plants);

    }
    //All done, disconnect from database
    mongoose.connection.close();
});

