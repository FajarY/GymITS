const db = require('../database');

const getAllReceipt = async (id) => {
    rawQuery = `
        SELECT 
            r.r_id AS receipt_id,
            r.r_date AS receipt_date,
            r.r_final_price AS receipt_final_price,

            p.p_id AS product_id,
            p.p_name AS product_name,
            p.p_price * rp.rp_amount * (1 - rp.rp_discount) AS total_per_product,

            mtr.mtr_id AS membership_id,
            mt.mt_name AS membership_type,
            mtr.mtr_price_per_month * mtr.mtr_month_amount AS total_membership,

            pt.pt_id AS personal_trainer_id,
            pt.pt_name AS personal_trainer_name,
            ptr.ptr_price_per_hour * ptr.ptr_hour_amount * (1 - ptr.ptr_discount) AS total_personal_trainer
        FROM receipt r
        NATURAL LEFT JOIN customer
        NATURAL LEFT JOIN receipt_product rp 
        NATURAL LEFT JOIN product p 
        NATURAL LEFT JOIN membership_type_receipt mtr
        NATURAL LEFT JOIN membership_type mt
        NATURAL LEFT JOIN personal_trainer_receipt ptr
        NATURAL LEFT JOIN personal_trainer pt
        NATURAL LEFT JOIN membership m
        WHERE c_id = ?
        ORDER BY receipt_id
    `

    const result = await db.raw(rawQuery, [id])
    return result.rows
}

async function createReceipt(c_id)
{
    const [data] = await db('receipt').insert(
        {
            r_date: new Date(Date.now()),
            r_final_price: 0.0,
            c_id: c_id
        }
    ).returning('r_id');

    return data;
}

module.exports = {
    getAllReceipt,
    createReceipt
}