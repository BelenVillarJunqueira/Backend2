const path = require("path");
const express = require("express");
const exphbs = require("express-handlebars");
const Handlebars = require("handlebars");
const { allowInsecurePrototypeAccess } = require("@handlebars/allow-prototype-access");
const cookieParser = require('cookie-parser');
const passport = require("passport");
const methodOverride = require("method-override");
require('dotenv').config();


const connectDB = require("./config/db");
const initPassport = require("./config/passport");


const productRoutes = require("./routes/products.router");
const cartRoutes = require("./routes/carts.router");
const viewsRouter = require("./routes/views.router");
const sessionsRouter = require("./routes/sessions.router");
const usersRouter = require('./routes/users.router');
const adminRouter = require('./routes/admin.router');


const { jwtAuth } = require("./middlewares/auth");

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(methodOverride("_method"));


const hbs = exphbs.create({
handlebars: allowInsecurePrototypeAccess(Handlebars),
helpers: {
    eq: function (a, b) {
    return a === b;
    }
}
});

app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));


initPassport();
app.use(passport.initialize());


app.use((req, res, next) => {
    try {
        passport.authenticate("jwt", { session: false }, (err, user) => {
            if (user) {
                res.locals.user = {
                    id: user._id,
                    name: user.first_name,
                    role: user.role
                };
            } else {
                res.locals.user = null;
            }
            next();
        })(req, res, next);
    } catch (e) {
        res.locals.user = null;
        next();
    }
});


app.use("/api/products", productRoutes);
app.use("/api/carts", cartRoutes);
app.use("/api/sessions", sessionsRouter);
app.use('/api/users', usersRouter);
app.use("/admin", adminRouter); 
app.use("/", viewsRouter);


app.use((req, res) => {
    res.redirect('/products');
});


connectDB().then(() => {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log('🚀 Servidor funcionando en', PORT));
});

module.exports = app;
