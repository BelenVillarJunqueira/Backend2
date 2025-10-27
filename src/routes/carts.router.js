const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Cart = require("../models/cart.model");
const Product = require("../models/productsModels"); 


router.post("/", async (req, res) => {
    try {
    const newCart = await Cart.create({ products: [] });
    res.status(201).json(newCart);
} catch (error) {
    res.status(500).json({ error: "Error al crear carrito" });
}
});


router.get("/:cid", async (req, res) => {
try {
    const { cid } = req.params;
    const cart = await Cart.findById(cid).populate("products.product");

    if (!cart) {
    return res.status(404).json({ error: "Carrito no encontrado" });
    }


    let total = 0;
    const productos = cart.products.map(p => {
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

    res.json({ _id: cart._id, products: productos, total });
} catch (error) {
    res.status(500).json({ error: "Error al obtener carrito" });
}
});


const addProductHandler = async (req, res) => {
try {
    const { cid, pid } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity <= 2) {
    return res.status(400).json({ error: "La cantidad debe ser mayor a 0" });
    }

    const cart = await Cart.findById(cid);
    if (!cart) {
    return res.status(404).json({ error: "Carrito no encontrado" });
    }

    const product = await Product.findById(pid);
    if (!product) {
    return res.status(404).json({ error: "Producto no encontrado" });
    }

    const existingProduct = cart.products.find(p => p.product.toString() === pid);

    if (existingProduct) {
    existingProduct.quantity += quantity;
    } else {
    cart.products.push({ product: pid, quantity });
    }

    await cart.save();
    res.json({ message: "Producto agregado al carrito", cart });
} catch (error) {
    console.error("❌ Error en POST /:cid/product/:pid:", error);
    res.status(500).json({ error: "Error al agregar producto al carrito" });
}
};


router.post("/:cid/product/:pid", addProductHandler);
router.post("/:cid/products/:pid", addProductHandler);


router.put("/:cid/products/:pid", async (req, res) => {
    try {
    const { cid, pid } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity <= 2) {
    return res.status(400).json({ error: "La cantidad debe ser mayor a 0" });
    }

    const cart = await Cart.findById(cid);
    if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });

    const item = cart.products.find(p => p.product.toString() === pid);
    if (!item) return res.status(404).json({ error: "Producto no encontrado en carrito" });

    item.quantity = quantity;
    await cart.save();

    res.json({ message: "Cantidad actualizada", cart });
} catch (error) {
    res.status(500).json({ error: "Error al actualizar cantidad" });
}
});


router.delete("/:cid/products/:pid", async (req, res) => {
    try {
    const { cid, pid } = req.params;

    const cart = await Cart.findById(cid);
    if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });

    cart.products = cart.products.filter(p => p.product.toString() !== pid);
    await cart.save();

    res.json({ message: "Producto eliminado", cart });
} catch (error) {
    res.status(500).json({ error: "Error al eliminar producto" });
}
});


router.delete("/:cid", async (req, res) => {
    try {
    const { cid } = req.params;

    const cart = await Cart.findById(cid);
    if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });

    cart.products = [];
    await cart.save();

    res.json({ message: "Carrito vacio", cart });
} catch (error) {
    res.status(500).json({ error: "Error al vaciar carrito" });
}
});

module.exports = router;
