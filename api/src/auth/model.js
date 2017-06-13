'use strict'

const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const express = require('express')
const validator = require('validator')

// calls back with nothing if password is not set 
const encryptPassword = (password, callback) => {
    const saltRounds = 2
    //validator only accepts strings
    password = password ? password + '' : ''
    if (validator.trim(password)) {
        bcrypt.hash(password, saltRounds, function (err, hash) {
            callback(err, hash);
        });
    } else {
        callback(null, null);
    }
}

const comparePasswords = (plainTextPassword, hash, callback) => {
    bcrypt.compare(plainTextPassword, hash, (err, res) => {
        callback(err, res)
    })
}

const AuthenticationError = {
    name: 'AuthenticationError',
    detail: 'Could not authenticate user'
}

const EmptyPasswordError = {
    name: 'EmptyPasswordError',
    detail: 'Password is empty'
}

const NoTokenError = {
    name: 'EmptyTokenError',
    detail: 'Please provide a valid token in the body, querystring or x-access-token header'
}

const secret = 'ValarMorghulis'

module.exports.encryptPassword = encryptPassword
module.exports.comparePasswords = comparePasswords
module.exports.AuthenticationError = AuthenticationError
module.exports.EmptyPasswordError = EmptyPasswordError
module.exports.NoTokenError = NoTokenError
module.exports.secret = secret