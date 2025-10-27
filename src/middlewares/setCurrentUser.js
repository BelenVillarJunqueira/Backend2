const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/envs'); // o require('dotenv').config()

module.exports = async function setCurrentUser(req, res, next) {
  try {
    res.locals.user = null;


    if (req.session && req.session.user) {
      res.locals.user = req.session.user;
      return next();
    }


    if (req.user) {
      res.locals.user = req.user;
      return next();
    }


    const token = req.cookies?.authToken || req.cookies?.jwt;
    if (token) {
      try {
        const payload = jwt.verify(token, JWT_SECRET || process.env.JWT_SECRET);
        res.locals.user = {
          id: payload.id,
          email: payload.email,
          first_name: payload.first_name || payload.name || '',
          role: payload.role || 'user',
          cart: payload.cart
        };
    } catch (err) {
        res.locals.user = null;
    }
    }

    return next();
} catch (err) {
    res.locals.user = null;
    return next();
}
};
