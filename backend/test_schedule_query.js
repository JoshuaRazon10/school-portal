const mysql = require('mysql2/promise');
require('dotenv').config();

async function testScheduleQuery() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const userId = 1000;
    const [userRows] = await connection.query('SELECT course, year_level, semester FROM users WHERE id = ?', [userId]);
    const user = userRows[0];
    const [programRows] = await connection.query('SELECT id FROM programs WHERE name = ?', [user.course]);
    const programId = programRows[0].id;

    console.log(`🔍 Testing Schedule Query for ${user.course} (Program ${programId}), Year ${user.year_level}, Sem ${user.semester}`);

    const query = `
      SELECT DISTINCT s.id, s.code, s.day, s.time_start, s.time_end, s.name as subject, s.room, s.teacher 
      FROM subjects s
      LEFT JOIN student_subjects ss ON s.id = ss.subject_id
      WHERE (s.program_id = ? AND s.year_level = ? AND s.semester = ?)
         OR ss.user_id = ?
    `;
    const [results] = await connection.query(query, [programId, user.year_level, user.semester, userId]);
    
    console.log('📊 Resulting Schedule Feed:');
    console.table(results);

  } catch (err) {
    console.error('❌ Query test failed:', err.message);
  } finally {
    await connection.end();
  }
}

testScheduleQuery();
