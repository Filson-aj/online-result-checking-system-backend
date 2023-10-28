const allowedOrigins = require('./allowedOrigins')

module.exports = {
    origin: (origin, callback) =>{
        allowedOrigins.indexOf(origin) !== -1 || !origin ? callback(null, true) : callback(new Error('Not allowed by CORS'))
    },
    credentials: true,
    optionsSuccessStatus: 200,
}