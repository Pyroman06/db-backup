'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = mongoose.model('User', new Schema({
    username: String,
    password: String,
    email: String,
    group: String
}));