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
    const query = `
        SELECT available_slot
        FROM get_available_slots('${personal_trainer_id}')
        WHERE available_slot && tsrange(DATE '${date}', DATE '${date}' + INTERVAL '1 day', '[)')
    `
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

module.exports = {
    create,
    getByID,
    getAll,
    getAvailableTime
}