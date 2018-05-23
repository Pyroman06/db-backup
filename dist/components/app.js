'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactRedux = require('react-redux');

var _reactRouterDom = require('react-router-dom');

var _core = require('@blueprintjs/core');

var _home = require('../components/home');

var _home2 = _interopRequireDefault(_home);

var _header = require('../components/header');

var _header2 = _interopRequireDefault(_header);

var _footer = require('../components/footer');

var _footer2 = _interopRequireDefault(_footer);

var _settings = require('../components/settings');

var _settings2 = _interopRequireDefault(_settings);

var _user = require('../actions/user');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var App = function (_React$Component) {
    _inherits(App, _React$Component);

    function App(props) {
        _classCallCheck(this, App);

        var _this = _possibleConstructorReturn(this, (App.__proto__ || Object.getPrototypeOf(App)).call(this, props));

        _this.state = {
            loading: true,
            setupComplete: true
        };
        return _this;
    }

    _createClass(App, [{
        key: 'componentWillMount',
        value: function componentWillMount() {
            var _this2 = this;

            fetch('/api/getuser', {
                credentials: 'same-origin',
                method: 'POST'
            }).then(function (response) {
                if (!response.ok) {
                    throw Error(response.statusText);
                }

                return response;
            }).then(function (response) {
                return response.json();
            }).then(function (data) {
                if (!data.error) {
                    _this2.props.SetUser(data.user);
                    _this2.setState({
                        loading: false
                    });
                } else {
                    _this2.setState({
                        loading: false,
                        setupComplete: data.setupComplete
                    });
                }
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this3 = this;

            if (this.state.loading) {
                return _react2.default.createElement(
                    'div',
                    { className: 'db-loading' },
                    _react2.default.createElement(_core.Spinner, null)
                );
            } else {
                return _react2.default.createElement(
                    'div',
                    { className: 'main-container' },
                    _react2.default.createElement(_header2.default, { location: this.props.location }),
                    _react2.default.createElement(
                        _reactRouterDom.Switch,
                        { location: this.props.location },
                        _react2.default.createElement(_reactRouterDom.Route, { exact: true, path: '/', render: function render(props) {
                                return _react2.default.createElement(_home2.default, { setupComplete: _this3.state.setupComplete });
                            } }),
                        _react2.default.createElement(_reactRouterDom.Route, { exact: true, path: '/settings', component: _settings2.default }),
                        _react2.default.createElement(_reactRouterDom.Route, { path: '*', render: function render(props) {
                                return _react2.default.createElement(_reactRouterDom.Redirect, { to: '/', push: true });
                            } })
                    ),
                    _react2.default.createElement(_footer2.default, null)
                );
            }
        }
    }]);

    return App;
}(_react2.default.Component);

var mapStateToProps = function mapStateToProps(state) {
    return {
        User: state.User
    };
};

var mapDispatchToProps = function mapDispatchToProps(dispatch) {
    return {
        SetUser: function SetUser(user) {
            return dispatch((0, _user.UserState)(user));
        }
    };
};

exports.default = (0, _reactRouterDom.withRouter)((0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(App));