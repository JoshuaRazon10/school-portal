const db = require('./src/data/db');

async function test() {
  try {
    const results = await db.query('SELECT 1 + 1 AS solution');
    console.log('Database connected successfully! Solution:', results[0].solution);
    process.exit(0);
  } catch (err) {
    console.error('Database connection failed:', err.message);
    process.exit(1);
  }
}

test();
