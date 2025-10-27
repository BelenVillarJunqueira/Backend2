const bcrypt = require('bcrypt');
const User = require('../models/user.model');
const { signToken } = require('../utils/generateToken'); 
const SALT_ROUNDS = 10;

async function register(req, res) {
    try {
    const { first_name, last_name, email, password } = req.body;
    if (!first_name || !last_name || !email || !password) {
    return res.status(400).json({ error: 'Faltan campos obligatorios (first_name, last_name, email, password)' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(400).json({ error: 'Email ya registrado' });

    const hashed = bcrypt.hashSync(password, SALT_ROUNDS);
    const user = new User({
    first_name,
    last_name,
    email: email.toLowerCase(),
    password: hashed,
    role: 'user'
    });

    await user.save();

    const safe = {
    id: user._id,
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    role: user.role
    };


    const token = signToken({ id: user._id, email: user.email, role: user.role });
    res.cookie('authToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24
    });

    res.status(201).json({ message: 'Usuario registrado', user: safe });
} catch (err) {
    console.error("Error register:", err);
    res.status(500).json({ error: 'Error registrando usuario' });
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

    const token = signToken({ id: user._id, email: user.email, role: user.role });

    res.cookie('authToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 24
    });

    const safe = { id: user._id, email: user.email, first_name: user.first_name, role: user.role };
    res.json({ message: 'Login OK', user: safe });
} catch (err) {
    console.error("Error login:", err);
    res.status(500).json({ error: 'Error en login' });
}
}

function current(req, res) {
if (!req.user) return res.status(401).json({ error: 'No autenticado' });
res.json({ user: req.user });
}

function logout(req, res) {
res.clearCookie('authToken');
res.json({ message: 'Logout OK' });
}

module.exports = { register, login, current, logout };
