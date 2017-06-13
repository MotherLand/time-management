'use strict'
import axios from 'axios'
import {API_URL} from 'config'
import {asyncCompleteFail, getErrors, hideError} from 'actions'

export function saveTask(task) {
    var url = 'http://' + API_URL + '/task'
    var method = 'post';
    if (task._id) {
        url += '/' + task._id;
        method = 'put'
    }
    return (dispatch) => {
        axios({method: method, url: url, data: task}).then((res) => {
            const response = res.data
            dispatch(taskCreated())
            dispatch(finishedEditingTask())
            //grab the tasks for the owner of the recently added task
            dispatch(fetchTasks({user: response.data.user}))
        }, (err) => {
            dispatch(asyncCompleteFail(getErrors(err)))
            setTimeout(() => {
                dispatch(hideError())
            }, 5000)
        })
    }
}

export function fetchTasks(filter) {
    filter = filter || {
        from: '',
        to: '',
        user: ''
    }
    const queryString = `?from=${filter.from || ''}&to=${filter.to || ''}&user=${filter.user || ''}`
    return (dispatch) => {
        dispatch(updateFilter(filter))
        axios
            .get('http://' + API_URL + '/task' + queryString)
            .then((res) => {
                const response = res.data
                dispatch(tasksFetched(response.data))
            }, (err) => {
                dispatch(asyncCompleteFail(getErrors(err)))
                setTimeout(() => {
                    dispatch(hideError())
                }, 5000)
            })
    }
}

export function deleteTask(task) {
    return (dispatch) => {
        axios
            .delete('http://' + API_URL + '/task/' + task._id)
            .then((res) => {
                dispatch(fetchTasks())
            }, (err) => {
                dispatch(asyncCompleteFail(getErrors(err)))
                setTimeout(() => {
                    dispatch(hideError())
                }, 5000)
            })
    }
}

export function fetchTasksForExport(filter) {
    filter = filter || {
        from: '',
        to: '',
        user: ''
    }
    const queryString = `?from=${filter.from || ''}&to=${filter.to || ''}&user=${filter.user || ''}`
    return (dispatch) => {
        dispatch(updateFilter(filter))
        axios
            .get('http://' + API_URL + '/task/export' + queryString)
            .then((res) => {
                const response = res.data
                dispatch(exportTasksFetched(response.data))
            }, (err) => {
                dispatch(asyncCompleteFail(getErrors(err)))
                setTimeout(() => {
                    dispatch(hideError())
                }, 5000)
            })
    }
}

export function loadUserOptions() {
    return (dispatch) => {
        axios
            .get('http://' + API_URL + '/user')
            .then((res) => {
                const response = res.data
                dispatch(userOptionsFetched(response.data))
            }, (err) => {
                dispatch(asyncCompleteFail(getErrors(err)))
                setTimeout(() => {
                    dispatch(hideError())
                }, 5000)
            })
    }
}

export const taskCreated = () => {
    return {type: 'TASK_CREATED_OK'}
}

export const tasksFetched = (tasksList) => {
    return {type: 'TASKS_FETCHED_OK', tasksList}
}

export const exportTasksFetched = (exportTasksList) => {
    return {type: 'TASKS_EXPORT_FETCHED_OK', exportTasksList}
}

export const editTask = (task) => {
    return {type: 'TASK_EDIT', task}
}

export const finishedEditingTask = () => {
    return {type: 'TASK_FINISHED_EDITING'}
}

export const exportTasks = (filter) => {
    return {type: 'TASK_EXPORT', filter}
}

export const updateFilter = (filter) => {
    return {type: 'TASK_FILTER_UPDATE', filter}
}

export const userOptionsFetched = (userOptions) => {
    return {type: 'TASK_USER_OPTIONS_FETCHED', userOptions}
}