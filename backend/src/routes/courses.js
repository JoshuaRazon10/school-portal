const express = require('express');
const router = express.Router();
const db = require('../data/db');
const auth = require('../middleware/auth');

// GET /api/courses (Hybrid Curriculum: Regular + Irregular Manual Enrollment)
router.get('/', auth, async (req, res) => {
  try {
    // Allow Admins to view other student's records by providing a userId query param
    const targetUserId = (req.user.role === 'admin' && req.query.userId) ? req.query.userId : req.user.id;
    
    const userRows = await db.query('SELECT * FROM users WHERE id = ?', [targetUserId]);
    const user = userRows[0];
    if (!user) return res.status(404).json({ success: false, message: 'Institutional student record not identified.' });

    // 1. Fetch Default Program Subjects
    const programRows = await db.query('SELECT id FROM programs WHERE name = ?', [user.course]);
    let defaultSubjects = [];
    if (programRows.length > 0) {
      const programId = programRows[0].id;
      defaultSubjects = await db.query(
        'SELECT id, code, name, units, teacher, type FROM subjects WHERE program_id = ? AND year_level = ? AND semester = ?',
        [programId, user.year_level, user.semester]
      );
    }

    // 2. Fetch Manual Enrollments (Irregular Students)
    const manualSubjects = await db.query(`
      SELECT s.id, s.code, s.name, s.units, s.teacher, s.type 
      FROM subjects s
      JOIN student_subjects ss ON s.id = ss.subject_id
      WHERE ss.user_id = ?
    `, [user.id]);

    // 3. Merge and Unique (by subject ID)
    const allSubjectsMap = new Map();
    defaultSubjects.forEach(s => allSubjectsMap.set(s.id, s));
    manualSubjects.forEach(s => allSubjectsMap.set(s.id, s));
    
    const subjects = Array.from(allSubjectsMap.values());

    res.json({ 
      success: true, 
      courses: subjects, // Frontend legacy naming
      courseName: user.course,
      yearLevel: user.year_level,
      semester: user.semester
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Curriculum merger error.', courses: [] });
  }
});

module.exports = router;
