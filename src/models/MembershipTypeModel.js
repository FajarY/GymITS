const db = require('../database')

async function getAllMembershipTypes()
{
    const arr = await db('membership_type').select('mt_id as id', 'mt_name as name', 'mt_price_per_month as price_per_month');

    return arr;
}

async function getData(mt_id)
{
    const [data] = await db('membership_type').where(
        {mt_id: mt_id}
    );

    return data;
}

module.exports = 
{
    getAllMembershipTypes,
    getData
}