const { logEvents } = require('./logger')

const errorHandler = (err, req, res, next) =>{
    logEvents(`${err.name}: ${req.message}\t${req.method}\t${req.url}\t${req.headers.origin}`, 'errorLog.log')

    const status = res.statuscode ? res.statuscode : 500 // server error
    
    res.status(status)

    res.json({ message: err.message, isError: true })
}

module.exports = errorHandler