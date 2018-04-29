var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = mongoose.model('Backup', new Schema({ 
    database: { type: Schema.Types.ObjectId, ref: 'Database' },
    destinations: Object,
    startDate: Date,
    type: String,
    status: String,
    log: String
}));