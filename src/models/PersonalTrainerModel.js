const db = require('../database')

const create = async (name, alamat, password, telephone, gender, price_per_hour, employeeID) => {
    try {
        const [pt_id] = await db.admin('personal_trainer')
        .insert({
            pt_name: name,
            pt_alamat: alamat,
            pt_password: password,
            pt_telephone: telephone,
            pt_gender: gender,
            pt_price_per_hour: price_per_hour,
            added_by_e_id: employeeID
        })
        .returning('pt_id');

        return pt_id;
    } catch(error) {
        throw new Error('fail to insert personal trainer');
    }
}

const getByID = async (id) => {
    try {
        const [personalTrainer] = await db.trainer('personal_trainer')
        .select(
            'pt_id as id',
            'pt_name as name',
            'pt_alamat as alamat',
            'pt_password as password',
            'pt_telephone as telephone',
            'pt_gender as gender',
            'pt_price_per_hour as price_per_hour'
        )
        .where({ pt_id: id });
        
        return personalTrainer;
    } catch(error) {
        throw new Error('fail to get personal trainer');
    }
}

const getAll = async () => {
    try {
        const personalTrainer = await db.admin('personal_trainer')
        .select(
            'pt_id as id',
            'pt_name as name',
            'pt_price_per_hour as price_per_hour'
        );

        return personalTrainer;
    } catch (error) {
        throw new Error('fail to get personal trainer');
    }
}

const getAllUsed = async (id) => {
    const rawQuery = `
        SELECT  
            pt.pt_id AS id,
            pt.pt_name AS name, 
            pt.pt_price_per_hour AS price_per_hour 
        FROM personal_trainer pt
        NATURAL JOIN available_time at
        WHERE c_id = ? AND at.c_id IS NOT NULL  
        GROUP BY pt.pt_id, pt.pt_name, pt.pt_price_per_hour
    `
    try {
        const personalTrainer = await db.admin.raw(rawQuery, [id]);

        return personalTrainer.rows;
    } catch (error) {
        throw new Error('fail to get personal trainer');
    }
}

const getAvailableTime = async (personal_trainer_id, month, year, day) => {
    let available_time;
    if (day) {
        rawQuery = `
            SELECT at_date, availabilityTrainer(?, at_date) AS map_time
            FROM (
                SELECT at_date
                FROM available_time
                WHERE pt_id = ?
                AND EXTRACT(MONTH FROM at_date) = ?
                AND EXTRACT(YEAR FROM at_date) = ?
                AND EXTRACT(DAY FROM at_date) = ?
                GROUP BY at_date
            ) AS temp;
        `
        available_time = await db.admin.raw(rawQuery, [personal_trainer_id, personal_trainer_id, month, year, day]);
    } else {
        rawQuery = `
            SELECT at_date, availabilityTrainer(?, at_date) AS map_time
            FROM (
                SELECT at_date
                FROM available_time
                WHERE pt_id = ?
                AND EXTRACT(MONTH FROM at_date) = ?
                AND EXTRACT(YEAR FROM at_date) = ?
                GROUP BY at_date
            ) AS temp;
        `
        available_time = await db.admin.raw(rawQuery, [personal_trainer_id, personal_trainer_id, month, year]);
    }
    return available_time.rows;
}

const getProfile = async (personal_trainer_id) => {
    const [trainer] = await db.admin('view_trainer_profile')
    .select('*')
    .where({trainer_id: personal_trainer_id});
    
    return trainer
}

const getAvailableDate = async (personal_trainer_id) => {
    const rawQuery = `
        SELECT at_date AS date
        FROM available_time 
        NATURAL JOIN personal_trainer 
        WHERE pt_id = ? AND at_date > CURRENT_DATE
    `
    const trainer = await db.admin.raw(rawQuery, [personal_trainer_id]);

    return trainer.rows
}

const getAppointments = async (id) => {
    const rawQuery = `
        SELECT 
            pt.pt_id,
            pt.pt_name,
            at.at_date,
            at.at_start_time,
            at.at_end_time,
            c.c_name AS booked_by_customer,
            CASE 
                WHEN (at.at_date + at.at_end_time) <= CURRENT_TIMESTAMP THEN 'COMPLETED'
                ELSE 'UPCOMING'
            END AS appointment_status
        FROM personal_trainer pt
        JOIN available_time at ON pt.pt_id = at.pt_id
        JOIN customer c ON at.c_id = c.c_id
        WHERE pt.pt_id = ?
        ORDER BY at.at_date, at.at_start_time;
    `;

  const appointments = await db.trainer.raw(rawQuery, [id]);
  return appointments.rows;
}

//Fajar Query Join 2
async function getEfficiencyAllPTAvailableTimes()
{
    const rawQuery =
    `
    SELECT pt_id, pt_name, (CAST(COUNT(c_id) AS DECIMAL(10, 2)) / CAST(COUNT(pt_id) AS DECIMAL(10, 2))) * 100.0 as efficiency
        FROM available_time
        NATURAL JOIN personal_trainer
        GROUP BY pt_id, pt_name
        ORDER BY pt_id
    `;

    const data = await db.admin.raw(rawQuery);
    return data.rows;
}

const addAvailableTime = async (id, date, times) => {

    const base = `INSERT INTO available_time(at_date, at_start_time, at_end_time, pt_id) VALUES\n`
    let values = []  
    for(let i = 0; i < times.length; i++) {
        const start = `${(times[i] + 8 ).toString().padStart(2, '0')}:00:00`;
        const end = `${(times[i] + 9).toString().padStart(2, '0')}:00:00`;

        values.push(`('${date}', '${start}', '${end}', '${id}')`);
    }

    if (values.length === 0) return 0;

    const rawQuery = base + values.join(',\n') + ';';
    const result = await db.trainer.raw(rawQuery);
    
    return result.rowCount
}

const getIncome = async (id) => {
    const result = await db.trainer.raw('SELECT get_trainer_income(?) AS income', [id]);
    return result.rows[0];
}

const getTrainerLog = async () => {
    const result = await db.admin('trainer_log')
    .select('*')

    return result
}

module.exports = {
    create,
    getByID,
    getAll,
    getAllUsed,
    getAvailableDate,
    getAvailableTime,
    getProfile,
    getAppointments,
    getEfficiencyAllPTAvailableTimes,
    addAvailableTime,
    getIncome,
    getTrainerLog
}