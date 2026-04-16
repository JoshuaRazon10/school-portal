const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'chcc_portal',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
});

// Helper for running queries
const query = async (sql, params) => {
  try {
    const [results] = await pool.query(sql, params);
    return results;
  } catch (err) {
    console.error('MySQL Query Error:', err);
    throw err;
  }
};

// Curriculum Mock (Since curriculum is a complex object, we'll keep it as a static helper for now)
const curriculum = {
  'BS in Computer Science': {
    1: {
      1: [
        { code: 'CS111', name: 'Intro to Comp Sci', units: 3, teacher: 'Dr. Cruz' },
        { code: 'CS112', name: 'Programming 1', units: 3, teacher: 'Ms. Reyes' },
      ],
      2: [
        { code: 'CS121', name: 'Programming 2', units: 3, teacher: 'Ms. Reyes' },
      ]
    }
  }
};

module.exports = {
  query,
  pool,
  curriculum
};
