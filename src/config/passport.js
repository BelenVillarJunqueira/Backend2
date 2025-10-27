
const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const User = require('../models/user.model');
const { JWT_SECRET } = require('./envs');


const cookieExtractor = function(req) {
let token = null;
if (req && req.cookies) token = req.cookies['authToken'];
return token;
};

function initPassport() {
passport.use(
    'jwt',
    new JwtStrategy(
    {
        jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor, ExtractJwt.fromAuthHeaderAsBearerToken()]),
        secretOrKey: JWT_SECRET
    },
    async (jwtPayload, done) => {
        try {
        const user = await User.findById(jwtPayload.id).select('-password');
        if (!user) return done(null, false);
        return done(null, user);
        } catch (err) {
        return done(err, false);
        }
    }
    )
);
}

module.exports = initPassport;
