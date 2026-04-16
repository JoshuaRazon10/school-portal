const express = require('express');
const router = express.Router();
const db = require('../data/db');
const auth = require('../middleware/auth');

// GET /api/assignments
router.get('/', auth, async (req, res) => {
  try {
    const rows = await db.query('SELECT * FROM assignments WHERE user_id = ?', [req.user.id]);
    
    // Transform to camelCase for frontend compatibility
    const assignments = rows.map(a => ({
      id: a.id,
      courseCode: a.course_code,
      title: a.title,
      dueDate: a.due_date,
      status: a.status,
      priority: a.priority
    }));

    res.json({ success: true, assignments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Database fetch error during assignments load.', assignments: [] });
  }
});

// PATCH /api/assignments/:id/status
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'in-progress', 'submitted', 'graded'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid assignment status.' });
    }

    await db.query(
      'UPDATE assignments SET status = ? WHERE id = ? AND user_id = ?',
      [status, req.params.id, req.user.id]
    );

    res.json({ success: true, message: 'Institutional task status updated.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'MySQL status update error.' });
  }
});

module.exports = router;
