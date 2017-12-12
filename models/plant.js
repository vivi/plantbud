var mongoose = require('mongoose');

// Define a schema
var Schema = mongoose.Schema;

var PlantSchema = new Schema({
    plant_name: String,
    search_name: String,
    opt_min_pH: Number,
    opt_max_pH: Number,
    abs_max_pH: Number,
    abs_min_pH: Number,
    opt_min_rain: Number,
    opt_max_rain: Number,
    abs_min_rain: Number,
    abs_max_rain: Number,
    opt_soil_depth: String,
    abs_soil_depth: String,
    opt_soil_text: String,
    abs_soil_text: String,
    category: String,
    optimal_min_temp: Number,
    optimal_max_temp: Number,
    absolute_min_temp: Number,
    absolute_max_temp: Number,
    opt_min_light: String,
    opt_max_light: String,
    abs_min_light: String,
    abs_max_light: String,
    lifespan: String,
    min_crop_cycle: Number,
    max_crop_cycle: Number,
    common_name: String,
});

module.exports = mongoose.model('Plant', PlantSchema);
