const mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    User = new Schema({
        username: {
            type: String, 
            unique: {
                value: true,
                message: 'This username already exist'
            },
            required: {
                value: true,
                message: 'Username is required'
            },
        },
        password: {
            type: String,
            required: [true, 'Password is required!'],
        },
        roles: {
            type: [String],
            default: ['Student'],
        },
        active: {
            type: Boolean,
            default: true,
        },
    }, {timestamps: true})

module.exports = mongoose.model('User', User)