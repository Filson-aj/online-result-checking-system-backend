const rateLimit = require('express-rate-limit'),
    { logEvents } = require('./logger')

const loginLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5, // limit each IP address to 5 login requests attempt per window minute
    message: { message: `To many login attempt, please try again after a 60 seconds pause` },
    handler: (req, res, next, options) =>{
        logEvents(`Too many request: ${options?.message?.message}\t${req.method}\t${req.url}\t${req.headers.origin}`)
    },
    standardHeader: true, // return rate limit info in the ratelimit-* headers
    legacyHeader: false, // disable the X-Ratelimit-* headers
})

module.exports = loginLimiter