const mysql = require('mysql2/promise');
require('dotenv').config();

async function patchDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false }
  });

  console.log('📡 Connected to Institutional Database Archives');

  try {
    // Check if image_url exists
    const [columns] = await connection.query('SHOW COLUMNS FROM announcements');
    const hasImageUrl = columns.some(col => col.Field === 'image_url');

    if (!hasImageUrl) {
      console.log('🏗️ Adding missing image_url coordinate to announcements table...');
      await connection.query('ALTER TABLE announcements ADD COLUMN image_url VARCHAR(255) AFTER date');
      console.log('✅ Identity protocol synchronized.');
    } else {
      console.log('✅ image_url coordinate already exists.');
    }

    // Create comments table
    console.log('🏗️ Establishing Engagement Feed architecture...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS announcement_comments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        announcement_id INT NOT NULL,
        user_id INT NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (announcement_id) REFERENCES announcements(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Engagement Feed synchronized.');
  } catch (err) {
    console.error('❌ Protocol synchronization failed:', err.message);
  } finally {
    await connection.end();
  }
}

patchDatabase();
