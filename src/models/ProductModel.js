const db = require('../database')

const addNewProduct  = async (name, price) => {
    try {
        const product = await db('product').
        insert({
            p_name: name,
            p_price: price,
            p_stock: 0
        }).returning('*');

        return product;
    }catch(error) {
        throw new Error('fail to insert product');
    }
}


const getAll = async() => {
    try {
        const products = await db('product')
        .select(
            'p_id as id',
            'p_name as name',
            'p_price as price',
            'p_stock as stock'
        );

        return products;
    }catch(error) {
        throw new Error('fail to get product');
    }
}

const addProductStock = async(id, amount, employee_id) => {
    console.log(id, amount, employee_id)
    try {
        const product = await db('product_employee').
        insert({
            p_id: id,
            added_by_e_id: employee_id,
            add_amount: amount
        }).returning('*');

        return product[0];
    } catch(error) {
        throw new Error('fail to add stock product');
    }
}

const updatesProduct = async (employee_id, product_id, updates) => {
    try {
        const product = await db('product')
        .where({p_id: product_id})
        .update(updates)
        .returning(['p_id', 'p_name', 'p_price', 'p_stock'])

        return {
            id: product[0].p_id,
            name: product[0].p_name,
            price: product[0].p_price,
            stock: product[0].p_stock
        }
    } catch(error) {
        throw new Error('fail to update product');
    }
}

module.exports = {
    addNewProduct,
    addProductStock,
    getAll,
    updatesProduct
}
