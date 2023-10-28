require('dotenv').config()
require('express-async-errors')
const express = require('express'),
    cors = require('cors'),
    morgan = require('morgan'),
    path = require('path'),
    cookieParser = require('cookie-parser'),
    { logger } = require('../middleware/logger'),
    corsOptions = require('./corsOptions'),
    errorHandler = require('../middleware/errorHandler'),
    publicRoutes = require('../routes/public.routes')

module.exports = app =>{
    //app's middleware configuration
    app.use(logger)
    app.use(express.json())
    app.use(cors(corsOptions))
    app.use(cookieParser())
    app.use('/', express.static(path.join(global.root, 'public')))
    app.use(morgan('dev'))

    //unprotected routes
    app.use('/', require('../routes/root.routes')) //root routing for the application
    app.use(publicRoutes) //public routing for the application
    app.use('/auth', require('../routes/auth.routes')) // authentication routes

    //protected routes
    app.use('/users', require('../routes/user.routes')) //users' routing

    app.use('/staffs', require('../routes/staff.routes')) //staff's routing

    app.use('/students', require('../routes/student.routes')) //student's routing

    app.use('/courses', require('../routes/course.routes')) //course's routing

    app.use('/scores', require('../routes/score.routes')) //score's routing

    app.use('/results', require('../routes/result.routes')) //result's routing

    //unmatch route
    app.all('*', (req, res) =>{
        res.status(404)
        if(req.accepts('html')){
            res.sendFile(path.join(global.root, 'views', '404.html'))
        } else if(req.accepts('json')){
            res.json({ message: '404 Not Found' })
        }else{
            res.type('txt').send('404 Not Found')
        }
    })

    //error handler middlerware
    app.use(errorHandler)

    return app
}