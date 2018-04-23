'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactRedux = require('react-redux');

var _reactRouterDom = require('react-router-dom');

var _reactBootstrap = require('react-bootstrap');

var _reactRouterBootstrap = require('react-router-bootstrap');

var _user = require('../actions/user');

var _toaster = require('./toaster');

var _core = require('@blueprintjs/core');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Header = function (_React$Component) {
    _inherits(Header, _React$Component);

    function Header() {
        _classCallCheck(this, Header);

        return _possibleConstructorReturn(this, (Header.__proto__ || Object.getPrototypeOf(Header)).apply(this, arguments));
    }

    _createClass(Header, [{
        key: 'logout',
        value: function logout() {
            var _this2 = this;

            fetch('/api/logout', {
                credentials: 'same-origin',
                method: 'POST'
            }).then(function (response) {
                if (!response.ok) {
                    _toaster.AppToaster.show({ message: response.statusText, intent: _core.Intent.DANGER });
                }

                return response;
            }).then(function (response) {
                return response.json();
            }).then(function (data) {
                if (!data.error) {
                    _this2.props.SetUser({ isLoggedIn: false });
                    _toaster.AppToaster.show({ message: "You have logged out", intent: _core.Intent.SUCCESS });
                }
            });
        }
    }, {
        key: 'render',
        value: function render() {
            return _react2.default.createElement(
                'header',
                null,
                _react2.default.createElement(
                    _reactBootstrap.Navbar,
                    { inverse: true, collapseOnSelect: true },
                    _react2.default.createElement(
                        _reactBootstrap.Navbar.Header,
                        null,
                        _react2.default.createElement(
                            _reactBootstrap.Navbar.Brand,
                            null,
                            _react2.default.createElement(
                                _reactRouterDom.Link,
                                { to: '/' },
                                'Database Backup'
                            )
                        ),
                        _react2.default.createElement(_reactBootstrap.Navbar.Toggle, null)
                    ),
                    this.props.User.isLoggedIn ? _react2.default.createElement(
                        _reactBootstrap.Navbar.Collapse,
                        null,
                        _react2.default.createElement(
                            _reactBootstrap.Nav,
                            null,
                            _react2.default.createElement(
                                _reactRouterBootstrap.LinkContainer,
                                { exact: true, to: '/' },
                                _react2.default.createElement(
                                    _reactBootstrap.NavItem,
                                    { eventKey: 1 },
                                    'Dashboard'
                                )
                            ),
                            _react2.default.createElement(
                                _reactRouterBootstrap.LinkContainer,
                                { to: '/settings' },
                                _react2.default.createElement(
                                    _reactBootstrap.NavItem,
                                    { eventKey: 2 },
                                    'Settings'
                                )
                            )
                        ),
                        _react2.default.createElement(
                            _reactBootstrap.Nav,
                            { pullRight: true },
                            _react2.default.createElement(
                                _reactBootstrap.NavItem,
                                { eventKey: 1, onClick: this.logout.bind(this) },
                                'Logout'
                            )
                        ),
                        _react2.default.createElement(
                            _reactBootstrap.Navbar.Text,
                            { pullRight: true },
                            'Logged in as ',
                            this.props.User.username
                        )
                    ) : _react2.default.createElement(
                        _reactBootstrap.Navbar.Collapse,
                        null,
                        _react2.default.createElement(
                            _reactBootstrap.Nav,
                            null,
                            _react2.default.createElement(
                                _reactRouterBootstrap.LinkContainer,
                                { to: '/' },
                                _react2.default.createElement(
                                    _reactBootstrap.NavItem,
                                    { eventKey: 1 },
                                    'Home'
                                )
                            )
                        )
                    )
                )
            );
        }
    }]);

    return Header;
}(_react2.default.Component);

var mapStateToProps = function mapStateToProps(state) {
    return {
        User: state.User
    };
};

var mapDispatchToProps = function mapDispatchToProps(dispatch) {
    return {
        SetUser: function SetUser(user) {
            return dispatch((0, _user.SetUser)(user));
        }
    };
};

exports.default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(Header);