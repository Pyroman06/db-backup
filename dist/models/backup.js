'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = mongoose.model('Backup', new Schema({
    database: { type: Schema.Types.ObjectId, ref: 'Database' },
    destination: { type: Schema.Types.ObjectId, ref: 'Destination' },
    filename: String,
    startDate: Date,
    type: String,
    status: String,
    log: String
}));