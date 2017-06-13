'use strict'

import {combineReducers, createStore, applyMiddleware, compose} from 'redux'
import {appReducer, userReducer, signUpReducer, tasksReducer, usersReducer} from './../reducers/index.jsx'
const thunk = require('redux-thunk')

export var configure = () => {

    const reducer = combineReducers({app: appReducer, user: userReducer, tasks: tasksReducer, users: usersReducer});

    const store = createStore(reducer, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(), compose(applyMiddleware(thunk.default)));

    return store;
}