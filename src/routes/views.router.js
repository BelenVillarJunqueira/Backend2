const express = require("express");
const router = express.Router();
const Product = require("../models/productsModels");
const Cart = require("../models/cart.model");

router.get("/products", async (req, res) => {
try {
    let { limit = 10, page = 1, sort, query } = req.query;
    limit = parseInt(limit) || 10;
    page = parseInt(page) || 1;

    const filter = {};
    if (query) {
    if (query.includes(":")) {
        const [k, v] = query.split(":");
        if (k === "available") {
        filter.stock = v === "true" ? { $gt: 0 } : 0;
        } else {
        filter[k] = isNaN(v) ? v : Number(v);
        }
    } else {
        filter.$or = [
        { title: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } }
        ];
    }
    }

    const options = { page, limit, lean: true };
    if (sort) options.sort = { price: sort === "asc" ? 1 : -1 };

    const result = await Product.paginate(filter, options);

    res.render("home", {
    products: result.docs,
    totalPages: result.totalPages,
    prevPage: result.prevPage,
    nextPage: result.nextPage,
    page: result.page,
    hasPrevPage: result.hasPrevPage,
    hasNextPage: result.hasNextPage,
    prevLink: result.hasPrevPage ? `/products?page=${result.prevPage}&limit=${limit}` : null,
    nextLink: result.hasNextPage ? `/products?page=${result.nextPage}&limit=${limit}` : null
    });
} catch (error) {
    console.error("Error en views /products:", error);
    res.status(500).send("Error al cargar productos");
}
});


router.get("/login", (req, res) => {
    res.render("login");
});


router.get("/register", (req, res) => {
    res.render("register");
});




module.exports = router;
