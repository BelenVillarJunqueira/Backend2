const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const CartRepo = require("../repositories/cart.repository.js");
const Product = require("../models/productsModels"); 
const { jwtAuth, authorizeRoles } = require('../middlewares/authorize');


router.post("/", jwtAuth, authorizeRoles('user'), async (req, res) => {
try {
    const cart = await CartRepo.createCart();
    return res.status(201).json(cart);
} catch (error) {
    console.error('❌ Error crear carrito:', error);
    return res.status(500).json({ error: "Error al crear carrito", details: error.message });
}
});


router.get("/:cid", jwtAuth, authorizeRoles('user', 'admin'), async (req, res) => {
try {
    const cart = await CartRepo.getCartPopulated(req.params.cid);
    if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });

    let total = 0;
    const products = cart.products.map(p => {
      const subtotal = p.product.price * p.quantity;
    total += subtotal;
    return {
        _id: p.product._id,
        title: p.product.title,
        price: p.product.price,
        quantity: p.quantity,
        subtotal
    };
    });

    return res.json({ _id: cart._id, products, total });
} catch (error) {
    console.error('❌ Error obtener carrito:', error);
    return res.status(500).json({ error: "Error al obtener carrito", details: error.message });
}
});


router.post("/:cid/products/:pid", jwtAuth, authorizeRoles('user'), async (req, res) => {
try {
    const { quantity } = req.body;
    const cart = await CartRepo.addProduct(req.params.cid, req.params.pid, quantity);
    return res.json({ message: "Producto agregado al carrito", cart });
} catch (error) {
    console.error('❌ Error agregar producto:', error);
    return res.status(error.status || 500).json({ error: error.message });
}
});


router.put("/:cid/products/:pid", jwtAuth, authorizeRoles('user'), async (req, res) => {
try {
    const { quantity } = req.body;
    const cart = await CartRepo.updateQuantity(req.params.cid, req.params.pid, quantity);
    return res.json({ message: "Cantidad actualizada", cart });
} catch (error) {
    console.error('❌ Error actualizar cantidad:', error);
    return res.status(error.status || 500).json({ error: "Error al actualizar cantidad", details: error.message });
}
});


router.delete("/:cid/products/:pid", jwtAuth, authorizeRoles('user'), async (req, res) => {
try {
    const cart = await CartRepo.removeProduct(req.params.cid, req.params.pid);
    return res.json({ message: "Producto eliminado", cart });
} catch (error) {
    console.error('❌ Error eliminar producto:', error);
    return res.status(error.status || 500).json({ error: "Error al eliminar producto", details: error.message });
}
});


router.delete("/:cid", jwtAuth, authorizeRoles('user'), async (req, res) => {
try {
    const cart = await CartRepo.emptyCart(req.params.cid);
    return res.json({ message: "Carrito vacio", cart });
} catch (error) {
    console.error('❌ Error vaciar carrito:', error);
    return res.status(error.status || 500).json({ error: "Error al vaciar carrito", details: error.message });
}
});


router.post("/:cid/purchase", jwtAuth, authorizeRoles('user'), async (req, res) => {
try {
    const purchaserEmail = req.user.email;
    const result = await CartRepo.purchase(req.params.cid, purchaserEmail);
    return res.json(result);
} catch (error) {
    console.error('❌ Error purchase:', error);
    return res.status(error.status || 500).json({ error: error.message });
}
});

module.exports = router;
