const extractTokenFromCookie = (req) => {
    if (req && req.cookies) {
    return req.cookies.jwt || null;
}
return null;
};

module.exports = { extractTokenFromCookie };
