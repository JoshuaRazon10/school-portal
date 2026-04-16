-- CHCC Portal Database Schema (Finalized Categories)
-- Database is selected dynamically by init_db.js

-- 1. Institutional Programs
CREATE TABLE IF NOT EXISTS programs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL UNIQUE, 
  school VARCHAR(100)
);

INSERT IGNORE INTO programs (id, name, school) VALUES 
(1, 'BS in Accountancy', 'School of Business and Accountancy'),
(5, 'BS in Criminology', 'School of Criminal Justice Education'),
(7, 'BS in Nursing', 'School of Nursing'),
(8, 'Bachelor of Elementary Education (BEEd)', 'School of Education'),
(13, 'BS in Computer Science', 'School of Computer Studies');

-- 2. Students & Admins (RBAC Support)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  course VARCHAR(150),
  year_level INT DEFAULT 1,
  semester INT DEFAULT 1,
  avatar VARCHAR(10),
  gpa DECIMAL(3, 2) DEFAULT 0.00,
  phone VARCHAR(20),
  address TEXT,
  dob DATE,
  photo_url VARCHAR(255),
  role ENUM('student', 'admin') DEFAULT 'student',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed Verified Credentials (Password: password123)
INSERT IGNORE INTO users (id, student_id, name, email, password, role, avatar) VALUES 
(999, 'ADMIN-CHCC', 'Institutional Admin', 'admin@chcc.edu.ph', '$2b$10$EpA8Eez.y.08s6mEetXQY.UeTfE6A1W.fOQhS/d8kI.qgUfE/Q2Y6', 'admin', 'IA');
INSERT IGNORE INTO users (id, student_id, name, email, password, role, avatar, course) VALUES 
(1, 'CHCC-2025-0001', 'Alex Johnson', 'alex.johnson@chcc.edu.ph', '$2b$10$EpA8Eez.y.08s6mEetXQY.UeTfE6A1W.fOQhS/d8kI.qgUfE/Q2Y6', 'student', 'AJ', 'BS in Computer Science');

-- 3. Institutional Curriculum (With Major/Minor Tracking)
CREATE TABLE IF NOT EXISTS subjects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  program_id INT, -- NULL for general/minor subjects
  year_level INT DEFAULT 1,
  semester INT DEFAULT 1,
  code VARCHAR(20) NOT NULL,
  name VARCHAR(150) NOT NULL,
  units INT DEFAULT 3,
  teacher VARCHAR(100),
  type ENUM('major', 'minor') DEFAULT 'major',
  day VARCHAR(20),
  time_start VARCHAR(20),
  time_end VARCHAR(20),
  room VARCHAR(50),
  UNIQUE (code) 
);

-- Seed General Education (Minor) Subjects (Program ID NULL means shared)
INSERT IGNORE INTO subjects (id, code, name, units, teacher, type, day, time_start, time_end, room) VALUES
(100, 'GEC101', 'Understanding the Self', 3, 'Dr. P. Ramos', 'minor', 'Monday', '08:00 AM', '10:00 AM', 'Room 101'),
(101, 'GEC102', 'Purposive Communication', 3, 'Ms. L. Reyes', 'minor', 'Tuesday', '10:00 AM', '12:00 PM', 'Room 102'),
(102, 'GEC103', 'The Contemporary World', 3, 'Mr. J. Cruz', 'minor', 'Wednesday', '01:00 PM', '03:00 PM', 'Room 103'),
(103, 'PE101', 'Physical Education 1', 2, 'Coach K. Santos', 'minor', 'Thursday', '03:00 PM', '05:00 PM', 'Gym');

-- Seed Major Subjects
INSERT IGNORE INTO subjects (id, program_id, year_level, semester, code, name, units, teacher, type, day, time_start, time_end, room) VALUES
-- BSCS (ID 13)
(1, 13, 1, 1, 'CS111', 'Intro to Computing', 3, 'Engr. J. Santos', 'major', 'Monday', '10:00 AM', '12:00 PM', 'Lab 1'),
(2, 13, 1, 1, 'CS112', 'Computer Programming 1', 3, 'Ms. A. Reyes', 'major', 'Wednesday', '08:00 AM', '11:00 AM', 'Lab 2'),
-- BSA (ID 1)
(10, 1, 1, 1, 'ACC111', 'Financial Accounting 1', 3, 'Prof. M. Cruz', 'major', 'Friday', '08:00 AM', '11:00 AM', 'Room 201'),
-- BSN (ID 7)
(20, 7, 1, 1, 'NUR101', 'Anatomy and Physiology', 5, 'Dr. S. Castro', 'major', 'Tuesday', '01:00 PM', '04:00 PM', 'Lab 3'),
-- BSCrim (ID 5)
(30, 5, 1, 1, 'CRI101', 'Intro to Criminology', 3, 'Lt. Col. F. Gomez', 'major', 'Thursday', '09:00 AM', '12:00 PM', 'Room 301'),
(31, 5, 1, 1, 'CRI102', 'Criminal Law 1', 3, 'Atty. P. Salvador', 'major', 'Friday', '01:00 PM', '04:00 PM', 'Room 302');

