const db = require('../database');

async function insertPurchases(receipt_product_arr)
{
    const arr = await db.customer('receipt_product').insert(
        receipt_product_arr
    ).returning('*');

    return arr;
}

module.exports = 
{
    insertPurchases
}