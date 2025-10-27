const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/envs');

function generateToken(user) {
    return jwt.sign(
    {
    id: user._id,
    email: user.email,
    role: user.role,
    cart: user.cart
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
);
}

module.exports = generateToken;
