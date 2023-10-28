const Score = require('../models/score.model'),
    Student = require('../models/student.model'),
    Course = require('../models/course.model')


//@desc compute grade, point and remark
const compute = score =>{
    let grade, point, remark
  
    if (score >= 75) {
      grade = 'A'
      point = 4.00
    } else if (score >= 70) {
      grade = 'AB'
      point = 3.50
    } else if (score >= 65) {
      grade = 'B'
      point = 3.25
    } else if (score >= 60) {
      grade = 'BC'
      point = 3.00
    } else if (score >= 55) {
      grade = 'C'
      point = 2.75
    } else if (score >= 50) {
      grade = 'CD'
      point = 2.50
    } else if (score >= 45) {
      grade = 'D'
      point = 2.25
    } else if (score >= 40) {
      grade = 'E'
      point = 2.00
    } else {
      grade = 'F'
      point = 0.00
      remark = 'Failed'
    }
  
    if (!remark) {
      remark = 'Passed'
    }
  
    return { grade, point, remark }
}

// @desc Get single score
// @route GET /scores/:id
// @access Private
const index = async(req, res) =>{
    if(!req.params.id) return res.status(400).json({ message: `Provide score ID`}) 
    
    //score's records
    const score = await Score.findById(req.params.id).populate('course', 'code title').populate('student', 'matricNo name gender').lean().exec()

    if(!score) return res.status(400).json({ message: 'No Score Found!', data: [] })

    res.json({ message: `Student's record retrieved successfully`, data: score })
}

// @desc Get student's score
// @route GET /scores/students/:id
// @access Private
const byStudentId = async(req, res) =>{
  const { student, level, semester } = req.body

  //confirm data
  if(!student || !level || !semester) return res.status(400).json({ message: 'All Fields are required', data: [] })

  //score's records
  const score = await Score.find({ student, level, semester }).populate('course', 'code title').populate('student', 'matricNo name gender').lean().exec()

  if(!score) return res.status(400).json({ message: 'No Score Found!', data: [] })

  res.json({ message: `Student's score records retrieved successfully`, data: score })
}

// @desc Get all scores
// @route GET /scores
// @access Private
const show = async(req, res) =>{
    const scores = await Score.find().populate('course', 'code title unit').populate('student', 'matricNo name gender').lean().exec()

    if(!scores?.length) return res.status(400).json({ message: 'No Scores Found!', data: []})

    res.json({ message: `Students' records has been successfully retrieved`, data: scores })
}

// @desc create new score
// @route POST /scores
// @access Private
const create = async(req, res) =>{
    const { ca, exams, level, semester, session, matricNo, code } = req.body

    //confirm data
    if(!ca || !exams || !level || !semester|| !session || !matricNo || !code) return res.status(400).json({ message: 'All Fields are required', data: [] })

    //get student id
    const studentCheck = await Student.findOne({ matricNo }).collation({ locale: 'en', strength: 2}).lean().exec()
    if(!studentCheck || studentCheck?.length) return res.status(400).json({ message: 'Invalid matric no. provided', data: [matricNo]})

    //check for course
    const courseCheck = await Course.findOne({ code }).collation({ locale: 'en', strength: 2}).lean().exec()
    if(!courseCheck || courseCheck?.length) return res.status(400).json({ message: 'Invalid course code provided', data: [course] })

    const student = studentCheck._id,
        course = courseCheck._id,
        courseUnit = parseInt(courseCheck.unit)

    //check for duplicate
    const duplicate = await Score.findOne({ course, student, session }).collation({ locale: 'en', strength: 2}).lean().exec()
    if(duplicate) return res.status(409).json({ message: 'Score already exist', data: [] })

    //compute grade, point and remark
    const { grade, point, remark } = compute(parseInt(ca) + parseInt(exams)),
        points = courseUnit * point

    //create and store new score
    const score = await Score.create({ ca, exams, grade, points, remark, level, semester, session, student, course })
    if(score){//score created
       return res.status(201).json({ message: 'New score created successfully', data: score })
    }
    res.status(400).json({ message: 'Invalide score data provided', data: [] })
}

// @desc update a score
// @route PATCH /scores
// @access Private
const update = async(req, res) =>{
    const { id, code, ca, exams, semester, session, } = req.body

    //confirm data
    if(!id || !ca || !exams || !semester || !session) return res.status(400).json({ message: 'All Fields are required', data: [] })

    //confirm score
    const score = await Score.findById(id).exec()
    if(!score) return res.status(400).json({ message: 'Score not found', data: [] })

    //check for course
    const courseCheck = await Course.findOne({ code }).collation({ locale: 'en', strength: 2}).lean().exec()
    if(!courseCheck || courseCheck?.length) return res.status(400).json({ message: 'Invalid course code provided' })
    const courseUnit = parseInt(courseCheck.unit)

    //compute grade, points and remark
    const { grade, point, remark } = compute(ca + exams),
        points = courseUnit * point

    score.ca = ca
    score.exams = exams
    score.grade = grade
    score.points = points
    score.remark = remark
    score.session = session
    score.semester = semester
    await score.save()
    
    res.json({ message: `Score's records have been updated successfully`, data: score })
}

// @desc delete a score
// @route DELETE /scores/:id
// @access Private
const deleteOne = async(req, res) =>{
    const { id } = req.params

    //confirm data
    if(!id) return res.status(400).json({ message: 'Score ID is required', data: [] }) 

    //confirm score
    const score = await Score.findById(id).exec()
    if(!score) return res.status(400).json({ message: 'Score not found', data: [] })

    await score.deleteOne()

    res.json({ message: `Score's record deleted successfully`, data: [] })
}

// @desc delete all scores except for admin
// @route DELETE /scores
// @access Private
const deleteAll = async(req, res) =>{
    await Score.deleteMany()

    res.json({ message: `Scores' records has been deleted successfully`, data: [] })
}

module.exports = {
    index,
    byStudentId,
    show,
    create,
    update,
    deleteOne,
    deleteAll
}