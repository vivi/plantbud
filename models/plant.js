var mongoose = require('mongoose');

// Define a schema
var Schema = mongoose.Schema;

var PlantSchema = new Schema({
    common_name: String,
    water: String
});

module.exports = mongoose.model('Plant', PlantSchema);
