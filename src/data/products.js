const express = require("express");
const router = express.Router();
const Product = require("../models/productsModels");


router.get("/", async (req, res) => {
try {
    const products = await Product.find();
    res.json(products);
} catch (error) {
    res.status(500).json({ error: "Error al obtener productos" });
}
});


router.post("/", async (req, res) => {
try {
    const newProduct = new Product(req.body);
    await newProduct.save();
    res.json(newProduct);
} catch (error) {
    res.status(500).json({ error: "Error al crear producto" });
}
});

module.exports = router;
