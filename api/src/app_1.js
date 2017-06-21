// npm imports
const http = require('http')
const express = require('express')
const WebSocket = require('ws');
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

const app = express();

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
app.use(cors({
    origin: 'http://localhost:8001',
    credentials: true
}))


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

// websocket echo route
app.use(function (req, res) {
    res.send({});
});
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
wss.on('connection', function connection(ws, req) {
    const location = url.parse(req.url, true);
    // You might use location.query.access_token to authenticate or share sessions
    // or req.headers.cookie (see http://stackoverflow.com/a/16395220/151312)

    ws.on('message', function incoming(message) {
        console.log('received: %s', message);
    });

    ws.send('something');
});

server.listen(3000, function listening() {
    console.log('Listening on %d', server.address().port);
});