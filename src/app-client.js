import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import ConfigureStore from './store/configure-store';
import App from './components/app';
require('normalize.css/normalize.css');
require('@blueprintjs/core/lib/css/blueprint.css');

const Store = ConfigureStore();

const Router = (
    <Provider store={Store}>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </Provider>
);

window.onload = () => {
    ReactDOM.render(Router, document.getElementById('main'));
};