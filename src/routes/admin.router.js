const express = require('express');
const router = express.Router();
const isAdmin = require('../middlewares/isAdmin');
const adminController = require('../controllers/admin.controller');
const Product = require("../models/productsModels");


router.get("/", isAdmin, async (req, res) => {
try {
    const products = await Product.find().lean();
    res.render("admin", {
    user: req.user,
    products,
    layout: "main",
    msg: req.query.msg || null
    });
} catch (err) {
    console.error("Error cargando productos en admin:", err);
    res.status(500).send("Error cargando panel admin");
}
});


router.post('/users/:uid/role', isAdmin, adminController.changeRole);


router.post('/users/:uid/delete', isAdmin, adminController.deleteUser);

module.exports = router;
