const express = require('express');
const router = express.Router();
const db = require('../data/db');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// --- 1. University Event Calendar ---
router.get('/events', auth, async (req, res) => {
  try {
    const data = await db.query('SELECT * FROM events ORDER BY event_date ASC');
    res.json({ success: true, events: data });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Event fetch error.' });
  }
});

router.post('/events', auth, admin, async (req, res) => {
  try {
    const { title, location, date, desc, org } = req.body;
    await db.query('INSERT INTO events (title, location, event_date, description, organizer) VALUES (?, ?, ?, ?, ?)', [title, location, date, desc, org]);
    res.json({ success: true, message: 'Event published to institutional calendar.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Institutional event publishing error.' });
  }
});

// --- 2. Library & Professional Resource Search ---
router.get('/resources', auth, async (req, res) => {
  try {
    const { query, category } = req.query;
    let sql = 'SELECT * FROM resources ';
    const params = [];
    if(query || category) sql += ' WHERE ';
    if(query) { sql += ' title LIKE ? '; params.push(`%${query}%`); }
    if(query && category) sql += ' AND ';
    if(category) { sql += ' category = ? '; params.push(category); }
    
    const data = await db.query(sql, params);
    res.json({ success: true, resources: data });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Institutional resource catalog fetch error.' });
  }
});

router.post('/resources', auth, admin, async (req, res) => {
  try {
    const { title, author, isbn, category } = req.body;
    await db.query('INSERT INTO resources (title, author, isbn, category) VALUES (?, ?, ?, ?)', [title, author, isbn, category]);
    res.json({ success: true, message: 'Institutional resource catalog updated.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Institutional resource entry error.' });
  }
});

module.exports = router;
