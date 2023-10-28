const mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    CustomTypes = mongoose.SchemaTypes,
    Score = new Schema({
        ca: {
            type: Number,
            required: [true, `a score must have a ca`],
        },
        exams: {
            type: Number,
            required: [true, `a score must have an exams`],
        },
        grade: {
            type: String,
            required: [true, `a score must have a grade`],
        },
        points: {
            type: Number,
            required: [true, `a score must have a point`],
        },
        remark: {
            type: String,
            required: [true, `a score must have a remark`],
        },
        level: {
            type: String,
            required: [true, 'level is required']
        },
        semester: {
            type: String,
            required: [true, 'semester is required']
        },
        session: {
            type: String,
            required: [true, `a score's session is required`],
        },
        student: {
            type: CustomTypes.ObjectId,
            ref: 'Student',
            required: [true, 'a score must belong to a student'],
        },
        course: {
            type: CustomTypes.ObjectId,
            ref: 'Course',
            required: [true, 'a score must belong to a course'],
        },
    })

module.exports = mongoose.model('Score', Score)