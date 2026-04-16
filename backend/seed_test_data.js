/**
 * Seed 20 Students with Course-Specific Subjects and Financial Records
 * ────────────────────────────────────────────────────────────────
 * This script populates the database with realistic testing data.
 */

require('dotenv').config();
const db = require('./src/data/db');
const bcrypt = require('bcryptjs');

const firstNames = ['James', 'Mary', 'Robert', 'Patricia', 'John', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen'];
const lastNames = ['Santos', 'Reyes', 'Cruz', 'Bautista', 'Ocampo', 'Garcia', 'Mendoza', 'Pascual', 'Aquino', 'Dela Cruz', 'Lopez', 'Villanueva', 'Sarmiento', 'Castillo', 'Bernardo', 'Torres', 'Mercado', 'Ramos', 'Gonzales', 'Enriquez'];

const programs = [
    { id: 1, name: 'BS in Accountancy' },
    { id: 5, name: 'BS in Criminology' },
    { id: 7, name: 'BS in Nursing' },
    { id: 8, 'name': 'Bachelor of Elementary Education (BEEd)' },
    { id: 13, name: 'BS in Computer Science' }
];

async function seed() {
    console.log('\n🚀 Initializing Institutional Test Data Protocol...\n');

    const hashedPassword = await bcrypt.hash('password123', 10);

    // Get all subjects to categorize them for enrollment
    const allSubjects = await db.query('SELECT * FROM subjects');
    const majorMap = {};
    const minorSubjects = allSubjects.filter(s => s.type === 'minor');

    programs.forEach(p => {
        majorMap[p.id] = allSubjects.filter(s => s.type === 'major' && s.program_id === p.id);
    });

    for (let i = 0; i < 20; i++) {
        const firstName = firstNames[i % firstNames.length];
        const lastName = lastNames[i % lastNames.length];
        const fullName = `${firstName} ${lastName}`;
        const studentId = `CHCC-2025-${(i + 10).toString().padStart(4, '0')}`;
        const email = `${firstName.toLowerCase()}.${lastName.toLowerCase().replace(' ', '')}${i}@chcc.edu.ph`;
        const prog = programs[i % programs.length];
        const yearLevel = Math.floor(Math.random() * 4) + 1;

        try {
            // 1. Create User
            const userResult = await db.query(
                `INSERT INTO users (student_id, name, email, password, course, year_level, role, avatar) 
                 VALUES (?, ?, ?, ?, ?, ?, 'student', ?)`,
                [studentId, fullName, email, hashedPassword, prog.name, yearLevel, firstName[0] + lastName[0]]
            );
            const userId = userResult.insertId;

            // 2. Initialize Financial Record
            const initialBalance = (Math.floor(Math.random() * 15) + 5) * 1000; // 5k to 20k
            await db.query(
                `INSERT INTO financials (user_id, total_balance, scholarship_type) VALUES (?, ?, 'NONE')`,
                [userId, initialBalance]
            );

            // 3. Dynamic Enrollment
            // Pick 2 majors for their program
            const courseMajors = majorMap[prog.id] || [];
            const selectedMajors = courseMajors.sort(() => 0.5 - Math.random()).slice(0, 2);

            // Pick 2 random minors
            const selectedMinors = minorSubjects.sort(() => 0.5 - Math.random()).slice(0, 2);

            const enrollments = [...selectedMajors, ...selectedMinors];
            for (const sub of enrollments) {
                await db.query(
                    `INSERT IGNORE INTO student_subjects (user_id, subject_id, status) VALUES (?, ?, 'enrolled')`,
                    [userId, sub.id]
                );
            }

            console.log(`  ✅ ADMITTED: ${studentId} — ${fullName} [${prog.name}] (${enrollments.length} subjects)`);

        } catch (err) {
            console.log(`  ⚠️  FAILED: ${fullName} — ${err.message}`);
        }
    }

    console.log('\n🎓 Institutional Data Dispatch Complete. 20 Identities Synchronized.\n');
    process.exit(0);
}

seed().catch(err => {
    console.error('Fatal synchronization error:', err);
    process.exit(1);
});
