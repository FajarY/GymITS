const db = require('../database')

async function getCustomerMembership(c_id)
{
    const [membership] = db('membership').select('m_id as id', 'm_telephone as telephone', 'm_alamat as alamat', 'm_start_date as start_date', 'm_expired_date as expired_date').where({
        c_id: c_id
    });

    return membership;
}

module.exports = 
{
    getCustomerMembership
}