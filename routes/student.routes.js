const express = require('express'),
    router = express.Router(),
    verify = require('../middleware/verify.jwt'),
    students = require('../controllers/students.controller')

router.use(verify) //authenfication configuration

//basic routing
router.route('/')
    .get(students.show)
    .post(students.create)
    .patch(students.update)
    .delete(students.deleteAll)

//special routing
router.route('/:id')
    .get(students.index)
    .delete(students.deleteOne)

module.exports = router