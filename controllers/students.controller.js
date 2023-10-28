const Student = require('../models/student.model')

// @desc Get single student
// @route GET /students/:id
// @access Private
const index = async(req, res) =>{
    if(!req.id) return res.status(400).json({ message: `Provide student's ID`, data: [] }) 
    
    //get student's records
    const student = await Student.findById(req.id).populate('user', 'email').lean().exec()

    if(!student) return res.status(400).json({ message: `Student's records was not found!`, data: [] })

    res.json({ message: `Student's record retrieved successfully!`,  data: student })
}

// @desc Get all students
// @route GET /students
// @access Private
const show = async(req, res) =>{
    const students = await Student.find().populate('user', 'email').lean().exec()

    if(!students?.length) return res.status(400).json({ message: `Students' records were not found!`, data: [] })

    res.json({ message: `Students' records retrieved successfully`, data: students })
}

// @desc create new student
// @route POST /students
// @access Private
const create = async(req, res) =>{
    const { matricNo, name, gender, level, contact, user} = req.body

    //confirm data
    if(!matricNo || !gender || !level || !user) return res.status(400).json({ message: 'All Fields are required', data: [] })

    //check for duplicate
    const duplicate = await Student.findOne({ matricNo }).collation({ locale: 'en', strength: 2}).lean().exec()
    if(duplicate) return res.status(409).json({ message: `Student with matric no. ${matricNo} already exist`, data: [] })

    //create and store new student
    const student = await Student.create({ matricNo, name, gender, level, contact, user })
    if(student){//student created
       return res.status(201).json({ message: `New student record has been created successfully`, data: student })
    }
    res.status(400).json({ message: 'Invalide student data provided', data: [] })
}

// @desc update a student
// @route PATCH /students
// @access Private
const update = async(req, res) =>{
    const { id, matricNo, name, gender, level, contact } = req.body

    //confirm data
    if( !id || !matricNo || !gender || !level) return res.status(400).json({ status: 'Error', message: 'All Fields are required', data: [] })

    //confirm student
    const student = await Student.findById(id).exec()
    if(!student) return res.status(400).json({ message: `Student's records not found`, data: [] })

    student.name = name
    student.gender = gender
    student.level = level
    student.contact = contact
    await student.save()
    
    res.json({ message: `Student's records have been updated successfully`, data: student, })
}

// @desc delete a student
// @route DELETE /students/:id
// @access Private
const deleteOne = async(req, res) =>{
    const { id } = req.params

    //confirm data
    if(!id) return res.status(400).json({ message: `Provide student's ID`, data: [] }) 

    //confirm student
    const student = await Student.findById(id).exec()
    if(!student) return res.status(400).json({ message: `There was no student's record found`, data: [] })

    await student.deleteOne()

    res.json({ message: `Student record has been deleted successfully`, data: [] })
}

// @desc delete all students except for admin
// @route DELETE /students
// @access Private
const deleteAll = async(req, res) =>{
    await Student.deleteMany()

    res.json({ message: `Students' records has been deleted successfully`, data: [] })
}

module.exports = {
    index,
    show,
    create,
    update,
    deleteOne,
    deleteAll
}