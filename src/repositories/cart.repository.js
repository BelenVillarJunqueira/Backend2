const CartsDAO = require('../dao/carts.dao');       
const ProductsDAO = require('../dao/products.dao'); 
const Ticket = require('../models/ticket.model');

function genCode() {
return 'T' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8).toUpperCase();
}

class CartRepository {
createCart() {
    return CartsDAO.create();
}

getCartPopulated(cid) {
    return CartsDAO.findById(cid);
}

async addProduct(cid, pid, quantity) {
    const cart = await CartsDAO.findByIdRaw(cid);
    if (!cart) { const e = new Error('Carrito no encontrado'); e.status = 404; throw e; }

    const product = await ProductsDAO.findById(pid);
    if (!product) { const e = new Error('Producto no encontrado'); e.status = 404; throw e; }

    const q = parseInt(quantity, 10);
    if (!q || q <= 0) { const e = new Error('La cantidad debe ser mayor a 0'); e.status = 400; throw e; }

    const existing = cart.products.find(p => p.product.toString() === pid);
    if (existing) existing.quantity += q;
    else cart.products.push({ product: pid, quantity: q });

    await CartsDAO.save(cart);
    return cart;
}

async updateQuantity(cid, pid, quantity) {
    const cart = await CartsDAO.findByIdRaw(cid);
    if (!cart) { const e = new Error('Carrito no encontrado'); e.status = 404; throw e; }

    const q = parseInt(quantity, 10);
    if (!q || q <= 0) { const e = new Error('La cantidad debe ser mayor a 0'); e.status = 400; throw e; }

    const item = cart.products.find(p => p.product.toString() === pid);
    if (!item) { const e = new Error('Producto no encontrado en carrito'); e.status = 404; throw e; }

    item.quantity = q;
    await CartsDAO.save(cart);
    return cart;
}

async removeProduct(cid, pid) {
    const cart = await CartsDAO.findByIdRaw(cid);
    if (!cart) { const e = new Error('Carrito no encontrado'); e.status = 404; throw e; }
    cart.products = cart.products.filter(p => p.product.toString() !== pid);
    await CartsDAO.save(cart);
    return cart;
}

async emptyCart(cid) {
    const cart = await CartsDAO.findByIdRaw(cid);
    if (!cart) { const e = new Error('Carrito no encontrado'); e.status = 404; throw e; }
    cart.products = [];
    await CartsDAO.save(cart);
    return cart;
}

async purchase(cid, purchaserEmail) {
    const cart = await CartsDAO.findById(cid); 
    if (!cart) { const e = new Error('Carrito no encontrado'); e.status = 404; throw e; }

    let total = 0;
    const noStock = [];
    const okItems = [];

    for (const item of cart.products) {
    const prod = item.product;
    if (prod.stock >= item.quantity) {
        total += prod.price * item.quantity;
        okItems.push(item);
    } else {
        noStock.push({ product: prod._id, requested: item.quantity, stock: prod.stock });
    }
    }

    for (const item of okItems) {
    const prod = item.product;
    prod.stock = prod.stock - item.quantity;
    await prod.save();
    }

    cart.products = cart.products.filter(
    p => noStock.find(n => n.product.toString() === p.product._id.toString())
    );
    await cart.save();

    if (okItems.length === 0) {
    return { purchased: false, amount: 0, ticket: null, noStock };
    }

    const ticket = await Ticket.create({
    code: genCode(),
    amount: total,
    purchaser: purchaserEmail
    });

    return { purchased: true, amount: total, ticket, noStock };
}
}

module.exports = new CartRepository();