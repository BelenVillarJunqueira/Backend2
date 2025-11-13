const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const ResetToken = require('../models/resetToken.model');
const PasswordReset = require('../models/passwordReset.model');
const { sendPasswordResetEmail } = require('../utils/mailer.js');
const { jwtAuth } = require('../middlewares/authorize.js');
const UserDTO = require('../dtos/user.dto');
const JWT_SECRET = process.env.JWT_SECRET;

const { register, login, current, logout } = require('../controllers/users.controller');
const UsersRepository = require('../repositories/users.repository'); 


router.post('/register', register);
router.post('/login', login);


router.get('/current', jwtAuth, (req, res) => {
try {
    const safeUser = new UserDTO(req.user);
    res.json({ status: 'success', user: safeUser });
} catch (error) {
    res.status(500).json({ status: 'error', error: error.message });
}
});


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


router.post('/forgot-password', async (req, res) => {
try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email requerido' });

    const user = await UsersRepository.findByEmail(email);
    if (!user) {
    return res.json({ message: 'Si existe el email, enviamos un enlace' });
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await PasswordReset.deleteMany({ userId: user._id });
    await PasswordReset.create({ userId: user._id, token: tokenHash, expiresAt });

    const resetURL = `${req.protocol}://${req.get('host')}/reset-password?token=${rawToken}&uid=${user._id}`;

    await sendPasswordResetEmail(user.email, resetURL);

    res.json({ message: 'Si existe el email, enviamos un enlace' });
} catch (err) {
    console.error('❌ Error en /forgot-password:', err); 
    res.status(500).json({ error: 'Error generando enlace' });
}
});


router.post('/reset', async (req, res) => {
try {
    const { token, uid, newPassword } = req.body;
    if (!token || !uid || !newPassword) {
    return res.status(400).json({ error: 'Datos incompletos' });
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const pr = await PasswordReset.findOne({ userId: uid, token: tokenHash });
    if (!pr) return res.status(400).json({ error: 'Token inválido' });

    if (pr.expiresAt < new Date()) {
    await pr.deleteOne();
    return res.status(400).json({ error: 'Token expirado' });
    }

    const user = await UsersRepository.findById(uid);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    const same = bcrypt.compareSync(newPassword, user.password);
    if (same) {
    return res.status(400).json({ error: 'La nueva contraseña no puede ser igual a la anterior' });
    }

    const hashed = bcrypt.hashSync(newPassword, 10);
    user.password = hashed;
    await user.save();
    await pr.deleteOne();

    res.json({ message: 'Contraseña actualizada' });
} catch (err) {
    console.error('❌ Error en /reset:', err); 
    res.status(500).json({ error: 'Error al restablecer contraseña' });
}
});

module.exports = router;