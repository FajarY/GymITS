const db = require('../database')

const create = async (name, alamat, password, telephone, gender, price_per_hour, employeeID) => {
    try {
        const [pt_id] = await db('personal_trainer')
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
        const [personalTrainer] = await db('personal_trainer')
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
        const personalTrainer = await db('personal_trainer')
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

const getAvailableTime = async (personal_trainer_id, date) => {
    try {
        const available_time = await db
        .select('*')
        .from(db.raw('get_available_slots(?)', [personal_trainer_id]))
        .whereRaw("available_slot && tsrange(?::date, ?::date + interval '1 day', '[)')", [date, date]);

        return available_time;
    }catch(error) {
        throw new Error('fail to get personal trainer available time');
    }
}

const getProfile = async (personal_trainer_id) => {
    const [trainer] = await db('personal_trainer')
    .select(
        'pt_name AS name',
        'pt_gender AS gender',
        'pt_price_per_hour AS price_per_hour',
        'pt_alamat AS alamat',
        'pt_telephone AS telephone'
    )
    .where({pt_id: personal_trainer_id});
    
    return trainer
}


const getAvailableDate = async (personal_trainer_id) => {
    const rawQuery = `
        SELECT at_date AS date
        FROM available_time 
        NATURAL JOIN personal_trainer 
        WHERE pt_id = ? AND at_date > CURRENT_DATE
    `
    const trainer = await db.raw(rawQuery, [personal_trainer_id]);

    return trainer.rows
}

const getAppointments = async (id) => {
      const rawQuery = `
    SELECT
        c.c_name AS customer_name,
        pta.pt_a_date AS date,
        TO_CHAR(LOWER(pta.pt_start_end_time), 'HH12:MI AM') || ' - ' || 
        TO_CHAR(UPPER(pta.pt_start_end_time), 'HH12:MI AM') AS formatted_time,
        CASE
            WHEN UPPER(pta.pt_start_end_time) > NOW() THEN 'UPCOMING'
            ELSE 'COMPLETED'
        END AS status
    FROM 
        personal_trainer_appointment pta
    JOIN 
        customer c ON pta.c_id = c.c_id
    JOIN 
        personal_trainer pt ON pta.pt_id = pt.pt_id
    WHERE 
        pta.pt_id = ?
    ORDER BY 
        CASE
            WHEN UPPER(pta.pt_start_end_time) > NOW() THEN 1
            ELSE 2
        END,
        UPPER(pta.pt_start_end_time) ASC;
  `;

  const appointments = await db.raw(rawQuery, [id]);
  return appointments.rows;
}

module.exports = {
    create,
    getByID,
    getAll,
    getAvailableDate,
    getAvailableTime,
    getProfile,
    getAppointments
}