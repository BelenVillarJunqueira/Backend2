const express = require('express');
const router = express.Router();
const { register, login, current, logout } = require('../controllers/users.controller');
const passport = require('passport');


router.post('/register', register);
router.post('/login', login);


router.get('/current', passport.authenticate('jwt', { session: false }), current);


router.post('/logout', (req, res) => {

if (req.session) {
    req.session.destroy(err => {

    res.clearCookie('connect.sid');
    res.clearCookie('authToken');
    res.clearCookie('jwt');

    return res.redirect('/products');
    });
} else {

    res.clearCookie('authToken');
    res.clearCookie('jwt');
    return res.redirect('/products');
}
});

module.exports = router;
