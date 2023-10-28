const mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    CustomTypes = mongoose.SchemaTypes,
    Student = new Schema({
        matricNo: {
            type: String,
            required: [true, `student must have a matriculation number`],
            unique: [true, 'student must be unique'],
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
        level: {
            type: String,
            required: [true, `Student's class is required`]
        },
        contact: {
            address: {type: String},
            phone: {type: String},
        },
        user: {
            type: CustomTypes.ObjectId,
            ref: 'User',
            required: [true, 'student must have a user account'],
        },
    })

module.exports = mongoose.model('Student', Student)