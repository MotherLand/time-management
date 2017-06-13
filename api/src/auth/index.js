'use strict'

const bcrypt = require('bcrypt')
const model = require('./model')
const routes = require('./routes')
const verify = require('./verify')

module.exports = {
    model: model,
    routes: (userModel) => {
        return routes(userModel)
    },
    verify: (config) => {
        return verify(config)
    }
}