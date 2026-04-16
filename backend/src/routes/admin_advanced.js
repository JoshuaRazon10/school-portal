const express = require('express');
const router = express.Router();
const db = require('../data/db');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// ============================================================
// --- FINANCIAL MANAGEMENT MODULE ---
// ============================================================

// Helper: ensure a financial record exists for a given user
async function ensureFinancialRecord(userId) {
  const existing = await db.query('SELECT * FROM financials WHERE user_id = ?', [userId]);
  if (existing.length === 0) {
    await db.query('INSERT INTO financials (user_id, total_balance) VALUES (?, 0.00)', [userId]);
  }
}

// --- 1. List ALL students with their balances (Admin) ---
router.get('/finance/students', auth, admin, async (req, res) => {
  try {
    const students = await db.query(`
      SELECT u.id, u.student_id as studentId, u.name, u.email, u.course, u.year_level as yearLevel,
             COALESCE(f.total_balance, 0) as balance,
             COALESCE(f.scholarship_type, 'NONE') as scholarship
      FROM users u
      LEFT JOIN financials f ON u.id = f.user_id
      WHERE u.role = 'student'
      ORDER BY u.name ASC
    `);
    res.json({ success: true, students });
  } catch (err) {
    console.error('Finance list error:', err);
    res.status(500).json({ success: false, message: 'Failed to load student financial records.' });
  }
});

// --- 2. Get a single student's full financial profile (Admin) ---
router.get('/financials/:userId', auth, admin, async (req, res) => {
  try {
    await ensureFinancialRecord(req.params.userId);
    const data = await db.query('SELECT * FROM financials WHERE user_id = ?', [req.params.userId]);
    const tx = await db.query('SELECT * FROM payments WHERE user_id = ? ORDER BY payment_date DESC', [req.params.userId]);
    res.json({ success: true, balance: data[0] || { total_balance: 0 }, transactions: tx });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Portfolio fetch error.' });
  }
});

// --- 3. Set / Update a student's total balance (Admin) ---
router.post('/finance/set-balance', auth, admin, async (req, res) => {
  try {
    const { userId, balance } = req.body;
    await ensureFinancialRecord(userId);
    await db.query('UPDATE financials SET total_balance = ? WHERE user_id = ?', [balance, userId]);
    res.json({ success: true, message: 'Balance updated.' });
  } catch (err) {
    console.error('Set balance error:', err);
    res.status(500).json({ success: false, message: 'Failed to set balance.' });
  }
});

// --- 4. Record a payment and auto-deduct from balance (Admin) ---
router.post('/record-payment', auth, admin, async (req, res) => {
  try {
    const { userId, amount, method, ref, description } = req.body;
    await ensureFinancialRecord(userId);
    await db.query(
      'INSERT INTO payments (user_id, amount, method, reference_no) VALUES (?, ?, ?, ?)',
      [userId, amount, method || 'Cash', ref || `PAY-${Date.now()}`]
    );
    await db.query('UPDATE financials SET total_balance = total_balance - ? WHERE user_id = ?', [amount, userId]);
    // Fetch updated balance
    const updated = await db.query('SELECT total_balance FROM financials WHERE user_id = ?', [userId]);
    res.json({
      success: true,
      message: 'Payment recorded and balance deducted.',
      newBalance: updated[0]?.total_balance || 0
    });
  } catch (err) {
    console.error('Payment error:', err);
    res.status(500).json({ success: false, message: 'Financial entry error.' });
  }
});

// --- 5. Student-facing: View OWN balance and payment history ---
router.get('/my-finance', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    await ensureFinancialRecord(userId);
    const data = await db.query('SELECT * FROM financials WHERE user_id = ?', [userId]);
    const tx = await db.query('SELECT * FROM payments WHERE user_id = ? ORDER BY payment_date DESC', [userId]);
    res.json({
      success: true,
      balance: data[0]?.total_balance || 0,
      scholarship: data[0]?.scholarship_type || 'NONE',
      transactions: tx
    });
  } catch (err) {
    console.error('My finance error:', err);
    res.status(500).json({ success: false, message: 'Failed to load financial data.' });
  }
});

// ============================================================
// --- SCHOLASTIC EVALUATION MODULE ---
// ============================================================

router.get('/evaluations', auth, admin, async (req, res) => {
  try {
    const evals = await db.query(`
      SELECT e.*, u.name as studentName, s.name as subjectName 
      FROM evaluations e
      JOIN users u ON e.student_id = u.id
      JOIN subjects s ON e.subject_id = s.id
      ORDER BY e.date DESC
    `);
    res.json({ success: true, evaluations: evals });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Institutional evaluation fetch error.' });
  }
});

module.exports = router;
