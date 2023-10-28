const express = require('express'),
    mongoose = require('mongoose'),
    configuration = require('./configs/server.config'),
    database = require('./configs/database.config'),
    { logEvents } = require('./middleware/logger'),
    PORT = process.env.PORT || 8585

//instantiate the express server
let app = express()

//basic configuration for the application
global.root = __dirname
app = configuration(app)

//start database
database.connnect()


mongoose.connection.once('open', () =>{
    console.log('Connected to MongoDB')
    app.listen(PORT, console.log(`Server is running on: http://localhost:${PORT}`))
})

mongoose.connection.on('error', err =>{
    console.log(err)
    logEvents(`${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`, `mongoErrLog.log`)
})