-- 4. Dynamic Enrollment
CREATE TABLE IF NOT EXISTS student_subjects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  subject_id INT,
  status ENUM('enrolled', 'completed', 'dropped') DEFAULT 'enrolled',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
  UNIQUE(user_id, subject_id)
);

-- Enroll Alex (BSCS) in Major and Minor
INSERT IGNORE INTO student_subjects (user_id, subject_id) VALUES (1, 1), (1, 2), (1, 100), (1, 101);

-- Rest of the tables continue...
CREATE TABLE IF NOT EXISTS announcements (id INT AUTO_INCREMENT PRIMARY KEY, title VARCHAR(150), content TEXT, category VARCHAR(50), important BOOLEAN, author VARCHAR(100), date VARCHAR(50));
CREATE TABLE IF NOT EXISTS assignments (id INT AUTO_INCREMENT PRIMARY KEY, user_id INT, course_code VARCHAR(20), title VARCHAR(150), due_date VARCHAR(50), status ENUM('pending', 'in-progress', 'submitted', 'graded'), priority ENUM('low', 'medium', 'high', 'urgent'), FOREIGN KEY (user_id) REFERENCES users(id));
CREATE TABLE IF NOT EXISTS grades (id INT AUTO_INCREMENT PRIMARY KEY, user_id INT, course_name VARCHAR(150), semester VARCHAR(100), grade VARCHAR(5), score INT, status VARCHAR(50), FOREIGN KEY (user_id) REFERENCES users(id));
CREATE TABLE IF NOT EXISTS schedules (id INT AUTO_INCREMENT PRIMARY KEY, day VARCHAR(20), time_start VARCHAR(20), time_end VARCHAR(20), subject VARCHAR(150), room VARCHAR(50), teacher VARCHAR(100), course VARCHAR(150), semester INT);
CREATE TABLE IF NOT EXISTS attendance (id INT AUTO_INCREMENT PRIMARY KEY, user_id INT, subject_id INT, date DATE, status ENUM('Present', 'Absent', 'Late', 'Excused'), remarks TEXT, FOREIGN KEY (user_id) REFERENCES users(id), FOREIGN KEY (subject_id) REFERENCES subjects(id));

-- 5. Financial Portfolio Management
CREATE TABLE IF NOT EXISTS financials (id INT AUTO_INCREMENT PRIMARY KEY, user_id INT, total_balance DECIMAL(10, 2) DEFAULT 0.00, scholarship_type VARCHAR(50) DEFAULT 'NONE', FOREIGN KEY (user_id) REFERENCES users(id));
CREATE TABLE IF NOT EXISTS payments (id INT AUTO_INCREMENT PRIMARY KEY, user_id INT, amount DECIMAL(10, 2), payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP, method VARCHAR(50), reference_no VARCHAR(100), FOREIGN KEY (user_id) REFERENCES users(id));

-- 6. Scholastic Evaluation Architecture
CREATE TABLE IF NOT EXISTS evaluations (id INT AUTO_INCREMENT PRIMARY KEY, student_id INT, subject_id INT, rating INT, feedback TEXT, date TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (student_id) REFERENCES users(id), FOREIGN KEY (subject_id) REFERENCES subjects(id));

-- 7. Institutional Messaging & Alerts
CREATE TABLE IF NOT EXISTS messages (id INT AUTO_INCREMENT PRIMARY KEY, sender_id INT, receiver_id INT, subject VARCHAR(150), content TEXT, is_read BOOLEAN DEFAULT FALSE, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (sender_id) REFERENCES users(id), FOREIGN KEY (receiver_id) REFERENCES users(id));
CREATE TABLE IF NOT EXISTS alerts (id INT AUTO_INCREMENT PRIMARY KEY, title VARCHAR(150), urgency ENUM('info', 'warning', 'emergency'), active BOOLEAN DEFAULT TRUE, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);

-- 8. University Event Management
CREATE TABLE IF NOT EXISTS events (id INT AUTO_INCREMENT PRIMARY KEY, title VARCHAR(150), location VARCHAR(150), event_date DATE, description TEXT, organizer VARCHAR(100));

-- 9. Library & Resource Catalog
CREATE TABLE IF NOT EXISTS resources (id INT AUTO_INCREMENT PRIMARY KEY, title VARCHAR(255), author VARCHAR(150), isbn VARCHAR(50), category VARCHAR(50), availability BOOLEAN DEFAULT TRUE);
