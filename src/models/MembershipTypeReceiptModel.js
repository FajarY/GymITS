const db = require('../database');

async function purchaseMembership(r_id, mt_id, mtr_month_amount)
{
    const [data] = await db('membership_type_receipt').insert(
        {
            r_id: r_id,
            mt_id: mt_id,
            mtr_month_amount: mtr_month_amount
        }
    ).returning('*');
}

module.exports = 
{
    purchaseMembership
}