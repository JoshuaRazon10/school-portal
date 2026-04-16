const bcrypt = require('bcryptjs');
const db = require('./src/data/db');
require('dotenv').config();

async function reset() {
  const hash = await bcrypt.hash('123456', 10);
  console.log('New Hash for "123456":', hash);
  
  await db.query('UPDATE users SET password = ? WHERE email = ?', [hash, 'admin@chcc.edu.ph']);
  await db.query('UPDATE users SET password = ? WHERE email = ?', [hash, 'alex.johnson@chcc.edu.ph']);
  
  console.log('Institutional accounts synchronized with code: 123456');
  process.exit(0);
}

reset();
