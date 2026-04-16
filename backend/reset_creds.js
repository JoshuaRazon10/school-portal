const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function reset() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'chcc_portal',
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
  });

  const hash = await bcrypt.hash('password123', 10);
  console.log('Resetting Institutional Admin Password...');
  
  await connection.execute(
    'UPDATE users SET password = ? WHERE email = ?',
    [hash, 'admin@chcc.edu.ph']
  );
  
  await connection.execute(
    'UPDATE users SET password = ? WHERE email = ?',
    [hash, 'alex.johnson@chcc.edu.ph']
  );

  console.log('✅ Credentials Reset Successful!');
  console.log('Email: admin@chcc.edu.ph');
  console.log('Password: password123');
  process.exit();
}

reset().catch(console.error);
