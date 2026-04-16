const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function apply() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || ''
  });

  console.log('📖 Reading schema.sql...');
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');

  // Split schema into individual queries by ';' but handle edge cases
  const queries = schema.split(/;\r?\n|;\n/);

  console.log('🚀 Running queries...');
  for (let query of queries) {
    const trimmed = query.trim();
    if (trimmed && !trimmed.startsWith('--')) {
      try {
        await connection.query(trimmed);
      } catch (err) {
        console.error('❌ Failed query:', trimmed);
        console.error('Error:', err.message);
      }
    }
  }

  console.log('✅ Schema application complete!');
  await connection.end();
  process.exit();
}

apply().catch(console.error);
