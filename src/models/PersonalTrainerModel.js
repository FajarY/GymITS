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

module.exports = {
    create,
    getByID
}