const db = require('../database')

async function getCustomerMembership(c_id)
{
    const [membership] = await db('membership').select('m_id as id', 'm_telephone as telephone', 'm_alamat as alamat', 'm_start_date as start_date', 'm_expired_date as expired_date', 'mt_id').where({
        c_id: c_id
    });

    return membership;
}

async function createCustomerMembership(c_id, telephone, alamat, start_date, expired_date, mt_id)
{
    const [membership] = await db('membership').insert({
        m_telephone: telephone,
        m_alamat: alamat,
        m_start_date: start_date,
        m_expired_date: expired_date,
        c_id: c_id,
        mt_id: mt_id
    }).returning('m_id');

    return membership;
}

async function updateCustomerMembershipSafe(m_id, c_id, telephone, alamat, start_date, expired_date, mt_id)
{
    const [membership] = await db('membership').where(
        {
            m_id: m_id,
            c_id: c_id
        }
    ).update({
        m_id: m_id,
        c_id: c_id,
        m_telephone: telephone,
        m_alamat: alamat,
        m_start_date: start_date,
        m_expired_date: expired_date,
        mt_id: mt_id
    }).returning('*');

    return membership;
}

module.exports = 
{
    getCustomerMembership,
    createCustomerMembership,
    updateCustomerMembershipSafe
}