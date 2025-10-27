const express = require("express");
const router = express.Router();
const { jwtAuth, requireRole } = require("../middlewares/auth");
const Product = require("../models/productsModels");




router.get("/", async (req, res) => {
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

const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    sort: {}
    };

    if (sort === "asc") options.sort = { price: 1 };
    else if (sort === "desc") options.sort = { price: -1 };

    const result = await Product.paginate(filter, options);

    const base = "/api/products";
    const prevLink = result.hasPrevPage ? `${base}?page=${result.prevPage}&limit=${limit}` : null;
    const nextLink = result.hasNextPage ? `${base}?page=${result.nextPage}&limit=${limit}` : null;

    res.json({
    status: "success",
    payload: result.docs,
    totalPages: result.totalPages,
    prevPage: result.prevPage,
    nextPage: result.nextPage,
    page: result.page,
    hasPrevPage: result.hasPrevPage,
    hasNextPage: result.hasNextPage,
    prevLink,
    nextLink
    });
} catch (error) {
    res.status(500).json({ status: "error", error: error.message });
}
});


router.get("/:pid", async (req, res) => {
try {
    const product = await Product.findById(req.params.pid);
    if (!product) return res.status(404).json({ error: "Producto no encontrado" });
    res.json(product);
} catch (err) {
    res.status(500).json({ error: err.message });
}
});


router.post("/", jwtAuth, requireRole("admin"), async (req, res) => {
try {
    let {
    title,
    description,
    code,
    price,
    status = true,
    stock = 0,
    category,
    thumbnails = [],
    image = ""
    } = req.body;


    price = Number(price);
    stock = Number(stock);

    if (!title || !description || !code || isNaN(price) || isNaN(stock) || !category) {
    return res.status(400).json({
        error: "Faltan campos obligatorios (title, description, code, price, stock, category)"
    });
    }

    if (price <= 0) {
    return res.status(400).json({ error: "Price inválido" });
    }

    if (stock < 0) {
    return res.status(400).json({ error: "Stock debe ser mayor o igual a 0" });
    }


    const existsCode = await Product.findOne({ code });
    if (existsCode) return res.status(400).json({ error: "Código ya existe" });

    const existsTitle = await Product.findOne({ title });
    if (existsTitle) return res.status(400).json({ error: "Título ya existe" });


    const product = new Product({
    title,
    description,
    code,
    price,
    status,
    stock,
    category,
    thumbnails: Array.isArray(thumbnails)
        ? thumbnails
        : typeof thumbnails === "string"
        ? [thumbnails]
        : [],
    image
    });

    await product.save();

    if (req.headers.referer && req.headers.referer.includes("/admin")) {
    return res.redirect("/admin?msg=Producto creado correctamente");
    }

    res.status(201).json({ message: "Producto creado", product });
} catch (error) {
    console.error("Error creando producto:", error);
    res.status(500).json({ error: error.message });
}
});


router.put("/:pid", jwtAuth, requireRole("admin"), async (req, res) => {
try {
    const { pid } = req.params;
    const update = { ...req.body };
    delete update._id;

    const updated = await Product.findByIdAndUpdate(pid, update, {
    new: true,
    runValidators: true
    });

    if (!updated) return res.status(404).json({ error: "Producto no encontrado" });


    if (req.headers.referer && req.headers.referer.includes("/admin")) {
    return res.redirect("/admin?msg=Producto actualizado correctamente");
    }

    res.json({ message: "Producto actualizado", product: updated });
} catch (error) {
    res.status(500).json({ error: error.message });
}
});


router.delete("/:pid", jwtAuth, requireRole("admin"), async (req, res) => {
try {
    const { pid } = req.params;
    const deleted = await Product.findByIdAndDelete(pid);
    if (!deleted) return res.status(404).json({ error: "Producto no encontrado" });


    if (req.headers.referer && req.headers.referer.includes("/admin")) {
    return res.redirect("/admin?msg=Producto eliminado correctamente");
    }

    res.json({ message: "Producto eliminado" });
} catch (error) {
    res.status(500).json({ error: error.message });
}
});

module.exports = router;

