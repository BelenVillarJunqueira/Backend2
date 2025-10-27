const passport = require('passport');

const jwtAuth = passport.authenticate('jwt', { session: false });


function requireRole(role) {
    return (req, res, next) => {
        if (!req.user) return res.status(401).json({ error: 'No autorizado' });
        if (req.user.role !== role) return res.status(403).json({ error: 'Acceso denegado - rol insuficiente' });
        next();
    };
}


function isUser(req, res, next) {
    if (!req.user) {
        return res.redirect('/login'); 
    }
    next();
}


function isAdmin(req, res, next) {
    if (!req.user) return res.redirect('/login');
    if (req.user.role !== "admin") return res.status(403).send("Acceso solo para administradores");
    next();
}


function exposeUser(req, res, next) {
    res.locals.user = req.user || null;
    next();
}

module.exports = { jwtAuth, requireRole, isUser, isAdmin, exposeUser };
