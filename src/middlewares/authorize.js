const passport = require('passport');

const jwtAuth = passport.authenticate('jwt', { session: false });

function authorizeRoles(...roles) {
return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ error: 'No autorizado' });
    }
    next();
};
}

module.exports = { jwtAuth, authorizeRoles };