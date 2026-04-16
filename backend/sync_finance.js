const mysql = require('mysql2/promise');
require('dotenv').config();

async function syncBalances() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASS || '',
        database: 'chcc_portal'
    });

    try {
        console.log('🔄 Starting institutional financial synchronization...');

        // 1. Fetch all students
        const [students] = await connection.query('SELECT id, name FROM users WHERE role = "student"');

        for (const student of students) {
            console.log(`Processing ${student.name}...`);

            // 2. Fetch enrolled subjects and their types
            const [subjects] = await connection.query(`
        SELECT s.type 
        FROM subjects s
        JOIN student_subjects ss ON s.id = ss.subject_id
        WHERE ss.user_id = ?
      `, [student.id]);

            // 3. Calculate total billing
            let calculatedBalance = 7500.00; // Registration + Institutional Fee

            subjects.forEach(s => {
                calculatedBalance += (s.type === 'major' ? 2500 : 2000);
            });

            // 4. Subtract total payments made
            const [payments] = await connection.query('SELECT SUM(amount) as totalPaid FROM payments WHERE user_id = ?', [student.id]);
            const totalPaid = parseFloat(payments[0].totalPaid || 0);

            const finalBalance = calculatedBalance - totalPaid;

            // 5. Update financials table
            const [existing] = await connection.query('SELECT id FROM financials WHERE user_id = ?', [student.id]);
            if (existing.length > 0) {
                await connection.query('UPDATE financials SET total_balance = ? WHERE user_id = ?', [finalBalance, student.id]);
            } else {
                await connection.query('INSERT INTO financials (user_id, total_balance) VALUES (?, ?)', [student.id, finalBalance]);
            }

            console.log(`✅ ${student.name}: Billing ₱${calculatedBalance} - Paid ₱${totalPaid} = Balance ₱${finalBalance}`);
        }

        console.log('\n💎 Institutional financial synchronization complete!');
        process.exit(0);
    } catch (err) {
        console.error('Synchronization Error:', err);
        process.exit(1);
    }
}

syncBalances();
