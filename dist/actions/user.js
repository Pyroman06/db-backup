'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.UserState = UserState;
exports.SetUser = SetUser;
function UserState(user) {
    return {
        type: 'USER_SETDATA',
        user: user
    };
}

function SetUser(user) {
    return function (dispatch) {
        dispatch(UserState(user));
    };
}