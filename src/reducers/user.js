export function User(state = { isLoggedIn: false }, action) {
    switch (action.type) {
        case 'USER_SETDATA':
            return action.user;
        default:
            return state;
    }
}