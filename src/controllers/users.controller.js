const bcrypt = require('bcrypt');
const User = require('../models/user.model');
const Cart = require('../models/cart.model');
const generateToken = require('../utils/generateToken');

const saltRounds = 10;

async function register(req, res) {
try {
    const { first_name, last_name, email, age, password } = req.body;
    if (!first_name || !last_name || !email || !password) {
    return res.status(400).json({ error: 'Faltan campos obligatorios (first_name, last_name, email, password)' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(400).json({ error: 'Email ya registrado' });

    let cart = null;
    try {
    cart = new Cart({ products: [] });
    await cart.save();
    } catch (e) {
    cart = null;
    }

    const hashed = bcrypt.hashSync(password, saltRounds);

    const user = new User({
    first_name,
    last_name,
    email: email.toLowerCase(),
    age,
    password: hashed,
    cart: cart ? cart._id : undefined
    });

    await user.save();

    const safe = {
    id: user._id,
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    age: user.age,
    role: user.role,
    cart: user.cart
    };


    if (req.headers["content-type"] === "application/json") {
    return res.status(201).json({ message: 'Usuario registrado', user: safe });
    }


    return res.redirect('/login');

} catch (err) {
    console.error('Error register:', err);
    return res.status(500).json({ error: 'Error registrando usuario' });
}
}

async function login(req, res) {
try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Faltan credenciales' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ error: 'Credenciales inválidas' });

    const valid = bcrypt.compareSync(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Credenciales inválidas' });

    const token = generateToken(user);


    res.cookie('authToken', token, {
    httpOnly: true,
    secure: false,
        maxAge: 1000 * 60 * 60 * 24
    });


    if (req.headers["content-type"] === "application/json") {
    return res.json({
        message: 'Login OK',
        user: {
        id: user._id,
        email: user.email,
        first_name: user.first_name,
        role: user.role,
        cart: user.cart
        }
    });
    }


    if (user.role === 'admin') {
    return res.redirect('/admin');
    } else {
    return res.redirect('/');
    }
} catch (err) {
    console.error('Error en login:', err.message, err);
    return res.status(500).json({ error: 'Error en login', details: err.message });
}
}

async function current(req, res) {
if (!req.user) return res.status(401).json({ error: 'No autenticado' });
res.json({ user: req.user });
}

function logout(req, res) {
res.clearCookie('jwt');
res.redirect('/login');
}

module.exports = { register, login, current, logout };
