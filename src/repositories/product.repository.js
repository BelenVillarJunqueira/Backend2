const ProductsDAO = require('../dao/products.dao');

class ProductRepository {
    async listPaginated({ limit = 10, page = 1, sort, query }) {
    const filter = {};
    
    if (query) {
        if (query.includes(':')) {
        const [key, value] = query.split(':');
        if (key === 'available') {
        filter.stock = value === 'true' ? { $gt: 0 } : 0;
        } else {
        filter[key] = value;
        }
    } else {
        filter.$or = [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        ];
    }
    }

    const options = {
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 10,
    sort: {},
    };

    if (sort === 'asc') options.sort.price = 1;
    if (sort === 'desc') options.sort.price = -1;

    return ProductsDAO.findPaginated(filter, options);
}

getPaginated(params) {
return this.listPaginated(params);
}

getById(pid) {
    return ProductsDAO.findById(pid);
}


async create(data) {
    const { title, description, code, price, stock, category } = data;

    if (!title || !description || !code || price === undefined || stock === undefined || !category) {
    const e = new Error('Faltan campos obligatorios (title, description, code, price, stock, category)');
    e.status = 400;
    throw e;
    }

    const existing = await ProductsDAO.findOne({ code });
    if (existing) {
    const e = new Error('Ya existe un producto con ese código');
    e.status = 400;
    throw e;
    }

    return ProductsDAO.create(data);
}


async update(pid, update) {
    const product = await ProductsDAO.updateById(pid, update);
    if (!product) {
    const e = new Error('Producto no encontrado');
    e.status = 404;
    throw e;
    }
    return product;
}


async delete(pid) {
    const product = await ProductsDAO.deleteById(pid);
    if (!product) {
    const e = new Error('Producto no encontrado');
    e.status = 404;
    throw e;
    }
    return product;
}



async remove(pid) {

    return this.delete(pid);
}
}

module.exports = new ProductRepository();