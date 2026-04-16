/**
 * Seed 30 New Subjects (15 Minor + 15 Major)
 * ─────────────────────────────────────────────
 * All schedules are non-conflicting per room/day/time.
 * Major subjects are distributed across all 5 programs.
 * 
 * Programs:
 *   1  = BS in Accountancy (BSA)
 *   5  = BS in Criminology (BSCrim)
 *   7  = BS in Nursing (BSN)
 *   8  = Bachelor of Elementary Education (BEEd)
 *   13 = BS in Computer Science (BSCS)
 */

require('dotenv').config();
const db = require('./src/data/db');

async function seed() {
    console.log('\n🌱 Seeding 30 new subjects...\n');

    // ──────────────────────────────────────────────
    // 15 MINOR / General Education Subjects
    // ──────────────────────────────────────────────
    const minorSubjects = [
        // Existing: GEC101 Mon 08-10 Room101, GEC102 Tue 10-12 Room102, GEC103 Wed 1-3 Room103, PE101 Thu 3-5 Gym
        { code: 'GEC104', name: 'Mathematics in the Modern World', units: 3, teacher: 'Dr. R. Villanueva', day: 'Monday', timeStart: '10:30 AM', timeEnd: '12:00 PM', room: 'Room 103' },
        { code: 'GEC105', name: 'Art Appreciation', units: 3, teacher: 'Prof. C. Dimaculangan', day: 'Tuesday', timeStart: '08:00 AM', timeEnd: '09:30 AM', room: 'Room 101' },
        { code: 'GEC106', name: 'Science, Technology and Society', units: 3, teacher: 'Dr. M. Aquino', day: 'Wednesday', timeStart: '08:00 AM', timeEnd: '09:30 AM', room: 'Room 101' },
        { code: 'GEC107', name: 'Ethics', units: 3, teacher: 'Fr. B. Pascual', day: 'Thursday', timeStart: '08:00 AM', timeEnd: '09:30 AM', room: 'Room 102' },
        { code: 'GEC108', name: 'Readings in Philippine History', units: 3, teacher: 'Prof. D. Bautista', day: 'Friday', timeStart: '10:00 AM', timeEnd: '11:30 AM', room: 'Room 101' },
        { code: 'GEC109', name: 'The Life and Works of Rizal', units: 3, teacher: 'Dr. E. Garcia', day: 'Monday', timeStart: '01:00 PM', timeEnd: '02:30 PM', room: 'Room 102' },
        { code: 'GEC110', name: 'Filipino (Komunikasyon sa Akademikong Filipino)', units: 3, teacher: 'Ms. F. Mendoza', day: 'Tuesday', timeStart: '01:00 PM', timeEnd: '02:30 PM', room: 'Room 101' },
        { code: 'GEC111', name: 'Literature (World & Philippine)', units: 3, teacher: 'Prof. G. Hernandez', day: 'Wednesday', timeStart: '10:00 AM', timeEnd: '11:30 AM', room: 'Room 102' },
        { code: 'PE102', name: 'Physical Education 2 (Rhythmic Activities)', units: 2, teacher: 'Coach K. Santos', day: 'Friday', timeStart: '03:00 PM', timeEnd: '05:00 PM', room: 'Gym' },
        { code: 'PE103', name: 'Physical Education 3 (Team Sports)', units: 2, teacher: 'Coach L. Rivera', day: 'Monday', timeStart: '03:00 PM', timeEnd: '05:00 PM', room: 'Gym' },
        { code: 'PE104', name: 'Physical Education 4 (Recreation)', units: 2, teacher: 'Coach K. Santos', day: 'Wednesday', timeStart: '03:00 PM', timeEnd: '05:00 PM', room: 'Gym' },
        { code: 'NSTP1', name: 'National Service Training Program 1', units: 3, teacher: 'Sir T. Navarro', day: 'Saturday', timeStart: '08:00 AM', timeEnd: '11:00 AM', room: 'Room 201' },
        { code: 'NSTP2', name: 'National Service Training Program 2', units: 3, teacher: 'Sir T. Navarro', day: 'Saturday', timeStart: '01:00 PM', timeEnd: '04:00 PM', room: 'Room 201' },
        { code: 'GEC112', name: 'Understanding Culture, Society & Politics', units: 3, teacher: 'Dr. H. Lorenzo', day: 'Thursday', timeStart: '10:00 AM', timeEnd: '11:30 AM', room: 'Room 101' },
        { code: 'GEC113', name: 'People and the Earth\'s Ecosystem', units: 3, teacher: 'Dr. I. Salazar', day: 'Friday', timeStart: '01:00 PM', timeEnd: '02:30 PM', room: 'Room 102' },
    ];

    // ──────────────────────────────────────────────
    // 15 MAJOR Subjects (3 per program)
    // ──────────────────────────────────────────────
    const majorSubjects = [
        // --- BSCS (program_id = 13) ---
        { programId: 13, yearLevel: 1, semester: 2, code: 'CS113', name: 'Computer Programming 2', units: 3, teacher: 'Ms. A. Reyes', day: 'Monday', timeStart: '08:00 AM', timeEnd: '11:00 AM', room: 'Lab 2' },
        { programId: 13, yearLevel: 1, semester: 2, code: 'CS114', name: 'Discrete Mathematics', units: 3, teacher: 'Dr. N. Tan', day: 'Tuesday', timeStart: '08:00 AM', timeEnd: '09:30 AM', room: 'Lab 1' },
        { programId: 13, yearLevel: 2, semester: 1, code: 'CS211', name: 'Data Structures and Algorithms', units: 3, teacher: 'Engr. J. Santos', day: 'Wednesday', timeStart: '10:00 AM', timeEnd: '12:00 PM', room: 'Lab 1' },

        // --- BSA (program_id = 1) ---
        { programId: 1, yearLevel: 1, semester: 2, code: 'ACC112', name: 'Financial Accounting 2', units: 3, teacher: 'Prof. M. Cruz', day: 'Monday', timeStart: '01:00 PM', timeEnd: '04:00 PM', room: 'Room 201' },
        { programId: 1, yearLevel: 1, semester: 1, code: 'ACC113', name: 'Business Law and Ethics', units: 3, teacher: 'Atty. V. Reyes', day: 'Tuesday', timeStart: '10:00 AM', timeEnd: '11:30 AM', room: 'Room 201' },
        { programId: 1, yearLevel: 2, semester: 1, code: 'ACC211', name: 'Cost Accounting', units: 3, teacher: 'Prof. W. Lim', day: 'Thursday', timeStart: '01:00 PM', timeEnd: '04:00 PM', room: 'Room 201' },

        // --- BSCrim (program_id = 5) ---
        { programId: 5, yearLevel: 1, semester: 2, code: 'CRI103', name: 'Criminal Law 2', units: 3, teacher: 'Atty. P. Salvador', day: 'Monday', timeStart: '08:00 AM', timeEnd: '11:00 AM', room: 'Room 301' },
        { programId: 5, yearLevel: 1, semester: 2, code: 'CRI104', name: 'Law Enforcement Administration', units: 3, teacher: 'Lt. Col. F. Gomez', day: 'Wednesday', timeStart: '09:00 AM', timeEnd: '12:00 PM', room: 'Room 301' },
        { programId: 5, yearLevel: 2, semester: 1, code: 'CRI201', name: 'Criminalistics 1 (Forensics)', units: 3, teacher: 'Dr. Q. Espiritu', day: 'Friday', timeStart: '08:00 AM', timeEnd: '11:00 AM', room: 'Room 302' },

        // --- BSN (program_id = 7) ---
        { programId: 7, yearLevel: 1, semester: 2, code: 'NUR102', name: 'Fundamentals of Nursing', units: 5, teacher: 'Prof. U. Santos', day: 'Monday', timeStart: '01:00 PM', timeEnd: '04:00 PM', room: 'Lab 3' },
        { programId: 7, yearLevel: 1, semester: 1, code: 'NUR103', name: 'Biochemistry', units: 3, teacher: 'Dr. S. Castro', day: 'Thursday', timeStart: '08:00 AM', timeEnd: '11:00 AM', room: 'Lab 3' },
        { programId: 7, yearLevel: 2, semester: 1, code: 'NUR201', name: 'Pharmacology', units: 3, teacher: 'Dr. X. Pineda', day: 'Wednesday', timeStart: '01:00 PM', timeEnd: '04:00 PM', room: 'Lab 3' },

        // --- BEEd (program_id = 8) ---
        { programId: 8, yearLevel: 1, semester: 1, code: 'EDU101', name: 'The Child and Adolescent Learner', units: 3, teacher: 'Dr. Y. Castillo', day: 'Tuesday', timeStart: '03:00 PM', timeEnd: '04:30 PM', room: 'Room 202' },
        { programId: 8, yearLevel: 1, semester: 2, code: 'EDU102', name: 'Facilitating Learner-Centered Teaching', units: 3, teacher: 'Prof. Z. Aguilar', day: 'Thursday', timeStart: '01:00 PM', timeEnd: '02:30 PM', room: 'Room 202' },
        { programId: 8, yearLevel: 2, semester: 1, code: 'EDU201', name: 'Assessment of Learning 1', units: 3, teacher: 'Dr. Y. Castillo', day: 'Friday', timeStart: '08:00 AM', timeEnd: '09:30 AM', room: 'Room 202' },
    ];

    let minorCount = 0;
    let majorCount = 0;

    // Insert Minor subjects
    for (const s of minorSubjects) {
        try {
            await db.query(
                `INSERT IGNORE INTO subjects (code, name, units, teacher, type, day, time_start, time_end, room) 
         VALUES (?, ?, ?, ?, 'minor', ?, ?, ?, ?)`,
                [s.code, s.name, s.units, s.teacher, s.day, s.timeStart, s.timeEnd, s.room]
            );
            minorCount++;
            console.log(`  ✅ MINOR: ${s.code} — ${s.name}  (${s.day} ${s.timeStart}–${s.timeEnd}, ${s.room})`);
        } catch (err) {
            console.log(`  ⚠️  SKIP: ${s.code} — ${err.message}`);
        }
    }

    // Insert Major subjects
    for (const s of majorSubjects) {
        try {
            await db.query(
                `INSERT IGNORE INTO subjects (program_id, year_level, semester, code, name, units, teacher, type, day, time_start, time_end, room) 
         VALUES (?, ?, ?, ?, ?, ?, ?, 'major', ?, ?, ?, ?)`,
                [s.programId, s.yearLevel, s.semester, s.code, s.name, s.units, s.teacher, s.day, s.timeStart, s.timeEnd, s.room]
            );
            majorCount++;
            console.log(`  ✅ MAJOR: ${s.code} — ${s.name}  [Program ${s.programId}, Y${s.yearLevel}S${s.semester}]  (${s.day} ${s.timeStart}–${s.timeEnd}, ${s.room})`);
        } catch (err) {
            console.log(`  ⚠️  SKIP: ${s.code} — ${err.message}`);
        }
    }

    console.log(`\n🎓 Seed Complete: ${minorCount} minor + ${majorCount} major = ${minorCount + majorCount} subjects added.`);
    console.log('📊 Total subjects in database:');

    const total = await db.query('SELECT COUNT(*) as count FROM subjects');
    const majors = await db.query("SELECT COUNT(*) as count FROM subjects WHERE type='major'");
    const minors = await db.query("SELECT COUNT(*) as count FROM subjects WHERE type='minor'");
    console.log(`   Total: ${total[0].count}  |  Major: ${majors[0].count}  |  Minor: ${minors[0].count}\n`);

    process.exit(0);
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
