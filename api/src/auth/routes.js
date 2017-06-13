'use strict'

const jwt = require('jsonwebtoken')

const AuthRouter = require('express').Router();
const AuthModel = require('./model');

/**
 * POST authenticate user
 */
AuthRouter.post('/authenticate', (request, response) => {
    AuthRouter
        .userModel
        .findOne({
            login: request.body.login
        }, (err, user) => {
            if (err || user == null) {
                return response
                    .status(401)
                    .json(err || AuthModel.AuthenticationError);
            }

            AuthModel.comparePasswords(request.body.password, user.password, (err, res) => {
                if (err || res == false) {
                    return response
                        .status(401)
                        .json(AuthModel.AuthenticationError)
                }

                response.json({
                    token: jwt.sign(user.toObject(), AuthModel.secret, {expiresIn: '1h'})
                })
            })

        })
})

module.exports = (userModel) => {
    AuthRouter.userModel = userModel
    return AuthRouter
}
