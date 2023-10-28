const mongoose = require('mongoose')
const Result = require('../models/result.model'),
    Score = require('../models/score.model'),
    Student = require('../models/student.model')

//a function to get result the result of the a student
const getStudentResult = async(score) =>{
    const student = score?.student._id,
        level = score?.level,
        semester = score.semester,
        session = score.session
    let courses = [],
        su = 0.0, sp = 0.0, cu = 0.0, cp = 0.0, gpa = 0.0, cgpa = 0.0, remark = ''
    
    //get scores for student in the given level, semester, session and department
    const scores = await Score.find({ student, level, semester, session }).populate('course', 'code title unit').lean().exec()

    if(!scores || scores?.length <= 0) return false

    //compute and generate result for the given student
    scores?.map( score => {
        courses.push({
            code: score?.course?.code,
            title: score?.course?.title,
            unit: score?.course?.unit,
            grade: score?.grade
        })
        su = su + score?.course?.unit
        sp = sp + score?.points
    })

    //compute gpa and cgpa
    if((level === 'Pre-ND' && semester === '1st Semester') || (level === 'Pre-HND' && semester === '1st Semester') || (level === 'ND I' && semester === '1st Semester') || (level === 'HND I' && semester === '1st Semester')){
        gpa = sp / su
        cgpa = gpa
        cu = su
        cp = sp
    }else if((level === 'ND II' && semester === '1st Semester') || (level === 'HND II' && semester === '1st Semester')){
        const previousLevel = level === 'ND II' ? 'ND I' : 'HND I'
        const result = await Result.find({ student, level: previousLevel, semester: '2nd Semester' }).lean().exec()
        if(result && result?.length > 0){
            gpa = sp / su
            cu = su + result[0]?.cu
            cp = sp + result[0]?.cp
            cgpa = cp / cu
        }else{
            gpa = sp / su
            cgpa = gpa
            cu = su
            cp = sp
        }
    }else{
        const result = await Result.find({ student, level, semester: '1st Semester', session }).lean().exec()
        //compute gpa and cgpa
        if(result && result?.length > 0){
            gpa = sp / su
            cu = su + result[0]?.cu
            cp = sp + result[0]?.cp
            cgpa = cp / cu
        }else{
            gpa = sp / su
            cgpa = gpa
            cu = su
            cp = sp
        }
    }

    //compute remark
    if(cgpa >= 3.5){
        remark = 'Distinction'
    }else if(cgpa >= 3.0){
        remark = 'Upper Credit'
    }else if(cgpa >= 2.5){
        remark = 'Lower Credit'
    }else if(cgpa >= 2.0){
        remark = 'Pass'
    }else{
        remark = 'Fail'
    }

    return { sp, su, cp, cu, gpa, cgpa, courses, remark }
}

// @desc Get single result
// @route GET /results/:id
// @access Private
const index = async(req, res) =>{
    if(!req.id) return res.status(400).json({ message: `Provide result's ID`}) 

    const result = await Result.findById(req.id).populate('student', 'matricNo name gender').lean().exec()

    if(!result) return res.status(400).json({ message: 'No Result Found!'})

    res.json({ data: result })
}

// @desc Get all results
// @route GET /results
// @access Private
const show = async(req, res) =>{
    const results = await Result.find().populate('student', 'matricNo name gender').lean().exec()

    if(!results?.length) return res.status(400).json({ message: 'No Results Found!'})

    res.json({ message: 'Resuts retrieved successfully!', data: results })
}

// @desc Get all results
// @route GET /results
// @access Private
const evaluate = async(req, res) =>{
    const { level, semester, session } = req.body

    //confirm data
    if(semester === '' || session === '' || level === '') return res.status(400).json({ message: 'All Fields are required' })

    const results = await Result.aggregate([
        {
          $match: {
            level,
            semester,
            session,
          },
        },
        {
          $lookup: {
            from: 'students', 
            localField: 'student',
            foreignField: '_id',
            as: 'studentInfo',
          },
        },
        {
          $unwind: '$studentInfo', 
        },
        {
          $group: {
            _id: '$remark',
            total: { $sum: 1 },
            maleCount: {
              $sum: {
                $cond: [
                  { $eq: ['$studentInfo.gender', 'Male'] }, 
                  1,
                  0,
                ],
              },
            },
            femaleCount: {
              $sum: {
                $cond: [
                  { $eq: ['$studentInfo.gender', 'Female'] }, 
                  1,
                  0,
                ],
              },
            },
          },
        },
      ]).exec()

    if(!results?.length) return res.status(400).json({ message: 'No Results Found!'})

    res.json({ message: 'Resuts retrieved successfully!', data: results })
}

