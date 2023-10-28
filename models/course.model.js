const mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    CustomTypes = mongoose.SchemaTypes,
    Course = new Schema({
        code: {
            type: String,
            required: [true, `a course must have a course code`],
            unique: [true, 'a course must be unique'],
        },
        title: {
            type: String,
            required: [true, `a course's title is required`],
        },
        level: {
            type: String,
            required: [true, 'course level is required']
        },
        semester: {
            type: String,
            required: [true, 'course must belong in a semester']
        },
        unit: {
            type: Number,
            required: [true, `a course's unit is required`],
        },
        lecturer: {
            type: CustomTypes.ObjectId,
            ref: 'Staff',
            required: [true, 'a course must be assigned to a lecturer'],
        }
    })

module.exports = mongoose.model('Course', Course);