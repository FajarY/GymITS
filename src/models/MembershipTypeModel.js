const db = require('../database')

async function getAllMembershipTypes()
{
    const arr = await db('membership_type').select('mt_id as id', 'mt_name as name', 'mt_price_per_month as price_per_month');

    return arr;
}

module.exports = 
{
    getAllMembershipTypes
}