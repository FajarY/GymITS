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

async function getProfile(id) 
{
    const [customer] = await db('view_customer_profile')
        .select('*')
        .where({id: id});

    return customer
}

async function getAppointments(id) {
  const rawQuery = `
    SELECT
      c.c_name AS name,
      c.c_id AS id,
      pt.pt_name AS trainer_name, 
      pta.pt_a_date appointment_date,
      TO_CHAR(LOWER(pta.pt_start_end_time), 'HH12:MI AM') || ' - ' || TO_CHAR(UPPER(pta.pt_start_end_time), 'HH12:MI AM') AS formatted_time,
      CASE
        WHEN UPPER(pta.pt_start_end_time) > NOW() THEN 'UPCOMING'
        ELSE 'COMPLETED'
      END AS status
    FROM
      personal_trainer_appointment pta
    JOIN customer c ON pta.c_id = c.c_id
    JOIN personal_trainer pt ON pta.pt_id = pt.pt_id
    WHERE c.c_id = ?
    ORDER BY
      CASE
        WHEN UPPER(pta.pt_start_end_time) > NOW() THEN 1
        ELSE 2
      END,
      UPPER(pta.pt_start_end_time) ASC;
  `;


  const result = await db.raw(rawQuery, [id]);
  return result.rows; 
}

module.exports = 
{
    createCustomer,
    getCustomerByEmail,
    isCustomerExistByEmail,
    getProfile,
    getAppointments
}