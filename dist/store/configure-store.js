'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = ConfigureStore;

var _redux = require('redux');

var _reducers = require('../reducers');

var _reducers2 = _interopRequireDefault(_reducers);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ConfigureStore(InitialState) {
    return (0, _redux.createStore)(_reducers2.default, InitialState);
}