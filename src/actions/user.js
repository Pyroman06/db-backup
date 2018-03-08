export function UserState(user) {
    return {
        type: 'USER_SETDATA',
        user: user
    };
}

export function SetUser(user) {
    return (dispatch) => {
        dispatch(UserState(user));
    };
}