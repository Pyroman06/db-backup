'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactRedux = require('react-redux');

var _reactRouterDom = require('react-router-dom');

var _user = require('../actions/user');

var _toaster = require('./toaster');

var _core = require('@blueprintjs/core');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var loggedInCategories = [{ name: "Dashboard", path: "/" }, { name: "Settings", path: "/settings" }];
var notLoggedInCategories = [{ name: "Home", path: "/" }];

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
                    _core.Navbar,
                    { className: 'pt-dark' },
                    _react2.default.createElement(
                        _core.NavbarGroup,
                        { align: _core.Alignment.LEFT },
                        _react2.default.createElement(
                            _core.NavbarHeading,
                            null,
                            _react2.default.createElement(
                                _reactRouterDom.Link,
                                { className: 'db-link-white', to: '/' },
                                'Database Backup'
                            )
                        ),
                        (this.props.User.isLoggedIn ? loggedInCategories : notLoggedInCategories).map(function (category) {
                            return _react2.default.createElement(
                                _reactRouterDom.Link,
                                { className: 'db-link-white', to: category.path },
                                _react2.default.createElement(_core.Button, { className: 'pt-minimal', text: category.name })
                            );
                        })
                    ),
                    this.props.User.isLoggedIn ? _react2.default.createElement(
                        _core.NavbarGroup,
                        { align: _core.Alignment.RIGHT },
                        _react2.default.createElement(
                            _core.Tag,
                            { className: 'db-margin-right', minimal: true },
                            'Logged in as ',
                            this.props.User.username
                        ),
                        _react2.default.createElement(_core.Button, { className: 'pt-minimal', text: 'Logout', intent: _core.Intent.DANGER, icon: 'log-out', onClick: this.logout.bind(this) })
                    ) : null
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
            return dispatch((0, _user.UserState)(user));
        }
    };
};

exports.default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(Header);