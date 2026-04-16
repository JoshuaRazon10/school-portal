const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const db = require('../data/db');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// --- Social Storage Logic ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `announce-${Date.now()}${ext}`);
  }
});
const upload = multer({ storage });

// GET /api/announcements (Feed View)
router.get('/', auth, async (req, res) => {
  try {
    // Fetch announcements with comment counts
    const announcements = await db.query(`
      SELECT a.*, (SELECT COUNT(*) FROM announcement_comments WHERE announcement_id = a.id) as commentCount
      FROM announcements a 
      ORDER BY a.id DESC
    `);
    res.json({ success: true, announcements });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database announcement fetch error.', announcements: [] });
  }
});

// POST /api/announcements (Social Dispatch - Admin only)
router.post('/', auth, admin, upload.single('image'), async (req, res) => {
  try {
    const { title, content, category, important, author, date } = req.body;
    const protocol = req.protocol === 'http' && req.headers['x-forwarded-proto'] ? 'https' : req.protocol;
    const imageUrl = req.file ? `${protocol}://${req.get('host')}/uploads/${req.file.filename}` : null;

    await db.query(
      'INSERT INTO announcements (title, content, category, important, author, date, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [title, content, category, important === 'true' || important === true ? 1 : 0, author, date, imageUrl]
    );
    res.json({ success: true, message: 'Social institutional notice dispatched.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Announcement creation error.' });
  }
});

// --- Commenting Architecture ---

// GET /api/announcements/:id/comments
router.get('/:id/comments', auth, async (req, res) => {
  try {
    const comments = await db.query(`
      SELECT c.*, u.name as userName, u.avatar, u.photo_url as userPhoto
      FROM announcement_comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.announcement_id = ?
      ORDER BY c.created_at ASC
    `, [req.params.id]);
    res.json({ success: true, comments });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch comments.' });
  }
});

// POST /api/announcements/:id/comments
router.post('/:id/comments', auth, async (req, res) => {
  try {
    const { content } = req.body;
    await db.query(
      'INSERT INTO announcement_comments (announcement_id, user_id, content) VALUES (?, ?, ?)',
      [req.params.id, req.user.id, content]
    );
    res.json({ success: true, message: 'Comment synchronized.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Comment synchronization error.' });
  }
});

// DELETE /api/announcements/delete-announcement/:id (Admin only)
router.delete('/delete-announcement/:id', auth, admin, async (req, res) => {
  try {
    await db.query('DELETE FROM announcements WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Institutional notice purged.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Institutional announcement deletion error.' });
  }
});

module.exports = router;
