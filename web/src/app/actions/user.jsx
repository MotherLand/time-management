'use strict'
import axios from 'axios'
import { API_URL } from 'config'
import { asyncCompleteFail, getErrors, hideError } from 'actions'

export function saveUser(user) {
    var url = 'http://' + API_URL + '/user'
    var method = 'post';
    if (user._id) {
        url += '/' + user._id;
        method = 'put'
    }
    return (dispatch) => {
        axios({ method: method, url: url, data: user }).then((res) => {
            const response = res.data
            dispatch(finishedEditingUser())
            dispatch(fetchUsers())
        }, (err) => {
            dispatch(asyncCompleteFail(getErrors(err)))
            setTimeout(() => {
                dispatch(hideError())
            }, 5000)
        })
    }
}

export function updateProfile(user) {
    var url = 'http://' + API_URL + '/user/' + user._id
    var method = 'put'
    return (dispatch) => {
        axios({ method: method, url: url, data: user }).then((res) => {
            const response = res.data
            dispatch(finishedUpdatingProfile(response.data))
            dispatch(viewTasks(response.data))
        }, (err) => {
            dispatch(asyncCompleteFail(getErrors(err)))
            setTimeout(() => {
                dispatch(hideError())
            }, 5000)
        })
    }
}

export function fetchUsers(filter) {
    filter = filter || {
        name: ''
    }
    const queryString = `?name=${filter.name || ''}`
    return (dispatch) => {
        dispatch(updateFilter(filter))
        axios
            .get('http://' + API_URL + '/user' + queryString)
            .then((res) => {
                const response = res.data
                dispatch(usersFetched(response.data))
            }, (err) => {
                dispatch(asyncCompleteFail(getErrors(err)))
                setTimeout(() => {
                    dispatch(hideError())
                }, 5000)
            })
    }
}

export function deleteUser(user) {
    return (dispatch) => {
        axios
            .delete('http://' + API_URL + '/user/' + user._id)
            .then((res) => {
                dispatch(fetchUsers())
            }, (err) => {
                dispatch(asyncCompleteFail(getErrors(err)))
                setTimeout(() => {
                    dispatch(hideError())
                }, 5000)
            })
    }
}

export const usersFetched = (usersList) => {
    return { type: 'USERS_FETCHED_OK', usersList }
}

export const editUser = (user) => {
    return { type: 'USER_EDIT', user }
}

export const finishedEditingUser = () => {
    return { type: 'USER_FINISHED_EDITING' }
}

export const updateFilter = (filter) => {
    return { type: 'USER_FILTER_UPDATE', filter }
}

export const viewTasks = (user) => {
    return { type: 'USER_VIEW_TASKS', user }
}

export const finishedUpdatingProfile = (user) => {
    return { type: 'USER_FINISHED_UPDATING_PROFILE', user }
}
