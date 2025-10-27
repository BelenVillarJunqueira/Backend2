const passport = require('passport');

module.exports = function isAdmin(req, res, next) {
    passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) return next(err);


    if (!user) {
    return res.redirect('/login');
    }


    if (user.role !== 'admin') {
    return res.redirect('/products');
    }


    req.user = user;
    next();
})(req, res, next);
};
