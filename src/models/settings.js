var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = mongoose.model('Settings', new Schema({ 
    uniqueId: String,
    value: String
}));