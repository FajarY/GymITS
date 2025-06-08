const fs = require('fs');
const path = require('path');
const db = require('../database')

const migrate = async () => {
    try {

        const sqlPath = path.join(__dirname, 'database.up.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        await db.raw(sql);
        console.log('migration successfull.');
        process.exit(0);
    } catch (error) {
        console.error('error during migration:', error);
        process.exit(1);
    } 
}

migrate();