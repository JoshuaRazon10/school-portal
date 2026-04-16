const express = require('express');
const router = express.Router();
const db = require('../data/db');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// GET /api/attendance/student/:id (Fetch attendance for a specific student)
router.get('/student/:id', auth, async (req, res) => {
  try {
    const targetUserId = (req.user.role === 'admin') ? req.params.id : req.user.id;
    const attendance = await db.query(`
      SELECT a.*, s.name as subjectName, s.code as subjectCode
      FROM attendance a
      JOIN subjects s ON a.subject_id = s.id
      WHERE a.user_id = ?
      ORDER BY a.date DESC
    `, [targetUserId]);
    res.json({ success: true, attendance });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Institutional attendance fetch error.' });
  }
});

// POST /api/attendance (Mark attendance - Admin only)
router.post('/', auth, admin, async (req, res) => {
  try {
    const { userId, subjectId, date, status, remarks } = req.body;
    await db.query(
      'INSERT INTO attendance (user_id, subject_id, date, status, remarks) VALUES (?, ?, ?, ?, ?)',
      [userId, subjectId, date, status, remarks]
    );
    res.json({ success: true, message: 'Institutional attendance record confirmed.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Attendance record entry error.' });
  }
});

module.exports = router;
