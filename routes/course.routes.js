const express = require('express'),
    router = express.Router(),
    verify = require('../middleware/verify.jwt'),
    courses = require('../controllers/courses.controller')

router.use(verify) //authentication configuration

router.route('/')
    .get(courses.show)
    .post(courses.create)
    .patch(courses.update)
    .delete(courses.deleteAll)

router.route('/:id')
    .get(courses.index)
    .delete(courses.deleteOne)

module.exports = router