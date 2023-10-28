const express = require('express'),
    router = express.Router(),
    verify = require('../middleware/verify.jwt'),
    scores = require('../controllers/scores.controller')

router.use(verify) //authentication configuration

//basic routing
router.route('/')
    .post(scores.create)
    .get(scores.show)
    .patch(scores.update)
    .delete(scores.deleteAll)

///special routing
router.route('students')
    .get(scores.byStudentId)
    
router.route('/:id')
    .get(scores.index)
    .delete(scores.deleteOne)

module.exports = router