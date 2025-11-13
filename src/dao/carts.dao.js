const Cart = require('../models/cart.model');

class CartsDAO {
async create() {
    return Cart.create({ products: [] });
}
async findById(id) {
    return Cart.findById(id).populate('products.product');
}
async findByIdRaw(id) {
    return Cart.findById(id);
}
async save(cartDoc) {
    return cartDoc.save();
}
}

module.exports = new CartsDAO();