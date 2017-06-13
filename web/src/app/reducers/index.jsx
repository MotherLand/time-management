'use strict'
import redux from 'redux'
import axios from 'axios'
import { hashHistory } from 'react-router'

// app
const initialAppState = {
    error: {},
    isLoading: false,
    redirect: null
}

axios.defaults.headers.common['x-access-token'] = sessionStorage.getItem('token');

export const appReducer = (state = initialAppState, action) => {
    switch (action.type) {
        case 'ASYNC_COMPLETE_FAIL':
            var redirect = ''
            if ((action.error || {}).status == 403) {
                redirect = '/'
            }
            return Object.assign({}, state, {
                error: action.error,
                redirect: redirect
            })
        case 'FORM_VALIDATION_FAIL':
            return Object.assign({}, state, { error: action.error })
        case 'APP_ERROR_RESET':
            return Object.assign({}, state, { error: {} })
        case 'APP_REDIRECT_RESET':
            return Object.assign({}, state, { redirect: null })
        case 'USER_AUTHENTICATION_FAILED':
            sessionStorage.removeItem('token');
            delete (axios.defaults.headers.common['x-access-token']);
            return Object.assign({}, { redirect: '/' });
        case 'USER_LOGOUT':
            sessionStorage.removeItem('token');
            delete (axios.defaults.headers.common['x-access-token']);
            return Object.assign(initialAppState, { redirect: '/' });
        case 'TASK_EXPORT':
            return Object.assign({}, state, { redirect: '/export' })
        case 'USER_VIEW_TASKS':
            return Object.assign({}, state, { redirect: '/tasks' })
        default:
            return state
    }
}

// user
const initialUserState = {
    username: null,
    password: null,
    token: null
}

export const userReducer = (state = initialUserState, action) => {
    switch (action.type) {
        case 'ASYNC_COMPLETE_FAIL':
            if ((action.error || {}).status == 403) {
                return {}
            }
            return state
        case 'USER_AUTHENTICATION_FAILED':
            return {}
        case 'USER_AUTHENTICATED':
            const token = action.token;
            const user = JSON.parse(atob(action.token.split('.')[1]));
            sessionStorage.setItem('token', token);
            axios.defaults.headers.common['x-access-token'] = sessionStorage.getItem('token');
            return Object.assign({}, state, {
                ...user,
                token: token
            })
        case 'USER_FINISHED_UPDATING_PROFILE':
            const updatedUser = action.user
            return Object.assign({}, state, {
                ...updatedUser
            })
        case 'USER_LOGOUT':
            return initialUserState
        default:
            return state
    }
}

// users
const initalUsersState = {
    usersList: [],
    editingUser: null,
    filter: {
        name: ''
    }
}
export const usersReducer = (state = initalUsersState, action) => {
    switch (action.type) {
        case 'USER_CREATED_OK':
            return Object.assign({}, state, { editingUser: null })
        case 'USERS_FETCHED_OK':
            return Object.assign({}, state, { usersList: action.usersList })
        case 'USER_EDIT':
            return Object.assign({}, state, { editingUser: action.user })
        case 'USER_FINISHED_EDITING':
            return Object.assign({}, state, { editingUser: null })
        case 'USER_FILTER_UPDATE':
            return Object.assign({}, state, { filter: action.filter })
        case 'USER_FINISHED_UPDATING_PROFILE':
            const updatedUser = action.user
            return Object.assign({}, state, { editingUser: updatedUser })
        case 'USER_LOGOUT':
            return initalUsersState
        default:
            return state;
    }
}

// tasks
const initalTasksState = {
    tasksList: [],
    editingTask: null,
    filter: {
        from: '',
        to: '',
        user: ''
    },
    exportTasksList: null,
    viewingTasksForUser: null,
    userOptions: []
}
export const tasksReducer = (state = initalTasksState, action) => {
    switch (action.type) {
        case 'TASK_CREATED_OK':
            return Object.assign({}, state, {
                filter: {
                    from: '',
                    to: '',
                    user: ''
                },
                editingTask: null
            })
        case 'TASKS_FETCHED_OK':
            return Object.assign({}, state, { tasksList: action.tasksList })
        case 'TASKS_EXPORT_FETCHED_OK':
            return Object.assign({}, state, { exportTasksList: action.exportTasksList })
        case 'TASK_EDIT':
            return Object.assign({}, state, { editingTask: action.task })
        case 'TASK_FINISHED_EDITING':
            return Object.assign({}, state, { editingTask: null })
        case 'TASK_FILTER_UPDATE':
            return Object.assign({}, state, { filter: action.filter })
        case 'USER_VIEW_TASKS':
            return Object.assign({}, state, {
                viewingTasksForUser: action.user,
                filter: {
                    user: action.user._id
                }
            })
        case 'TASK_USER_OPTIONS_FETCHED':
            return Object.assign({}, state, { userOptions: action.userOptions })
        case 'USER_LOGOUT':
            return initalTasksState
        default:
            return state;
    }
}