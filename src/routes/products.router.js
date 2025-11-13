const express = require("express");
const router = express.Router();
const ProductRepo = require("../repositories/product.repository");
const { jwtAuth, requireRole } = require("../middlewares/auth");
const { authorizeRoles } = require('../middlewares/authorize');




router.get("/", async (req, res) => {
try {
    const { limit = 10, page = 1, sort, query } = req.query;
    const result = await ProductRepo.getPaginated({ limit, page, sort, query });

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
    res.status(error.status || 500).json({ status: "error", error: error.message });
}
});


router.get("/:pid", async (req, res) => {
try {
    const p = await ProductRepo.getById(req.params.pid);
    if (!p) return res.status(404).json({ error: "Producto no encontrado" });
    res.json(p);
} catch (err) {
    res.status(500).json({ error: err.message });
}
});



router.post("/", jwtAuth, authorizeRoles('admin'), async (req, res) => {
  try {
    const created = await ProductRepo.create(req.body);

    if (req.body.fromAdmin === '1' || (req.headers.accept || '').includes('text/html')) {
      return res.redirect('/admin?msg=' + encodeURIComponent('Producto creado'));
    }

    res.status(201).json({ message: "Producto creado", product: created });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
});



router.put("/:pid", jwtAuth, authorizeRoles('admin'), async (req, res) => {
try {
    const updated = await ProductRepo.update(req.params.pid, req.body);
    res.json({ message: "Producto actualizado", product: updated });
} catch (error) {
    res.status(error.status || 500).json({ error: error.message });
}
});


router.delete("/:pid", jwtAuth, authorizeRoles('admin'), async (req, res) => {
  try {
    await ProductRepo.remove(req.params.pid);

    if (req.body.fromAdmin === '1' || (req.headers.accept || '').includes('text/html')) {
      return res.redirect('/admin?msg=' + encodeURIComponent('Producto eliminado'));
    }

    res.json({ message: "Producto eliminado" });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
});

module.exports = router;