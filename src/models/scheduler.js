var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = mongoose.model('Scheduler', new Schema({ 
    database: String,
    destination: Object,
    rule: String
}));