const Product = require('../models/productsModels');

class ProductsDAO {

findPaginated(filter, options) {
    return Product.paginate(filter, options);
}

findById(id) {
    return Product.findById(id);
}

findOne(filter) {
    return Product.findOne(filter);
}

create(data) {
    return Product.create(data);
}

updateById(id, update) {
    return Product.findByIdAndUpdate(id, update, { new: true, runValidators: true });
}

deleteById(id) {
    return Product.findByIdAndDelete(id);
}
}

module.exports = new ProductsDAO();