// @desc Get all results for a given student
// @route GET /results/students/:id
// @access Private
const showByStudent = async(req, res) =>{
    const { matricNo, level, semester, session } = req.body

    //confirm data
    if(!semester || !session || !level || !matricNo) return res.status(400).json({ message: 'All Fields are required' })

    //get student data
    const checkStudent = await Student.findOne({ matricNo }).collation({ locale: 'en', strength: 2}).exec()
    if(!checkStudent) return res.status(400).json({ message: 'Invalid matric number!', data: [] })

    const results = await Result.find({ level, semester, session, student: checkStudent?._id}).populate('student', 'matricNo name gender').lean().exec()

    if(!results?.length) return res.status(400).json({ message: 'No Results Found!'})

    res.json({ message: 'Resuts retrieved successfully!', data: results })
}

// @desc create new result
// @route POST /results
// @access Private
const create = async(req, res) =>{
    const { level, semester, session } = req.body

    const completed = []

    //confirm data
    if(!semester || !session || !level) return res.status(400).json({ message: 'All Fields are required' })

    //check for duplicate
    const duplicate = await Result.findOne({ level, session, semester }).collation({ locale: 'en', strength: 2}).lean().exec()
    if(duplicate) return res.status(409).json({ message: 'Result has already been generated!' })

    //get students' scores for the given level, session and semester
    const scores = await Score.find({ level, session, semester}).lean().exec()
    if(!scores || scores?.length <= 0) return res.status(400).json({ message: `No ${level} scores found in the ${session} session, ${semester}` })

    scores.sort((a, b) => a.student.toString().localeCompare(b.student.toString()))

    let prevStudent = ''

    for (const score of scores) {
        let student_result = null
        let currentStudent = score?.student
        
        if (!currentStudent.equals(prevStudent)) {
            student_result = await getStudentResult(score)
            if (!student_result) {
                completed.push(score)
            } else {
                const sp = parseFloat(student_result?.sp)
                const su = parseFloat(student_result?.su)
                const cp = parseFloat(student_result?.cp)
                const cu = parseFloat(student_result?.cu)
                const gpa = parseFloat(student_result?.gpa)
                const cgpa = parseFloat(student_result?.cgpa) 
                const courses = student_result?.courses 
                const remark = student_result?.remark
            
                await Result.create({ sp, su, cp, cu, gpa, cgpa, level, semester, session, courses, remark, student: score?.student?._id })
            }
            prevStudent = currentStudent
        }
    }

    if(completed?.length <= 0){//result created
       return res.status(201).json({ message: 'Result has been generated successfully' })
    }
    let msg = ''
    completed.map(score =>{
        const student = score.student
        msg = `${msg} (${student.matricNo}) ==> [${student.first_name} ${student.other_name} ${student.surname}], `
    })
    res.status(400).json({ message: `Couldn't generate result for these students: ${msg}`})
}

// @desc update a result
// @route PATCH /results
// @access Private
const update = async(req, res) =>{
    const { id, code, title, level, unit, semester, lecturer } = req.body

    //confirm data
    if(!id || !code || !title || level || unit || semester || lecturer) return res.status(400).json({ code: 'EMF', message: 'All Fields are required' }) //EMF ==> Empty Field

    //confirm result
    const result = await Result.findById(id).exec()
    if(!result) return res.status(400).json({ message: 'Result not found' })

    //check for duplicate
    const duplicate = await Result.findOne({ code }).collation({ locale: 'en', strength: 2}).lean().exec()
    if(duplicate && duplicate?._id.toString() !== id) return res.status(409).json({ message: 'Result already exist' })

    result.code = code
    result.title = title
    result.level = level
    result.unit = unit
    result.semester = semester
    result.lecturer = lecturer
    await result.save()
    
    res.json({ code: 'UPD', message: `Result's records have been updated successfully `}) // UPD ==> Updated
}

// @desc delete a result
// @route DELETE /results/:id
// @access Private
const deleteOne = async(req, res) =>{
    const { id } = req.params

    //confirm data
    if(!id) return res.status(400).json({ message: 'Result ID is required' })

    //confirm result
    const result = await Result.findById(id).exec()
    if(!result) return res.status(400).json({ message: 'Result not found' })

    await result.deleteOne()

    res.json({ message: `Result's record deleted successfully` })
}

// @desc delete all results except for admin
// @route DELETE /results
// @access Private
const deleteAll = async(req, res) =>{
    await Result.deleteMany()

    res.json({ message: `Results' records has been deleted successfully` })
}

module.exports = {
    index,
    show,
    showByStudent,
    evaluate,
    create,
    update,
    deleteOne,
    deleteAll
}