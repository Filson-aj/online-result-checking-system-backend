const Course = require('../models/course.model'),
    Staff = require('../models/staff.model')

// @desc Get single course
// @route GET /courses/:id
// @access Private
const index = async(req, res) =>{
    if(!req.id) return res.status(400).json({ message: `Provide course's ID`, data: []}) 

    //get coure's records
    const course = await Course.findById(req.id).lean().exec()

    if(!course) return res.status(400).json({ message: `Course records was not found`, data: []}) 

    res.json({ message: `Course's record retrieved successfully`, data: course })
}

// @desc Get all courses
// @route GET /courses
// @access Private
const show = async(req, res) =>{
    const courses = await Course.find().populate('lecturer', 'staffId name').lean().exec()

    if(!courses?.length) return res.status(400).json({ message: 'No course record was found!', data: [] })

    res.json({ message: `Course's record retrieved successfully`, data: courses })
}

// @desc create new course
// @route POST /courses
// @access Private
const create = async(req, res) =>{
    const { code, title, level, semester, unit, staffId } = req.body
    
    //confirm data
    if(!code || !title || !level || !semester || !unit || !staffId) return res.status(400).json({ message: 'All Fields are required', data: [] })

    //get staff id
    const staff = await Staff.findOne({ staffId }).collation({ locale: 'en', strength: 2 }).lean().exec()
    if(!staff) return res.status(400).json({ message: `Staff's records not found`, data: [] })
    const lecturer = staff._id

    //check for duplicate
    const duplicate = await Course.findOne({ code }).collation({ locale: 'en', strength: 2}).exec()
    if(duplicate) return res.status(409).json({ message: `Course's records already exist`, data: [] })

    //create and store new course
    const course = await Course.create({ code, title, level, semester, unit, lecturer })
    if(course){//course created
       return res.status(201).json({ message: 'New course record has been created successfully', data: course })
    }
    res.status(400).json({ message: 'Invalide course data provided', data: [] })
}

// @desc update a course
// @route PATCH /courses
// @access Private
const update = async(req, res) =>{
    const { id, code, title, level, unit, semester, staffId } = req.body

    //confirm data
    if(!id || !code || !title || !level || !unit || !semester || !staffId) return res.status(400).json({ message: 'All Fields are required', data: [] })

    //confirm course
    const course = await Course.findById(id).exec()
    if(!course) return res.status(400).json({ message: `Course's records not found`, data: [] })

    //get staff id
    const staff = await Staff.findOne({ staffId }).collation({ locale: 'en', strength: 2 }).lean().exec()
    if(!staff) return res.status(400).json({ message: `Staff's records not found`, data: [] })
    const lecturer = staff._id

    //update course details
    course.title = title
    course.level = level
    course.unit = unit
    course.semester = semester
    course.lecturer = lecturer
    await course.save()
    
    res.json({ message: `Course's records have been updated successfully `, data: course })
}

// @desc delete a course
// @route DELETE /courses/:id
// @access Private
const deleteOne = async(req, res) =>{
    const { id } = req.params

    //confirm data
    if(!id) return res.status(400).json({ message: `Provide course's ID`, data: [] })

    //confirm course
    const course = await Course.findById(id).exec()
    if(!course) return res.status(400).json({ message: `Course's records not found`, data: [] })

    await course.deleteOne()

    res.json({ message: `Course records has been deleted deleted successfully`, data: [] })
}

// @desc delete all courses except for admin
// @route DELETE /courses
// @access Private
const deleteAll = async(req, res) =>{
    await Course.deleteMany()

    res.json({ message: `Courses' records has been deleted successfully`, data: [] })
}

module.exports = {
    index,
    show,
    create,
    update,
    deleteOne,
    deleteAll
}