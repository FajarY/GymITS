const db = require('../database');

async function createCustomer(name, gender, email, password)
{
    const [c_id] = await db('customer').insert({
        c_name: name,
        c_gender: gender,
        c_email: email,
        c_password: password
    }).returning('c_id');

    return c_id;
}

async function getCustomerByEmail(email)
{
    const [customer] = await db('customer')
        .select('c_id as id', 'c_name as name', 'c_gender as gender', 'c_email as email', 'c_password as password')
        .where({c_email: email});

    return customer;
}

async function isCustomerExistByEmail(email)
{
    const [customer] = await db('customer')
        .select('c_email as email')
        .where({c_email: email});
    
    return customer != null;
}

module.exports = 
{
    createCustomer,
    getCustomerByEmail,
    isCustomerExistByEmail
}