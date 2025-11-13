const express = require('express');
const router = express.Router();
const UsersService = require('../services/users.service');
const passport = require('passport');
const { requireRole } = require('../middlewares/auth');


router.get('/', passport.authenticate('jwt', { session: false }), requireRole('admin'), async (req, res) => {
    try {
    const users = await User.find().select('-password');
    res.json(users);} 
    catch (err) {
    res.status(500).json({ error: 'Error al listar usuarios' });
}
});


router.put('/:uid/role', passport.authenticate('jwt', { session: false }), requireRole('admin'), async (req, res) => {
    try {
    const { uid } = req.params;
    const { role } = req.body;
    if (!['user','admin'].includes(role)) return res.status(400).json({ error: 'Rol inválido' });

    const user = await User.findByIdAndUpdate(uid, { role }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    res.json({ message: 'Rol actualizado', user });
} catch (err) {
    res.status(500).json({ error: 'Error actualizando rol' });
}
});

router.delete('/:uid', passport.authenticate('jwt', { session: false }), requireRole('admin'), async (req, res) => {
try {
    const { uid } = req.params;
    const deleted = await User.findByIdAndDelete(uid);
    if (!deleted) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json({ message: 'Usuario eliminado', user: { id: deleted._id, email: deleted.email } });
} catch (err) {
    res.status(500).json({ error: 'Error eliminando usuario' });
}
});

module.exports = router;
