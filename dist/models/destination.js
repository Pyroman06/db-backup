'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = mongoose.model('Destination', new Schema({
    name: String,
    provider: String,
    options: Object
}));