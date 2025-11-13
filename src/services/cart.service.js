const CartRepo = require('../repositories/cart.repository');

class CartService {
async purchase(cartId, purchaserEmail) {

    return CartRepo.purchase(cartId, purchaserEmail);
}
}

module.exports = new CartService();