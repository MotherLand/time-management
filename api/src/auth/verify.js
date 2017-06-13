'use strict'

const jwt = require('jsonwebtoken')
const router = require('express').Router()
const AuthModel = require('./model')

module.exports = (config) => {
    const excludes = config['excludes'] || [];

    router.use((request, response, next) => {
        if (excludes.indexOf(request.method
            + ' ' + request.originalUrl) === -1) {
            var token = request.body.token || request.query.token || request.headers['x-access-token'];
            if (token) {
                jwt.verify(token, AuthModel.secret, (err, decoded) => {
                    if (err) {
                        return response.status(403).json(AuthModel.AuthenticationError)
                    }
                    request.authenticatedUser = decoded
                    next();
                })
            } else {
                return response.status(403).json(AuthModel.NoTokenError)
            }
        } else {
            next();
        }
    })

    return router
}