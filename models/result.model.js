const mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    CustomTypes = mongoose.SchemaTypes,
    Result = new Schema({
        su: {
            type: Number,
            required: [true, `a result must have an su`],
        },
        sp: {
            type: Number,
            required: [true, `a result must have an sp`],
        },
        cu: {
            type: Number,
            required: [true, `a result must have a cu`],
        },
        cp: {
            type: Number,
            required: [true, `a result must have a cp`],
        },
        gpa: {
            type: Number,
            required: [true, `a result must have a gpa`],
        },
        cgpa: {
            type: Number,
            required: [true, `a result must have a cpga`],
        },
        level: {
            type: String,
            required: [true, `a result's level is required`],
        },
        semester: {
            type: String,
            required: [true, `a result's semester is required`],
        },
        session: {
            type: String,
            required: [true, `a result's session is required`],
        },
        courses: [{}],
        remark: {
            type: String
        },
        student: {
            type: CustomTypes.ObjectId,
            ref: 'Student',
            required: [true, 'a result must belong to a student'],
        },
    });

module.exports = mongoose.model('Result', Result);