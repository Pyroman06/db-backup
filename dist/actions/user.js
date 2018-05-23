'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.UserState = UserState;
function UserState(user) {
    return {
        type: 'USER_SETDATA',
        user: user
    };
}