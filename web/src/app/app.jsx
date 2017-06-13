import React from 'react';
import ReactDOM from 'react-dom';
import Main from './components/Main'
import { Provider } from 'react-redux'

import 'bootstrap/dist/css/bootstrap.css';
require('style-loader!css-loader!applicationStyles')

import { configure } from './store/config.jsx'

const store = configure()

ReactDOM.render(
    <Provider store={store}>
        <Main />
    </Provider>, document.getElementById('app'));