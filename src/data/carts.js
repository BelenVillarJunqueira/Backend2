const express = require("express");
const router = express.Router();
const Cart = require("../models/cart.model");


router.post("/", async (req, res) => {
try {
    const cart = new Cart({ products: [] });
    await cart.save();
    res.json(cart);
} catch (error) {
    res.status(500).json({ error: "Error al crear carrito" });
}
});


router.get("/:cid", async (req, res) => {
try {
    const cart = await Cart.findById(req.params.cid).populate("products.product");
    if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });
    res.json(cart);
} catch (error) {
    res.status(500).json({ error: "Error al obtener carrito" });
}
});


router.post("/:cid/product/:pid", async (req, res) => {
try {
    const cart = await Cart.findById(req.params.cid);
    if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });

    const existingProduct = cart.products.find(p => p.product.toString() === req.params.pid);

    if (existingProduct) {
    existingProduct.quantity += 1;
    } else {
    cart.products.push({ product: req.params.pid, quantity: 1 });
    }

    await cart.save();
    res.json(cart);
} catch (error) {
    res.status(500).json({ error: "Error al agregar producto al carrito" });
}
});

module.exports = router;
