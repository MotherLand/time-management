'use strict'
import axios from 'axios'
import { API_URL } from 'config'

// User actions
export function login(username, password) {
    return (dispatch) => {
        axios
            .post('http://' + API_URL + '/auth/authenticate', {
                login: username,
                password: password
            })
            .then((res) => {
                const response = res.data
                const token = response.data.token
                dispatch(userAuthenticated(token))
            }, (err) => {
                dispatch(asyncCompleteFail(getErrors(err)))
                setTimeout(() => {
                    dispatch(hideError())
                }, 5000)
            })
    }
}

export function signUp(newUser) {
    return (dispatch) => {
        axios
            .post('http://' + API_URL + '/user/signup', newUser)
            .then((res) => {
                const response = res.data
                const token = response.data.token
                dispatch(userAuthenticated(token))
            }, (err) => {
                dispatch(asyncCompleteFail(getErrors(err)))
                setTimeout(() => {
                    dispatch(hideError())
                }, 5000)
            })
    }
}

// will be called when the page is refreshed or the user accesses the app before
// authentication
export const verifyUserAuthentication = (storeToken) => {
    const sessionToken = sessionStorage.getItem('token') || '';
    if ((storeToken || '').length == 0) {
        // no token in store
        if (sessionToken.length > 0) {
            // token found in sessionStorage, verify and redirect
            return verifyToken(sessionToken)
        }
    }
    return userAuthenticationFailed()
}

export const verifyToken = (token) => {
    return (dispatch) => {
        axios
            .create({
                headers: {
                    'x-access-token': token
                }
            })
            .get('http://' + API_URL + '/user/me')
            .then((res) => {
                const response = res.data
                dispatch(userAuthenticated(response.data.token))
            }, (err) => {
                dispatch(asyncCompleteFail(getErrors(err)))
                dispatch(userAuthenticationFailed())
                setTimeout(() => {
                    dispatch(hideError())
                }, 5000)
            })
    }
}

export const getErrors = (err) => {
    var errors
    const errorData = err.response.data;
    const status = err.response.status
    if (typeof errorData.meta == 'object') {
        if (errorData.meta && errorData.meta.code > 0) {
            errors = {
                status: status,
                detail: errorData.meta.errmsg
            }
        } else if (errorData.meta.detail) {
            errors = {
                status: status,
                detail: errorData.meta.detail
            }
        }
    } else {
        errors = {
            status: status,
            detail: 'We could not process your request'
        }
    }
    return errors
}

export const logOut = () => {
    return { type: 'USER_LOGOUT' }
}

export const asyncCompleteFail = (error) => {
    return { type: 'ASYNC_COMPLETE_FAIL', error }
}

export const formValidationFail = (error) => {
    return { type: 'FORM_VALIDATION_FAIL', error }
}

export const hideError = () => {
    return { type: 'APP_ERROR_RESET' }
}

export const userAuthenticated = (token) => {
    return { type: 'USER_AUTHENTICATED', token }
}

export const userAuthenticationFailed = () => {
    return { type: 'USER_AUTHENTICATION_FAILED' }
}

export const resetRedirect = () => {
    return { type: 'APP_REDIRECT_RESET' }
}