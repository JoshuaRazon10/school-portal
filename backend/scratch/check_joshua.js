const mysql = require('mysql2/promise');
require('dotenv').config({ path: 'c:/Users/admin\OneDrive/Desktop/School-website/backend/.env' });

async function checkUser() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const [rows] = await pool.query("SELECT id, name, course, year_level, semester FROM users WHERE name LIKE '%JOSHUA%'");
    console.log(JSON.stringify(rows, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

checkUser();
