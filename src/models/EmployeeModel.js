const db = require('../database')

const getByID = async (id) => {
    try {
        const [employee] = await db.admin('employee')
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
    const [employee] = await db.admin('view_employee_profile')
    .select('*')
    .where({ id: id });
    
    return employee;
}

async function getAllPeopleOnDatabase()
{
    const result = await db.admin.raw('SELECT * FROM ALL_PEOPLE_ON_DATABASE');
    return result.rows;
}

module.exports = {
    getByID,
    getProfile,
    getAllPeopleOnDatabase 
}