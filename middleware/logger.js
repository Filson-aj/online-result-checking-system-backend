const moment = require('moment'),
    { v4: uuid } = require('uuid'),
    fs = require('fs'),
    fsPromise = require('fs').promises,
    path = require('path')

const logEvents = async(message, logFilename) =>{
    const dateTime = moment(new Date()).format('YYYY-MM-DD'),
        logItem = `${dateTime}\t${uuid()}\t${message}\n`,
        logPath = path.join(__dirname, '..', 'logs')

    try {
        !fs.existsSync(logPath) && await fsPromise.mkdir(logPath)
        
        await fsPromise.appendFile(`${path.join(logPath, logFilename)}`, logItem)
    } catch (err) {
        console.log(err)
    }
}

const logger = (req, res, next) =>{
    logEvents(`${req.method}\t${req.url}\t${req.headers.origin}`, 'regLog.log')
    next()
}

module.exports = { logEvents, logger, }