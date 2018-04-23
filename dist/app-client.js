'use strict';

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _reactRouterDom = require('react-router-dom');

var _reactRedux = require('react-redux');

var _configureStore = require('./store/configure-store');

var _configureStore2 = _interopRequireDefault(_configureStore);

var _app = require('./components/app');

var _app2 = _interopRequireDefault(_app);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

require('normalize.css/normalize.css');
require('@blueprintjs/core/lib/css/blueprint.css');

var Store = (0, _configureStore2.default)();

var Router = _react2.default.createElement(
    _reactRedux.Provider,
    { store: Store },
    _react2.default.createElement(
        _reactRouterDom.BrowserRouter,
        null,
        _react2.default.createElement(_app2.default, null)
    )
);

window.onload = function () {
    _reactDom2.default.render(Router, document.getElementById('main'));
};