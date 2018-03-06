import { createStore, applyMiddleware } from 'redux';
import Thunk from 'redux-thunk';
import RootReducer from '../reducers';

export default function ConfigureStore(InitialState) {
    return createStore(
        RootReducer,
        InitialState,
        applyMiddleware(Thunk)
    );
}