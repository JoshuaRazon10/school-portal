const mysql = require('mysql2/promise');
require('dotenv').config({ path: 'c:/Users/admin/OneDrive/Desktop/School-website/backend/.env' });

async function checkSubjects() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const [rows] = await pool.query("SELECT id, code, name, day, time_start, time_end FROM subjects WHERE code IN ('ACC111', 'ACC113')");
    console.log(JSON.stringify(rows, null, 2));
    
    // Also check student_subjects to see if the user 1 (Alex) is truly enrolled
    const [enrollment] = await pool.query("SELECT * FROM student_subjects WHERE user_id = 1");
    console.log('Enrollment for Alex (User 1):', JSON.stringify(enrollment, null, 2));

  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

checkSubjects();
