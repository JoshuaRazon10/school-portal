const mysql = require('mysql2/promise');
require('dotenv').config();

async function updateName() {
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASS || '',
        database: 'chcc_portal'
    });

    try {
        await conn.query('UPDATE announcements SET author = "Concepcion Holy Cross College Inc."');
        console.log('✅ Institutional branding updated in announcements.');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

updateName();
