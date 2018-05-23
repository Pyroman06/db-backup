import { createStore, applyMiddleware } from 'redux';
import RootReducer from '../reducers';

export default function ConfigureStore(InitialState) {
    return createStore(
        RootReducer,
        InitialState
    );
}