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

const addProductStock = async(id, amount, employeeID) => {
    console.log(id, amount, employeeID)
    try {
        const product = await db('product_employee').
        insert({
            p_id: id,
            added_by_e_id: employeeID,
            add_amount: amount
        }).returning('*');

        return product[0];
    } catch(error) {
        throw new Error('fail to add stock product');
    }
}

module.exports = {
    addNewProduct,
    addProductStock,
    getAll
}
