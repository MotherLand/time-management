'use strict'

const MONGO_HOST = process.env.MONGO_HOST || '127.0.0.1'
const MONGO_USER = process.env.MONGO_USER || ''
const MONGO_PASSWORD = process.env.MONGO_PASSWORD || ''
const MONGO_PORT = process.env.MONGO_PORT || '27017'
const MONGO_DATABASE = process.env.MONGO_DATABASE || 'time-management'
const ENVIRONMENT = process.env.ENVIRONMENT || 'development'
const API_LISTEN_PORT = process.env.API_LISTEN_PORT || '3000'

module.exports.environment = ENVIRONMENT;
//module.exports.mongoURI = 'mongodb://' + MONGO_USER + ':' + MONGO_PASSWORD + '@' + MONGO_HOST + ':' + MONGO_PORT + '/' + MONGO_DATABASE;
module.exports.mongoURI = 'mongodb://' + MONGO_HOST + ':' + MONGO_PORT + '/' + MONGO_DATABASE;
module.exports.listenPort = ENVIRONMENT == 'test' ? '3001' : API_LISTEN_PORT;