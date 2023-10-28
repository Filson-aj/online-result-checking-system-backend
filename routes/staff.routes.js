const express = require('express'),
    router = express.Router(),
    verify = require('../middleware/verify.jwt'),
    staffs = require('../controllers/staffs.controller')

router.use(verify) //authentication configuration

//basic routing 
router.route('/')
    .get(staffs.show)
    .post(staffs.create)
    .patch(staffs.update)
    .delete(staffs.deleteAll)

//special routes
router.route('/:id')
    .get(staffs.index)
    .delete(staffs.deleteOne)

module.exports = router