'use strict'

const routes = require('./routes');
const model = require('./model');

module.exports = {
    routes: (authModel) => {
        return routes(authModel)
    },
    model: model
}