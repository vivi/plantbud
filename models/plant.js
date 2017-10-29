var mongoose = require('mongoose');

// Define a schema
var Schema = mongoose.Schema;

var PlantSchema = new Schema({
    common_name: String,
    water: String,
    min_temp: Number,
    max_temp: Number,
    size: Number,
});

module.exports = mongoose.model('Plant', PlantSchema);
