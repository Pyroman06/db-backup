'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactRouterDom = require('react-router-dom');

var _core = require('@blueprintjs/core');

var _toaster = require('./toaster');

var _reactRedux = require('react-redux');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Settings = function (_React$Component) {
    _inherits(Settings, _React$Component);

    function Settings(props) {
        _classCallCheck(this, Settings);

        var _this = _possibleConstructorReturn(this, (Settings.__proto__ || Object.getPrototypeOf(Settings)).call(this, props));

        _this.state = {
            region: "",
            accessKey: "",
            secretKey: "",
            error: false,
            loading: true
        };
        return _this;
    }

    _createClass(Settings, [{
        key: 'regionChange',
        value: function regionChange(e) {
            this.setState({
                region: e.target.value
            });
        }
    }, {
        key: 'accessKeyChange',
        value: function accessKeyChange(e) {
            this.setState({
                accessKey: e.target.value
            });
        }
    }, {
        key: 'secretKeyChange',
        value: function secretKeyChange(e) {
            this.setState({
                secretKey: e.target.value
            });
        }
    }, {
        key: 'saveSettings',
        value: function saveSettings() {
            var _this2 = this;

            fetch('/api/settings/save', {
                credentials: 'same-origin',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    region: this.state.region,
                    accessKey: this.state.accessKey,
                    secretKey: this.state.secretKey
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
                    _toaster.AppToaster.show({ message: "Changes were saved", intent: _core.Intent.SUCCESS });
                } else {
                    _this2.setState({
                        error: true
                    });
                    _toaster.AppToaster.show({ message: data.message, intent: _core.Intent.DANGER });
                }
            }).catch(function (err) {
                _this2.setState({
                    error: true
                });
                _toaster.AppToaster.show({ message: "Something went wrong. Please, try again later.", intent: _core.Intent.DANGER });
            });
        }
    }, {
        key: 'getSettings',
        value: function getSettings() {
            var _this3 = this;

            fetch('/api/settings/get', {
                credentials: 'same-origin',
                method: 'POST'
            }).then(function (response) {
                if (!response.ok) {
                    _this3.setState({
                        error: true,
                        loading: false
                    });
                    _toaster.AppToaster.show({ message: response.statusText, intent: _core.Intent.DANGER });
                }

                return response;
            }).then(function (response) {
                return response.json();
            }).then(function (data) {
                if (!data.error) {
                    _this3.setState({
                        region: data.settings.region,
                        accessKey: data.settings.accessKey,
                        secretKey: data.settings.secretKey,
                        error: false,
                        loading: false
                    });
                } else {
                    _this3.setState({
                        error: true,
                        loading: false
                    });
                    _toaster.AppToaster.show({ message: data.message, intent: _core.Intent.DANGER });
                }
            }).catch(function (err) {
                _this3.setState({
                    error: true,
                    loading: false
                });
                _toaster.AppToaster.show({ message: "Something went wrong. Please, try again later.", intent: _core.Intent.DANGER });
            });
        }
    }, {
        key: 'componentWillMount',
        value: function componentWillMount() {
            if (this.props.User.isLoggedIn) {
                this.getSettings.bind(this)();
            }
        }
    }, {
        key: 'render',
        value: function render() {
            if (this.props.User.isLoggedIn) {
                if (this.state.loading || this.state.error) {
                    return _react2.default.createElement(
                        'div',
                        { className: 'db-loading-fill' },
                        _react2.default.createElement(_core.Spinner, null)
                    );
                } else {
                    return _react2.default.createElement(
                        'div',
                        { className: 'db-settings' },
                        _react2.default.createElement(
                            'form',
                            null,
                            _react2.default.createElement(
                                _core.FormGroup,
                                { helperText: 'Region of your Amazon S3 bucket', label: 'Amazon S3 Region', labelFor: 'region-input' },
                                _react2.default.createElement('input', { id: 'region-input', className: 'pt-input pt-intent-primary pt-large pt-fill', type: 'text', placeholder: 'Amazon S3 Region', dir: 'auto', value: this.state.region, onChange: this.regionChange.bind(this) })
                            ),
                            _react2.default.createElement(
                                _core.FormGroup,
                                { helperText: 'Access Key ID of your Amazon IAM user', label: 'Amazon IAM Access Key ID', labelFor: 'access-key-input' },
                                _react2.default.createElement('input', { id: 'access-key-input', className: 'pt-input pt-intent-primary pt-large pt-fill', type: 'text', placeholder: 'Amazon IAM Access Key ID', dir: 'auto', value: this.state.accessKey, onChange: this.accessKeyChange.bind(this) })
                            ),
                            _react2.default.createElement(
                                _core.FormGroup,
                                { helperText: 'Secret Key of your Amazon IAM user', label: 'Amazon IAM Secret Key', labelFor: 'secret-key-input' },
                                _react2.default.createElement('input', { id: 'secret-key-input', className: 'pt-input pt-intent-primary pt-large pt-fill', type: 'password', placeholder: 'Amazon IAM Secret Key', dir: 'auto', value: this.state.secretKey, onChange: this.secretKeyChange.bind(this) })
                            ),
                            _react2.default.createElement(_core.Button, { text: 'Save', intent: _core.Intent.PRIMARY, className: 'pt-large', onClick: this.saveSettings.bind(this) })
                        )
                    );
                }
            } else {
                return _react2.default.createElement(_reactRouterDom.Redirect, { to: '/', push: true });
            }
        }
    }]);

    return Settings;
}(_react2.default.Component);

var mapStateToProps = function mapStateToProps(state) {
    return {
        User: state.User
    };
};

exports.default = (0, _reactRedux.connect)(mapStateToProps)(Settings);