const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkJoshuaSubjects() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false }
  });

  console.log('📡 Connected to Academic Archives');

  try {
    // 1. Find Joshua's ID (assuming studentId CHCC-2026-1002 from screenshot)
    const [users] = await connection.query("SELECT id, name, course, year_level, semester FROM users WHERE name LIKE '%JOSHUA%'");
    console.log('👤 Identity results:', users);

    if (users.length > 0) {
      const user = users[0];
      const userId = user.id;

      // Check Program ID
      const [programs] = await connection.query("SELECT id FROM programs WHERE name = ?", [user.course]);
      console.log('🏛️ Program Mapping:', programs);
      const programId = programs.length > 0 ? programs[0].id : null;

      // Check all subjects for this program/year/sem
      const [programSubjects] = await connection.query(`
        SELECT id, code, name, day, time_start, time_end, room 
        FROM subjects 
        WHERE program_id = ? AND year_level = ? AND semester = ?
      `, [programId, user.year_level, user.semester]);
      console.log('📋 Institutional Program Subjects:');
      console.table(programSubjects);

      // Check Manual Enrollments
      const [manualSubjects] = await connection.query(`
        SELECT s.id, s.code, s.name, s.day, s.time_start, s.time_end, s.room
        FROM subjects s
        JOIN student_subjects ss ON s.id = ss.subject_id
        WHERE ss.user_id = ?
      `, [userId]);
      console.log('📚 Manual Enrolled Subjects:');
      console.table(manualSubjects);
    }
  } catch (err) {
    console.error('❌ Diagnostic failed:', err.message);
  } finally {
    await connection.end();
  }
}

checkJoshuaSubjects();
