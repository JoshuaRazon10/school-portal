const express = require('express');
const router = express.Router();
const db = require('../data/db');
const bcrypt = require('bcryptjs');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// 1. Fetch All Students (Admin Only)
router.get('/students', auth, admin, async (req, res) => {
  try {
    const students = await db.query('SELECT id, name, student_id as studentId, course, year_level as yearLevel, email, gpa FROM users WHERE role = "student"');
    res.json({ success: true, students: students || [] });
  } catch (err) {
    console.error('Audit Fetch Error:', err);
    res.status(500).json({ success: false, message: 'Institutional student fetch error.' });
  }
});

// 2. Fetch All Subjects for Management (Major/Minor)
router.get('/all-subjects', auth, admin, async (req, res) => {
  try {
    const subjects = await db.query('SELECT id, code, name, teacher, units, type, day, time_start as timeStart, time_end as timeEnd, room FROM subjects');
    res.json({ success: true, subjects });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Institutional subject fetch error.' });
  }
});

// 3. Register New Student (Admin only)
router.post('/register-student', auth, admin, async (req, res) => {
  try {
    const { name, email, phone, password, course, yearLevel } = req.body;
    
    // Check if email already exists
    const existing = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Identity Conflict: This email is already registered in the archives.' });
    }

    const hashedPass = await bcrypt.hash(password, 10);

    // Get a unique numeric sequence (based on current timestamp + count for uniqueness)
    const countRows = await db.query('SELECT COUNT(*) as studentCount FROM users WHERE role = "student"');
    const studentNum = countRows[0].studentCount + 1001; 
    const studentId = `CHCC-2026-${studentNum}`;

    const avatar = name.split(' ').map(n => n[0]).join('').toUpperCase();

    const result = await db.query(
      'INSERT INTO users (name, email, phone, password, course, year_level, student_id, avatar, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?, "student")',
      [name, email, phone, hashedPass, course, parseInt(yearLevel), studentId, avatar]
    );

    // For INSERT, result usually has insertId directly if we return results in db.js
    const newUserId = result.insertId;

    if (newUserId) {
       // --- Automatic Billing: Initial Enrollment + Institutional Fee (₱7,500) ---
       await db.query('INSERT INTO financials (user_id, total_balance) VALUES (?, 7500.00)', [newUserId]);
    }

    res.json({ success: true, message: `Student Enrollment Registered: ${studentId}`, studentId });
  } catch (err) {
    console.error('Registration error details:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Administrative registration error.',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined 
    });
  }
});

// 4. Enroll Student in Specific Subject (Admin only)
router.post('/enroll-subject', auth, admin, async (req, res) => {
  try {
    const { userId, subjectId } = req.body;

    // Check if already enrolled
    const existing = await db.query('SELECT id FROM student_subjects WHERE user_id = ? AND subject_id = ?', [userId, subjectId]);
    if (existing.length > 0) return res.json({ success: false, message: 'Already enrolled in this subject specification.' });

    // Fetch subject cost details
    const subject = await db.query('SELECT type FROM subjects WHERE id = ?', [subjectId]);
    if (subject.length === 0) return res.status(404).json({ success: false, message: 'Subject not identified.' });

    const price = subject[0].type === 'major' ? 2500 : 2000;

    // Transactional logic
    await db.query('INSERT INTO student_subjects (user_id, subject_id) VALUES (?, ?)', [userId, subjectId]);

    // Update balance
    const fin = await db.query('SELECT id FROM financials WHERE user_id = ?', [userId]);
    if (fin.length === 0) {
      await db.query('INSERT INTO financials (user_id, total_balance) VALUES (?, ?)', [userId, price]);
    } else {
      await db.query('UPDATE financials SET total_balance = total_balance + ? WHERE user_id = ?', [price, userId]);
    }

    res.json({ success: true, message: `Institutional enrollment successful. ₱${price} added to student ledger.` });
  } catch (err) {
    console.error('Enrollment error:', err);
    res.status(500).json({ success: false, message: 'Subject enrollment error.' });
  }
});

// 5. Unenroll Student (Admin only)
router.delete('/unenroll-subject', auth, admin, async (req, res) => {
  try {
    const { userId, subjectId } = req.body;

    // Fetch subject cost details
    const subject = await db.query('SELECT type FROM subjects WHERE id = ?', [subjectId]);
    if (subject.length > 0) {
      const price = subject[0].type === 'major' ? 2500 : 2000;
      await db.query('UPDATE financials SET total_balance = total_balance - ? WHERE user_id = ?', [price, userId]);
    }

    await db.query('DELETE FROM student_subjects WHERE user_id = ? AND subject_id = ?', [userId, subjectId]);
    res.json({ success: true, message: 'Institutional unenrollment successful. Balance adjusted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Subject unenrollment error.' });
  }
});

// 6. Create New Subject Offerings (Admin only)
router.post('/create-subject', auth, admin, async (req, res) => {
  try {
    const { code, name, units, teacher, programId, yearLevel, semester, type, day, timeStart, timeEnd, room } = req.body;
    await db.query(
      'INSERT INTO subjects (code, name, units, teacher, program_id, year_level, semester, type, day, time_start, time_end, room) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [code, name, parseInt(units), teacher, parseInt(programId || 13), parseInt(yearLevel || 1), parseInt(semester || 1), type || 'major', day, timeStart, timeEnd, room]
    );
    res.json({ success: true, message: 'Institutional subject offering created.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Institutional curriculum creation error.' });
  }
});

