const express = require('express');
const router = express.Router();
const db = require('../data/db');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// GET /api/schedule
router.get('/', auth, async (req, res) => {
  try {
    // Return schedule based on enrolled subjects for students, or all for admin
    let query;
    let params = [];
    
    if (req.user.role === 'admin') {
      query = 'SELECT id, day, time_start as time_start, time_end as time_end, name as subject, room, teacher FROM subjects';
    } else {
      query = `
        SELECT s.id, s.day, s.time_start as time_start, s.time_end as time_end, s.name as subject, s.room, s.teacher 
        FROM subjects s
        JOIN student_subjects ss ON s.id = ss.subject_id
        WHERE ss.user_id = ?
      `;
      params = [req.user.id];
    }
    
    const schedules = await db.query(query, params);
    res.json({ success: true, schedules });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Institutional schedule fetch error.' });
  }
});

// POST /api/schedule (Admin only)
router.post('/', auth, admin, async (req, res) => {
  try {
    const { day, time_start, time_end, subject, room, teacher } = req.body;
    await db.query(
      'INSERT INTO schedules (day, time_start, time_end, subject, room, teacher) VALUES (?, ?, ?, ?, ?, ?)',
      [day, time_start, time_end, subject, room, teacher]
    );
    res.json({ success: true, message: 'Class scheduled successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Scholastic schedule assignment error.' });
  }
});

module.exports = router;
