'use strict'
const LISTEN_PORT = process.env['WEB_LISTEN_PORT'] || 8001
const express = require('express')
const app = express()

app.use(express.static('public'))

app.listen(LISTEN_PORT,()=>{
    console.log('server up and running')
})