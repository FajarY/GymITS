const db = require('../database');

async function createCustomer(name, gender, email, password)
{
    const [c_id] = await db.customer('customer').insert({
        c_name: name,
        c_gender: gender,
        c_email: email,
        c_password: password
    }).returning('c_id');

    return c_id;
}

async function getCustomerByEmail(email)
{
    const [customer] = await db.customer('customer')
        .select('c_id as id', 'c_name as name', 'c_gender as gender', 'c_email as email', 'c_password as password')
        .where({c_email: email});

    return customer;
}

async function isCustomerExistByEmail(email)
{
    const [customer] = await db.customer('customer')
        .select('c_email as email')
        .where({c_email: email});
    
    return customer != null;
}

async function getProfile(id) 
{
    const [customer] = await db.customer('view_customer_profile')
        .select('*')
        .where({id: id});

    return customer
}

async function getAppointments(id) {
  const rawQuery = `
    SELECT
        pt.pt_name,
        TO_CHAR(at.at_date, 'FMMonth DD, YYYY') AS appointment_date,
        CONCAT(
            TO_CHAR(at.at_start_time, 'HH12:MI AM'),
            ' - ',
            TO_CHAR(at.at_end_time, 'HH12:MI AM')
        ) AS appointment_time,
        CASE
            WHEN (at.at_date + at.at_start_time) > CURRENT_TIMESTAMP THEN 'Upcoming'
            ELSE 'Completed'
        END AS status
    FROM
        available_time AS at
    JOIN
        personal_trainer AS pt ON at.pt_id = pt.pt_id
    WHERE
        at.c_id = ?
    ORDER BY
        CASE
            WHEN (at.at_date + at.at_start_time) > CURRENT_TIMESTAMP THEN 1
            ELSE 2
        END,
        CASE
            WHEN (at.at_date + at.at_start_time) > CURRENT_TIMESTAMP THEN (at.at_date + at.at_start_time)
            ELSE NULL
        END ASC,
        CASE
            WHEN (at.at_date + at.at_start_time) <= CURRENT_TIMESTAMP THEN (at.at_date + at.at_start_time)
            ELSE NULL
        END DESC;
  `;

  const result = await db.customer.raw(rawQuery, [id]);
  return result.rows; 
}

const getTrainingStatistic = async (id) => {
    const rawQuery = `
        SELECT 
            c.c_id,
            c.c_name,
            COUNT(ts.ts_id) AS total_sessions
        FROM training_session ts
        JOIN customer c ON ts.c_id = c.c_id
        WHERE EXTRACT(MONTH FROM ts.ts_start_time) = EXTRACT(MONTH FROM CURRENT_DATE)
        AND EXTRACT(YEAR FROM ts.ts_start_time) = EXTRACT(YEAR FROM CURRENT_DATE)
        AND c.c_id = ?
        GROUP BY c.c_id, c.c_name;
    `;

    const statistic = await db.customer.raw(rawQuery, [id]);
    return statistic.rows;
}

const totalSpending = async (id) => {
    const result = await db.customer.raw('SELECT * FROM get_total_spending(?)', [id]);
    return result.rows[0];
}

async function customerOnGym() {
  const [result] = await db.admin('view_customer_on_gym').select('count');
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

  const result = await db.admin.raw(rawQuery);

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
    efficiencyAllMembersip,
    getTrainingStatistic,
    totalSpending
}