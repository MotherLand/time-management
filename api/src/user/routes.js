'use strict'

const UserRouter = require('express').Router();
const UserModel = require('./model');
const AuthModel = require('../auth').model
const ObjectId = require('mongoose').Types.ObjectId
const ValidationError = require('mongoose').ValidationError
const jwt = require('jsonwebtoken')

// Save
const save = (data, callback) => {
    const user = new UserModel(data)
    user.role = user.role || 'user'
    UserRouter
        .AuthModel
        .encryptPassword(user.password, (err, hash) => {
            if (err) {
                return callback(err, null)
            } else {
                user.password = hash
                user.save((err, res) => {
                    callback(err, res)
                })
            }
        })
}

// Update
const update = (id, data, callback) => {
    UserModel.findById({
        _id: id
    }, (err, user) => {
        if (err) {
            return callback(err, user)
        }
        if (data.password.length > 0 && data.password !== user.password) {
            UserRouter
                .AuthModel
                .encryptPassword(data.password, (err, hash) => {
                    if (err) {
                        return callback(err, null)
                    } else {
                        data.password = hash
                        _update(user, data, callback)
                    }
                })
        } else {
            _update(user, data, callback)
        }
    })
}

const _update = (user, data, callback) => {
    Object
        .assign(user, data)
        .save((err, res) => {
            callback(err, res)
        })
}

/**
 * POST /signup creates a new user
 */
UserRouter.post('/signup', (request, response) => {
    const user = request.body
    user.role = 'user'
    save(user, (err, result) => {
        if (err) {
            return response
                .status(500)
                .json(err)
        }
        response
            .status(201)
            .json({
                token: jwt.sign(result.toObject(), UserRouter.AuthModel.secret)
            })
    })

})

/**
 * GET retrieves all users
 */
UserRouter.get('/', (request, response) => {
    const filter = {}
    if (request.query.name) {
        filter['name'] = RegExp(request.query.name, 'i')
    }
    if (request.authenticatedUser.role == 'user') {
        filter['_id'] = ObjectId(request.authenticatedUser._id)
    }
    UserModel.find(filter, (err, result) => {
        if (err) {
            return response
                .status(500)
                .end(err)
        }
        response
            .status(200)
            .json(result)
    }).sort('name')
})

/**
 * GET me returns the authenticated user
 */
UserRouter.get('/me', (request, response) => {
    UserModel.findOne({
        _id: request.authenticatedUser._id
    }, (err, user) => {
        console.log(err,user)
        if (err) {
            return response
                .status(500)
                .end(err)
        }
        if (user == null) {
            return response.status(403).json({status: 403, detail:'Could not authenticate you'})
        } else {
            response.json({
                token: jwt.sign(user.toObject(), AuthModel.secret, {
                    expiresIn: '1h'
                })
            })
        }
    })
})

/**
 * POST /user creates a new user
 */
UserRouter.post('/', (request, response) => {

    const user = request.body
    if (request.authenticatedUser.role != 'admin') {
        user.role = 'user'
    }

    save(user, (err, result) => {
        if (err) {
            return response
                .status(500)
                .json(err)
        }
        response
            .status(201)
            .json(result)
    })

})

/**
 * GET /:id retrieves a specific user
 */
UserRouter.get('/:id', (request, response) => {
    const _user = request.authenticatedUser;
    const {
        id
    } = request.params;

    if (ObjectId.isValid(id) == false) {
        return response
            .status(404)
            .json({
                name: "FormError",
                detail: 'Invalid id'
            })
    } else if (_user.role == 'user' && _user._id != id) {
        return response
            .status(403)
            .json({
                name: "AuthenticationError",
                detail: "You are not allowed to perform this action"
            })
    } else {
        UserModel.findById(id, (err, result) => {
            if (err) {
                return response
                    .status(500)
                    .json(err)
            }
            response.json(result)
        })
    }
})

/**
 * PUT /:id updates a specific user
 */
UserRouter.put('/:id', (request, response) => {
    const _user = request.authenticatedUser;
    const {
        id
    } = request.params;

    if (ObjectId.isValid(id) == false) {
        return response
            .status(404)
            .json({
                name: "FormError",
                detail: 'Invalid id'
            })
    } else if (_user.role == 'user' && _user._id != id) {
        return response
            .status(403)
            .json({
                name: "AuthenticationError",
                detail: "You are not allowed to perform this action"
            })
    } else {
        update(id, request.body, (err, result) => {
            if (err) {
                return response
                    .status(500)
                    .json(err)
            }
            response
                .status(200)
                .json(result)
        })
    }
})

/**
 * DELETE /:id delets an user
 */
UserRouter.delete('/:id', (request, response) => {
    const _user = request.authenticatedUser;
    const {
        id
    } = request.params;

    if (ObjectId.isValid(id) == false) {
        return response
            .status(404)
            .json({
                name: "FormError",
                detail: 'Invalid id'
            })
    } else if (_user.role == 'user' && _user._id != id) {
        return response
            .status(403)
            .json({
                name: "AuthenticationError",
                detail: "You are not allowed to perform this action"
            })
    } else {
        UserModel.findByIdAndRemove(id, (err, result) => {
            if (err) {
                return response
                    .status(500)
                    .json(err)
            }
            response.json({})
        })
    }
})

module.exports = (authModel) => {
    UserRouter.AuthModel = authModel
    return UserRouter
}