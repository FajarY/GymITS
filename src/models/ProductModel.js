const db = require('../database')

const addNewProduct  = async (name, price) => {
    try {
        const product = await db.admin('product').
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
        const products = await db.admin('product')
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

const getAllBought = async(id) => {
    const rawQuery = `        
        SELECT DISTINCT
            p.p_id as id,
            p.p_name as name,
            p.p_price as price,
            p.p_stock as stock
        FROM
            receipt AS r
        JOIN
            receipt_product AS rp ON r.r_id = rp.r_id
        JOIN
            product AS p ON rp.p_id = p.p_id
        WHERE
            r.c_id = ?
    ` 

    const products = await db.admin.raw(rawQuery, [id]);
    return products.rows;
}

const addProductStock = async(id, amount, employee_id) => {
    try {
        const product = await db.admin('product_employee').
        insert({
            p_id: id,
            added_by_e_id: employee_id,
            add_amount: amount
        }).returning('*');

        return product[0];
    } catch(error) {
        console.log(error)
        throw new Error('fail to add stock product');
    }
}

const updatesProduct = async (employee_id, product_id, updates) => {
    try {
        const product = await db.admin('product')
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

async function isProductExistAndCheckStock(id, amount)
{
    try
    {
        const [product] = await db.admin('product')
        .where({p_id: id});

        if(product == undefined)
        {
            return 0;
        }
        if(product.p_stock < amount)
        {
            return 1;
        }
        return 2;
    }
    catch(error)
    {
        throw new Error('Failed when querying product exist');
    }
}

const productSummary =  async () => {
    const result = await db.admin('product_summary_sales').select('*');
    return result;
}

const percentageAddOnProductByemployee = async(product_id) => {
    const result = await db.admin.raw('SELECT * FROM PERCENTAGE_ADD_ON_PRODUCT_BY_EMPLOYEE(?)', [product_id]);
    return result.rows;
}

module.exports = {
    addNewProduct,
    addProductStock,
    getAll,
    getAllBought,
    updatesProduct,
    isProductExistAndCheckStock,
    productSummary,
    percentageAddOnProductByemployee
}
