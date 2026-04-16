const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function initDB() {
  const config = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'chcc_portal',
    multipleStatements: true,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
  };

  try {
    console.log('Connecting to MySQL...');
    const connection = await mysql.createConnection(config);

    console.log('Reading schema.sql...');
    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');

    console.log('Applying schema instructions (this will reset the database)...');
    await connection.query(schema);

    console.log('Database initialized successfully with updated schema!');
    await connection.end();
    process.exit(0);
  } catch (err) {
    console.error('Initialization error:', err.message);
    process.exit(1);
  }
}

initDB();
