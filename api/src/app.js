'use strict'

// npm imports
const express = require('express')
const mongoose = require('mongoose')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const cors = require('cors')
const jsonApi = require('./json-api')

// app imports
const config = require('./config')
const user = require('./user')
const task = require('./task')
const auth = require('./auth')
const app = express()

// database connection setup
const dbOptions = {
    server: {
        socketOptions: {
            keepAlive: 1,
            connectTimeoutMS: 30000
        }
    },
    replset: {
        socketOptions: {
            keepAlive: 1,
            connectTimeoutMS: 30000
        }
    }
}
mongoose.connect(config.mongoURI, dbOptions)
mongoose.connection.on('error', () => {
    //todo give some time for the database to fire up
    console.log(config.mongoURI)
    console.log('db error, should try again...')
})

// app middleware
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.json({
    type: 'application/json'
}))
app.use(bodyParser.urlencoded({
    extended: true
}))
app.use(jsonApi.format);

// app routes
// authentication routes are open
app.use('/api/v1/auth', auth.routes(user.model))

// all other routes must be verified
app.use('/api/v1', auth.verify({
    excludes: ['POST /api/v1/user/signup', '/']
}))
app.use('/api/v1/user', user.routes(auth.model))
app.use('/api/v1/task', task.routes)

// default route
app.use(function (req, res) {
    res.status(404).json({
        name: 'ApplicationError',
        detail: 'We could not find the resource requested'
    })
});

// rock and roll
app.listen(config.listenPort);

module.exports = app