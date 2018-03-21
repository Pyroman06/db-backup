'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactRedux = require('react-redux');

var _core = require('@blueprintjs/core');

var _reactBootstrap = require('react-bootstrap');

var _user = require('../actions/user');

var _toaster = require('./toaster');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var LoginForm = function (_React$Component) {
    _inherits(LoginForm, _React$Component);

    function LoginForm(props) {
        _classCallCheck(this, LoginForm);

        var _this = _possibleConstructorReturn(this, (LoginForm.__proto__ || Object.getPrototypeOf(LoginForm)).call(this, props));

        _this.state = {
            username: "",
            password: "",
            rememberMe: false,
            loginDisabled: false,
            error: null,
            isErrorOpen: false
        };
        return _this;
    }

    _createClass(LoginForm, [{
        key: 'usernameChange',
        value: function usernameChange(e) {
            this.setState({
                username: e.target.value
            });
        }
    }, {
        key: 'passwordChange',
        value: function passwordChange(e) {
            this.setState({
                password: e.target.value
            });
        }
    }, {
        key: 'rememberMeChange',
        value: function rememberMeChange(e) {
            this.setState({
                rememberMe: e.target.checked
            });
        }
    }, {
        key: 'login',
        value: function login() {
            var _this2 = this;

            this.setState({
                loginDisabled: true
            });

            fetch('/api/login', {
                credentials: 'same-origin',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: this.state.username,
                    password: this.state.password,
                    remember: this.state.rememberMe
                })
            }).then(function (response) {
                if (!response.ok) {
                    _toaster.AppToaster.show({ message: response.statusText, intent: _core.Intent.DANGER });
                }

                return response;
            }).then(function (response) {
                return response.json();
            }).then(function (data) {
                if (!data.error) {
                    _this2.props.SetUser(data.user);
                    _toaster.AppToaster.show({ message: "You have logged in as " + data.user.username, intent: _core.Intent.SUCCESS });
                } else {
                    _this2.setState({
                        error: data.message,
                        loginDisabled: false,
                        isErrorOpen: true
                    });
                    _toaster.AppToaster.show({ message: data.message, intent: _core.Intent.DANGER });
                }
            }).catch(function (err) {
                _this2.setState({
                    error: "Something went wrong. Please, try again later.",
                    loginDisabled: false,
                    isErrorOpen: true
                });
                _toaster.AppToaster.show({ message: "Something went wrong. Please, try again later.", intent: _core.Intent.DANGER });
            });
        }
    }, {
        key: 'closeError',
        value: function closeError() {
            this.setState({
                isErrorOpen: false
            });
        }
    }, {
        key: 'render',
        value: function render() {
            return _react2.default.createElement(
                'div',
                { className: 'db-flex-row' },
                _react2.default.createElement(
                    'div',
                    { className: 'db-flex-row-item' },
                    _react2.default.createElement(
                        'h2',
                        { style: { display: "inline-block", margin: "0 auto" } },
                        'Sign into control panel'
                    ),
                    _react2.default.createElement('br', null),
                    'You must sign in to be able to manage the backups. Use credentials provided by your administrator to sign in.',
                    _react2.default.createElement('br', null),
                    'Forgot your password? Contact your administrator to reset it.'
                ),
                _react2.default.createElement(
                    'div',
                    { className: 'db-flex-row-item' },
                    _react2.default.createElement(
                        _reactBootstrap.Form,
                        { className: 'db-login-form' },
                        _react2.default.createElement(
                            'div',
                            { className: 'db-login-form-container' },
                            _react2.default.createElement(
                                _core.FormGroup,
                                { className: 'text-left', labelFor: 'db-login', label: 'Username' },
                                _react2.default.createElement('input', { id: 'db-login', className: 'pt-input pt-intent-primary pt-large pt-fill', type: 'text', placeholder: 'Username', dir: 'auto', onChange: this.usernameChange.bind(this) })
                            ),
                            _react2.default.createElement(
                                _core.FormGroup,
                                { className: 'text-left', labelFor: 'db-password', label: 'Password' },
                                _react2.default.createElement('input', { id: 'db-password', className: 'pt-input pt-intent-primary pt-large pt-fill', type: 'password', placeholder: 'Password', dir: 'auto', onChange: this.passwordChange.bind(this) })
                            ),
                            _react2.default.createElement(_core.Switch, { className: 'pt-large', checked: this.state.rememberMe, label: 'Remember me', inline: true, onChange: this.rememberMeChange.bind(this) }),
                            _react2.default.createElement('br', null),
                            _react2.default.createElement(_core.Button, { text: 'Login', className: 'pt-large pt-fill', loading: this.state.loginDisabled, onClick: this.login.bind(this) })
                        )
                    )
                )
            );
        }
    }]);

    return LoginForm;
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

exports.default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(LoginForm);