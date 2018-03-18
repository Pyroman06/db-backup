var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = mongoose.model('Database', new Schema({ 
    name: String,
    engine: String,
    options: Object
}));