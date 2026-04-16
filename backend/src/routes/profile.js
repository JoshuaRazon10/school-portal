const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const db = require('../data/db');
const auth = require('../middleware/auth');

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `student-${req.user.id}-${Date.now()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only institutional standard images are allowed.'));
  }
});

const bcrypt = require('bcryptjs');

// POST /api/profile/upload-photo
router.post('/upload-photo', auth, (req, res) => {
  upload.single('photo')(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ success: false, message: `Storage protocol error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }

    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file provided for student profile.' });
      }

      // Determine public URL dynamically
      const protocol = req.protocol === 'http' && req.headers['x-forwarded-proto'] ? 'https' : req.protocol;
      const host = req.get('host');
      const photoUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

    await db.query(
      'UPDATE users SET photo_url = ? WHERE id = ?',
      [photoUrl, req.user.id]
    );

      res.json({
        success: true,
        message: 'Institutional profile photo updated.',
        photoUrl
      });
    } catch (dbErr) {
      console.error('Database Sync Error:', dbErr);
      res.status(500).json({ success: false, message: 'Institutional ledger synchronization failure.' });
    }
  });
});

// POST /api/profile/change-password
router.post('/change-password', auth, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    // 1. Fetch user to get current hashed password
    const user = await db.query('SELECT password FROM users WHERE id = ?', [req.user.id]);
    if (user.length === 0) return res.status(404).json({ success: false, message: 'Institutional identity not found.' });

    // 2. Verify old password
    const isMatch = await bcrypt.compare(oldPassword, user[0].password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Verification Failed: The current password entered is incorrect.' });
    }

    // 3. Hash new password and update
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(newPassword, salt);

    await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPass, req.user.id]);

    res.json({ success: true, message: 'Institutional security keys synchronized. Password updated successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Security protocol error during password update.' });
  }
});

module.exports = router;
