const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../data/db');
const authMiddleware = require('../middleware/auth');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    console.log(`Login attempt: ${email}`);
    const rows = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    const user = rows[0];

    if (!user) {
      console.log('User not found');
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Password mismatch');
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, studentId: user.student_id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE_IN || '7d' }
    );

    const { password: _pw, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: 'Institutional login successful.',
      token,
      user: {
        ...userWithoutPassword,
        yearLevel: user.year_level,
        studentId: user.student_id,
        role: user.role
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error during login: ' + err.message });
  }
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, course, yearLevel, phone, address, dob } = req.body;

    if (!name || !email || !password || !course || !yearLevel) {
      return res.status(400).json({ success: false, message: 'Institutional academic fields are required.' });
    }

    const existingUsers = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ success: false, message: 'Institutional email or student record already EXISTS.' });
    }

    const hashedPass = await bcrypt.hash(password, 10);
    const studentId = `CHCC-2025-${Math.floor(1000 + Math.random() * 9000)}`;
    const avatar = name.split(' ').map(n => n[0]).join('').toUpperCase();

    const result = await db.query(
      'INSERT INTO users (name, email, password, course, year_level, student_id, avatar, phone, address, dob) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, email, hashedPass, course, parseInt(yearLevel), studentId, avatar, phone || '', address || '', dob || null]
    );

    const newUser = {
      id: result.insertId,
      name, email, course, yearLevel, studentId, avatar,
      phone, address, dob,
      gpa: 1.0, semester: 1
    };

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, name: newUser.name, studentId: newUser.studentId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE_IN || '7d' }
    );

    res.json({ success: true, message: 'Registration successful.', token, user: newUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'MySQL registration error: ' + err.message });
  }
});

// GET /api/auth/me
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const rows = await db.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
    const user = rows[0];
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    const { password: _pw, ...userWithoutPassword } = user;
    res.json({
      success: true,
      user: {
        ...userWithoutPassword,
        yearLevel: user.year_level,
        studentId: user.student_id,
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database fetch error.' });
  }
});

module.exports = router;
