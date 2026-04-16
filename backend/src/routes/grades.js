const express = require('express');
const router = express.Router();
const db = require('../data/db');
const auth = require('../middleware/auth');

// GET /api/grades
router.get('/', auth, async (req, res) => {
  try {
    const rows = await db.query('SELECT * FROM grades WHERE user_id = ?', [req.user.id]);
    
    // CamelCase for frontend
    const grades = rows.map(g => ({
      id: g.id,
      courseName: g.course_name,
      semester: g.semester,
      grade: g.grade,
      score: g.score,
      status: g.status
    }));

    res.json({ success: true, grades });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Database grades fetch error.', grades: [] });
  }
});

module.exports = router;
