const productRepo = require('../repositories/product.repository');

class ProductService {
create(data) {
    return productRepo.create(data);
}

getById(id) {
    return productRepo.getById(id);
}

paginate(params) {
    return productRepo.getPaginated(params);
}

update(id, update) {
    return productRepo.update(id, update);
}

delete(id) {
    return productRepo.delete(id);
}
}

module.exports = new ProductService();