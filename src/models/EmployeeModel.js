const db = require('../database')

const getByID = async (id) => {
    try {
        const [employee] = await db('employee')
        .select(
            'e_id as id',
            'e_name as name',
            'e_alamat as alamat',
            'e_password as password',
            'e_telephone as telephone',
            'e_gender as gender'
        )
        .where({ e_id: id });
        
        return employee;
    } catch(error) {
        throw new Error('fail to get personal trainer');
    }
}

const getProfile = async (id) => {
    const [employee] = await db('employee')
    .select(
        'e_id as id',
        'e_name as name',
        'e_alamat as alamat',
        'e_telephone as telephone',
        'e_gender as gender'
    )
    .where({ e_id: id });
    
    return employee;
}


module.exports = {
    getByID,
    getProfile
}