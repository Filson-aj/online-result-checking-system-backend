const Staff = require('../models/staff.model')

// @desc Get single staff
// @route GET /staffs/:id
// @access Private
const index = async(req, res) =>{
    if(!req.id) return res.status(400).json({ message: `Please provide staff's ID`, data: []}) 
    
    //get staff's records
    const staff = await Staff.findById(req.id).populate('user', 'username roles').lean().exec()

    if(!staff) return res.status(400).json({ message: `There are no staff's records found`, data: []})

    res.json({ message: `Staff's record retrieved successfully`, data: staff })
}

// @desc Get all staffs
// @route GET /staffs
// @access Private
const show = async(req, res) =>{
    const staffs = await Staff.find().populate('user', 'username roles').lean().exec()

    if(!staffs?.length) return res.status(400).json({ message: `There are no staffs' record found!`})

    res.json({ message: `Staffs' records retrieved successfully`, data: staffs })
}

// @desc create new staff
// @route POST /staffs
// @access Private
const create = async(req, res) =>{
    const { staffId, name, gender, qualification, contact, user } = req.body

    //confirm data
    if(!staffId || !gender || !qualification || !user) return res.status(400).json({ message: 'All Fields are required', data: [] })

    //check for duplicate
    const duplicate = await Staff.findOne({ staffId }).collation({ locale: 'en', strength: 2}).exec()
    if(duplicate) return res.status(409).json({ code: 'AE', message: `Staff with the ID: ${staffId} already exist`, data: [] })

    //create and store new staff
    const staff = await Staff.create({ staffId, name, gender, qualification, contact, user })
    if(staff){//staff created
       return res.status(201).json({ message: `New staff records has been created successfully`, data: staff })
    }
    res.status(400).json({ message: 'Invalide staff data provided', data: [] })
}

// @desc update a staff
// @route PATCH /staffs
// @access Private
const update = async(req, res) =>{
    const { id, staffId, name, gender, qualification, contact } = req.body

    //confirm data
    if(!id || !staffId || !gender || !qualification) return res.status(400).json({ message: 'All Fields are required', data: [] }) 

    //confirm staff
    const staff = await Staff.findById(id).exec()
    if(!staff) return res.status(400).json({ message: `Staff's record was not found`, data: [] })

    staff.name = name
    staff.gender = gender
    staff.qualification = qualification
    staff.contact = contact
    await staff.save()
    
    res.json({ message: `Staff's records have been updated successfully`, data: staff })
}

// @desc delete a staff
// @route DELETE /staffs/:id
// @access Private
const deleteOne = async(req, res) =>{
    const { id } = req.params

    //confirm data
    if(!id) return res.status(400).json({ message: `Provide staff's id`, data: [] })

    //confirm staff
    const staff = await Staff.findById(id).exec()
    if(!staff) return res.status(400).json({ message: `Staff records not found`, data: [] })

    await staff.deleteOne()

    res.json({ message: `Staff's records has been deleted successfully`, data: [] })
}

// @desc delete all staffs except for admin
// @route DELETE /staffs
// @access Private
const deleteAll = async(req, res) =>{
    await Staff.deleteMany()

    res.json({ message: `Staffs' records has been deleted successfully`, data: [] })
}

module.exports = {
    index,
    show,
    create,
    update,
    deleteOne,
    deleteAll
}