const db = require('./src/data/db');

async function migrate() {
  try {
    console.log('Starting migration...');
    
    // Add columns to subjects table
    await db.query(`
      ALTER TABLE subjects 
      ADD COLUMN day VARCHAR(20),
      ADD COLUMN time_start VARCHAR(20),
      ADD COLUMN time_end VARCHAR(20),
      ADD COLUMN room VARCHAR(50)
    `);
    
    console.log('Migration successful: Added schedule columns to subjects table.');
    
    // Update existing subjects with dummy data
    await db.query(`UPDATE subjects SET day='Monday', time_start='08:00 AM', time_end='10:00 AM', room='Room 101' WHERE day IS NULL`);
    
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  }
}

migrate();
