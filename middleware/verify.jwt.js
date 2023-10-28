const jwt = require('jsonwebtoken')

const verify = (req, res, next) =>{
    const header = req.headers.authorization || req.headers.Authorization

    if(!header?.startsWith('Bearer '))  return res.status(401).json({ message: 'You are not authorized' })

    const token = header.split(' ')[1]

    jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET,
        (err, decode) =>{
            if(err) return res.status(403).json({ message: 'You are forbidden from accessing this resource' })

            req.user = decode.user?.username
            req.roles = decode.user?.roles

            next()
        }
    )
}

module.exports = verify