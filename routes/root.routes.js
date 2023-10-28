const express = require('express'),
    router = express.Router(),
    path = require('path')

router.get('^/$|/index(.html)?', (reg, res) =>{
    res.sendFile(path.join(global.root, 'views', 'index.html'))
})

module.exports = router 