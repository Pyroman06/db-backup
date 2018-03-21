'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.User = User;
function User() {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { isLoggedIn: false };
    var action = arguments[1];

    switch (action.type) {
        case 'USER_SETDATA':
            return action.user;
        default:
            return state;
    }
}