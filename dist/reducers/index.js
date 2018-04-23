'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _redux = require('redux');

var _user = require('./user');

exports.default = (0, _redux.combineReducers)({
    User: _user.User
});