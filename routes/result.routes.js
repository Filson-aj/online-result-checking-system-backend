const express = require('express'),
    router = express.Router(),
    verify = require('../middleware/verify.jwt'),
    results = require('../controllers/results.controller')

router.use(verify) //authentication configuration

//basic routing
router.route('/')
    .post(results.create)
    .get(results.show)
    .patch(results.update)
    .delete(results.deleteAll)

///special routing
router.route('/:id')
    .get(results.index)
    .delete(results.deleteOne)

router.route('/students')
    .get(results.showByStudent)

router.route('/evaluate')
    .post(results.evaluate)

module.exports = router