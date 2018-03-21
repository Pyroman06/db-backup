'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = mongoose.model('Scheduler', new Schema({
    database: { type: Schema.Types.ObjectId, ref: 'Database' },
    destination: Object,
    rule: String
}));