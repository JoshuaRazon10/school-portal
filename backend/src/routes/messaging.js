const express = require('express');
const router = express.Router();
const db = require('../data/db');
const auth = require('../middleware/auth');

// --- 1. Institutional Direct Messaging ---
router.get('/inbox', auth, async (req, res) => {
  try {
    const data = await db.query(`
      SELECT m.*, u.name as senderName, u.photo_url as senderPhoto
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.receiver_id = ?
      ORDER BY m.created_at DESC
    `, [req.user.id]);
    res.json({ success: true, messages: data });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Institutional inbox fetch error.' });
  }
});

router.post('/send', auth, async (req, res) => {
  try {
    const { receiverId, subject, content } = req.body;
    await db.query(
      'INSERT INTO messages (sender_id, receiver_id, subject, content) VALUES (?, ?, ?, ?)',
      [req.user.id, receiverId, subject, content]
    );
    res.json({ success: true, message: 'Message dispatched successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Message dispatch error.' });
  }
});

// --- 2. System-wide Emergency Alerts ---
router.get('/alerts', auth, async (req, res) => {
  try {
    const data = await db.query('SELECT * FROM alerts WHERE active = 1 ORDER BY created_at DESC');
    res.json({ success: true, alerts: data });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Alert fetch error.' });
  }
});

module.exports = router;
