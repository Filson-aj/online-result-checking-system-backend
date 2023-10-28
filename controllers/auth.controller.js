const bcrypt = require('bcrypt'),
    jwt = require('jsonwebtoken'),
    User = require('../models/user.model')

// @desc Login
// @route POST /auth
// @acess Public
const login = async(req, res) =>{
    const { username, password } = req.body

    //confirm password
    if(!username || !password) return res.status(400).json({ message: 'All fields are required' })
    
    const user = await User.findOne({ username }).collation({ locale: 'en', strength: 2}).exec()
    if(!user || !user.active) return res.status(401).json({ message: 'Invalid username or password' })

    //try to match password
    const match = bcrypt.compareSync(password, user.password)
    if(!match) return res.status(401).json({ message: 'Invalid username or password' })

    const accessToken = jwt.sign({
        'user': {
            'id': user._id,
            'username': user.username,
            'roles': user.roles,
        }
    }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN })

    const refreshToken = jwt.sign({
        'username': user.username
    }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN })

    //create secure cookie with refresh token
    res.cookie('jwt', refreshToken, {
        httpOnly: true, //accessible only by web server
        secure: true, //https
        sameSite: 'none', //cross-site cookie
        maxAge: 7 * 24 * 60 * 60 * 1000 // cookie expiry: set to one week
    })

    res.json({ accessToken })
}

// @desc Refresh
// @route GET /auth/refresh
// @access Public - because access token has expired
const refresh = (req, res) =>{
    const cookies = req.cookies;

    if(!cookies?.jwt) return res.status(401).json({ message: 'You are not authorized' })

    const refreshToken = cookies.jwt

    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        async(err, decoded) =>{
            if(err) return res.status(403).json({ message: 'You are forbidden from accessing this resource' })

            const found_user = await User.findOne({ username: decoded.username }).collation({ locale: 'en', strength: 2}).exec()

            if(!found_user) return res.status(401).json({ message: 'You are not authorized' })

            const accessToken = jwt.sign({
                "user": {
                    "id": found_user._id,
                    "username": found_user.username,
                    "roles": found_user.roles
                }
            }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN })

            res.json({ accessToken })
        }
    )
}

// @desc Logout
// @route Post /auth/logout
// @access Public - just to clear cookie if exist
const logout = (req, res) =>{
    const cookies = req.cookies
    if(!cookies?.jwt) return res.sendStatus(204) //No content
    res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true })
    res.json({ message: 'Cookie cleared' })
}

module.exports = {
    login,
    refresh,
    logout,
}