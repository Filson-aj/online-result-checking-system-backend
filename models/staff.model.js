const mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    CustomTypes = mongoose.SchemaTypes,
    Staff = new Schema({
        staffId: {
            type: String,
            required: [true, `staff must have a staff id`],
            unique: [true, 'staff must be unique'],
        },
        name: {
            firstName: {type: String},
            surname: {type: String},
            otherName: {type: String},
        },
        gender: {
            type: String,
            enum: {
                values: ['Male', 'Female'],
                message: '{VALUE} is not a supported gender',
            },
            default: 'Male',
        },
        qualification: {
            type: String,
            required: [true, 'Please provide qualification']
        },
        contact: {
            address: {type: String},
            phone: {type: String},
        },
        user: {
            type: CustomTypes.ObjectId,
            ref: 'User',
            required: [true, 'A staff must be an active user'],
        },
    })

module.exports = mongoose.model('Staff', Staff)