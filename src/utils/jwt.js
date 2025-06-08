const jwt = require('jsonwebtoken')
require('dotenv').config();

const secretKey = process.env.JWT_SECRET; 

const generateToken = (id, role) => {
    const options = {
        expiresIn: '6h',
    };

    return jwt.sign({id, role}, process.env.JWT_SECRET, options)
}

const validateToken = (token) => {
    return jwt.verify(token, secretKey);
};


module.exports = {
    validateToken,
    generateToken,
}