var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = mongoose.model('Backup', new Schema({ 
    database: String,
    destination: Object,
    startDate: Date,
    type: String,
    status: String,
    log: String
}));