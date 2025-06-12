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

async function customerOnGym() {
  const [result] = await db('view_customer_on_gym').select('count');
  return result;
}

//Fajar Query Join 1
async function efficiencyAllMembersip()
{
  const rawQuery =
  `
  SELECT c_name, SUM(used_percentage) as percentage
  FROM
    (SELECT c_name, (total_training_time / membership_time) * 100.0 as used_percentage
    FROM
      (SELECT SUM(training_time) as total_training_time, c_name, membership_time
      FROM
        (SELECT EXTRACT('epoch' FROM ts_end_time - ts_start_time) as training_time, c_name, ((m_expired_date - m_start_date) * 86400.0) as membership_time
        FROM
          (SELECT ts_id, ts_end_time, ts_start_time, cs.c_name, c_id, m_start_date, m_expired_date
            FROM membership mb
            NATURAL JOIN training_session ts
            NATURAL JOIN customer cs
            WHERE ts_end_time > m_start_date AND ts_start_time < m_expired_date))
      GROUP BY c_name, membership_time)
    UNION
    SELECT c_name, 0.0 as used_percentage
    FROM
      customer cs)
  GROUP BY c_name
  `;

  const result = await db.raw(rawQuery);

  return result.rows;
}

module.exports = 
{
    createCustomer,
    getCustomerByEmail,
    isCustomerExistByEmail,
    getProfile,
    getAppointments,
    customerOnGym,
    efficiencyAllMembersip
}