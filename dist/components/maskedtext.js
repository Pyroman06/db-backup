'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _core = require('@blueprintjs/core');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var MaskedText = function (_React$Component) {
    _inherits(MaskedText, _React$Component);

    function MaskedText(props) {
        _classCallCheck(this, MaskedText);

        var _this = _possibleConstructorReturn(this, (MaskedText.__proto__ || Object.getPrototypeOf(MaskedText)).call(this, props));

        _this.state = {
            isMasked: true
        };
        return _this;
    }

    _createClass(MaskedText, [{
        key: 'render',
        value: function render() {
            var _this2 = this;

            return _react2.default.createElement(
                'span',
                null,
                _react2.default.createElement(
                    'span',
                    { style: { fontStyle: this.state.isMasked ? "italic" : "normal" } },
                    this.state.isMasked ? "Content hidden" : this.props.text
                ),
                _react2.default.createElement(_core.Button, { className: 'db-margin-left-small db-button-focus', small: true, minimal: true, text: this.state.isMasked ? "Show" : "Hide", intent: _core.Intent.PRIMARY, onClick: function onClick(e) {
                        _this2.setState(function (prevState) {
                            return { isMasked: !prevState.isMasked };
                        });
                    } })
            );
        }
    }]);

    return MaskedText;
}(_react2.default.Component);

exports.default = MaskedText;