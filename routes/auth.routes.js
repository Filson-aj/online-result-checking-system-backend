const express = require('express'),
    router = express.Router(),
    auth = require('../controllers/auth.controller'),
    loginLimiter = require('../middleware/loginLimiter')

router.route('/')
    .post(loginLimiter, auth.login)

router.route('/refresh')
    .get(auth.refresh)

router.route('/logout')
    .post(auth.logout)

module.exports = router