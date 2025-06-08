const fs = require('fs');
const path = require('path');
const db = require('../database')

const down = async () => {
    try {

        const sqlPath = path.join(__dirname, 'seeding.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        await db.raw(sql);
        console.log('seeding successfull.');
        process.exit(0);
    } catch (error) {
        console.error('error during seed table:', error);
        process.exit(1);
    } 
}

down();