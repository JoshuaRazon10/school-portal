require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

const fs = require('fs');
if (!fs.existsSync('./uploads')) {
  fs.mkdirSync('./uploads');
}

// Routes
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/profile', require('./src/routes/profile'));
app.use('/api/courses', require('./src/routes/courses'));
app.use('/api/admin', require('./src/routes/admin'));
app.use('/api/grades', require('./src/routes/grades'));
app.use('/api/assignments', require('./src/routes/assignments'));
app.use('/api/announcements', require('./src/routes/announcements'));
app.use('/api/schedule', require('./src/routes/schedule'));
app.use('/api/attendance', require('./src/routes/attendance'));
app.use('/api/admin-advanced', require('./src/routes/admin_advanced'));
app.use('/api/messaging', require('./src/routes/messaging'));
app.use('/api/university', require('./src/routes/university'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'School Portal API is running!', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal server error.' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🎓 School Portal API running at http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/api/health\n`);
});
