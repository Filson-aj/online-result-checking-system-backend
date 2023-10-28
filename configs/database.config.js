const mongoose = require('mongoose'),
    { logEvents } = require('../middleware/logger')

module.exports = {// database module
    connnect: async() =>{
        const url = process.env.NODE_ENV === 'production' ? process.env.DB_URI_O : process.env.DB_URI_L
        try {
            mongoose.set('strictQuery', true) // turn on strict query mode

            await mongoose.connect(url, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            })
        } catch (err) {
            console.log(`An error occured while connecting to the database: ${err}`)
            logEvents(`An error occured while connecting to the database: ${err}`, 'mongoErrLog.log')
        }
    }
}