// 7. Manage Student Grades (Admin Only)
router.post('/set-grade', auth, admin, async (req, res) => {
  try {
    const { userId, courseName, grade, score, status } = req.body;
    await db.query(
      'INSERT INTO grades (user_id, course_name, grade, score, status) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE grade=?, score=?, status=?',
      [userId, courseName, grade, score, status, grade, score, status]
    );
    res.json({ success: true, message: 'Institutional grade record updated.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Scholastic grade entry error.' });
  }
});

// 9. Update Institutional Subject (Admin Only)
router.put('/update-subject/:id', auth, admin, async (req, res) => {
  try {
    const { code, name, units, teacher, type, day, timeStart, timeEnd, room } = req.body;
    await db.query(
      'UPDATE subjects SET code=?, name=?, units=?, teacher=?, type=?, day=?, time_start=?, time_end=?, room=? WHERE id=?',
      [code, name, parseInt(units), teacher, type, day, timeStart, timeEnd, room, req.params.id]
    );
    res.json({ success: true, message: 'Institutional curriculum updated.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Subject update error.' });
  }
});

// 10. Delete Institutional Subject (Admin Only)
router.delete('/delete-subject/:id', auth, admin, async (req, res) => {
  try {
    await db.query('DELETE FROM subjects WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Subject removed from institutional curriculum.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Subject deletion error.' });
  }
});

// 11. Delete Student Account (Admin Only)
router.delete('/delete-student/:id', auth, admin, async (req, res) => {
  try {
    await db.query('DELETE FROM users WHERE id = ? AND role = "student"', [req.params.id]);
    res.json({ success: true, message: 'Student admissions record purged.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Account deletion error.' });
  }
});

// 12. Room Availability – 30-minute slots (Admin only)
router.get('/room-availability', auth, admin, async (req, res) => {
  try {
    const { room, day } = req.query;
    if (!room || !day) return res.status(400).json({ success: false, message: 'Room and day are required.' });

    const subjects = await db.query(
      'SELECT id, code, name, time_start as timeStart, time_end as timeEnd FROM subjects WHERE room = ? AND day = ?',
      [room, day]
    );

    // Helper: parse "08:00 AM" => minutes since midnight
    const parseTime = (str) => {
      if (!str) return 0;
      const [time, modifier] = str.split(' ');
      let [h, m] = time.split(':').map(Number);
      if (modifier === 'PM' && h !== 12) h += 12;
      if (modifier === 'AM' && h === 12) h = 0;
      return h * 60 + m;
    };

    // Build 30-min slots from 07:00 AM to 08:00 PM
    const slots = [];
    for (let mins = 7 * 60; mins < 20 * 60; mins += 30) {
      const h24 = Math.floor(mins / 60);
      const m = mins % 60;
      const ampm = h24 >= 12 ? 'PM' : 'AM';
      const h12 = h24 > 12 ? h24 - 12 : h24 === 0 ? 12 : h24;
      const label = `${h12.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${ampm}`;

      // Check if any subject occupies this slot
      let occupiedBy = null;
      for (const s of subjects) {
        const start = parseTime(s.timeStart);
        const end = parseTime(s.timeEnd);
        if (mins >= start && mins < end) {
          occupiedBy = { id: s.id, code: s.code, name: s.name };
          break;
        }
      }
      slots.push({ time: label, minutes: mins, occupied: !!occupiedBy, subject: occupiedBy });
    }

    res.json({ success: true, slots, room, day });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Room availability fetch error.' });
  }
});

// 13. Institutional Task Management – Single Dispatch
router.post('/assign-task', auth, admin, async (req, res) => {
  try {
    const { userId, title, courseCode, dueDate, priority } = req.body;
    await db.query(
      'INSERT INTO assignments (user_id, title, course_code, due_date, status, priority) VALUES (?, ?, ?, ?, "pending", ?)',
      [userId, title, courseCode, dueDate, priority]
    );
    res.json({ success: true, message: 'Institutional mission dispatched to student.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Single mission dispatch error.' });
  }
});

// 14. Institutional Task Management – Curricular-Wide Batch Dispatch
router.post('/assign-task-course', auth, admin, async (req, res) => {
  try {
    const { subjectId, title, dueDate, priority } = req.body;

    // 1. Fetch subject details for course_code
    const subject = await db.query('SELECT code FROM subjects WHERE id = ?', [subjectId]);
    if (subject.length === 0) return res.status(404).json({ success: false, message: 'Subject not identified.' });
    const courseCode = subject[0].code;

    // 2. Fetch all students enrolled in this subject
    const enrollees = await db.query('SELECT user_id FROM student_subjects WHERE subject_id = ?', [subjectId]);

    if (enrollees.length === 0) {
      return res.json({ success: true, message: 'No enrollees found in this subject specification. Dispatch cancelled.' });
    }

    // 3. Dispatch missions in a batch (loop for simplicity, or multi-insert)
    const values = enrollees.map(e => [e.user_id, title, courseCode, dueDate, 'pending', priority]);
    await db.query(
      'INSERT INTO assignments (user_id, title, course_code, due_date, status, priority) VALUES ?',
      [values]
    );

    res.json({ success: true, message: `Mission synchronized successfully across ${enrollees.length} student identities.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Curricular batch dispatch error.' });
  }
});

// 15. Fetch All Educational Missions (Admin Auditor)
router.get('/all-tasks', auth, admin, async (req, res) => {
  try {
    const tasks = await db.query(`
      SELECT a.*, u.name as student_name, u.student_id as student_id
      FROM assignments a
      JOIN users u ON a.user_id = u.id
      ORDER BY a.id DESC
    `);
    res.json({ success: true, tasks });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Institutional mission audit error.' });
  }
});

module.exports = router;
