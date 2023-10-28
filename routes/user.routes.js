const express = require('express'),
    router = express.Router(),
    users = require('../controllers/users.controller'),
    verify = require('../middleware/verify.jwt')   

router.use(verify) //authentication configuration

//basic user routes
router.route('/')
    .get(users.show)
    .post(users.create)
    .patch(users.update)
    .delete(users.deleteAll)

//special case routes
router.route('/:id')
    .get(users.index)
    .delete(users.deleteOne)

router.route('/:id/change-password')
    .patch(users.changePassword)

module.exports = router