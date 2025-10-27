const User = require('../models/user.model');
const Cart = require('../models/cart.model');

async function getUsers(req, res) {
try {
    const users = await User.find().select('-password').lean();
    res.render('admin', { user: req.user, users });
} catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).send('Error del servidor');
}
}

async function changeRole(req, res) {
    try {
    const { uid } = req.params;
    const user = await User.findById(uid);
    if (!user) return res.status(404).send('Usuario no encontrado');

    user.role = user.role === 'admin' ? 'user' : 'admin';
    await user.save();

    res.redirect('/admin');
} catch (error) {
    console.error('Error al cambiar rol:', error);
    res.status(500).send('Error del servidor');
}
}

async function deleteUser(req, res) {
try {
    const { uid } = req.params;
    const user = await User.findById(uid);
    if (!user) return res.status(404).send('Usuario no encontrado');


    if (user.cart) {
    await Cart.findByIdAndDelete(user.cart).catch(e => console.warn('No se pudo eliminar carrito:', e));
    }

    await User.findByIdAndDelete(uid);
    res.redirect('/admin');
} catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).send('Error del servidor');
}
}

module.exports = { getUsers, changeRole, deleteUser };
