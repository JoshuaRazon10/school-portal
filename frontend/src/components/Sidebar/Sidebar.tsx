'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import styles from './Sidebar.module.css';

const studentNav = [
  { href: '/dashboard', label: 'My Dashboard', icon: '🏠' },
  { href: '/courses', label: 'Academic Subjects', icon: '📚' },
  { href: '/grades', label: 'Grade Records', icon: '📈' },
  { href: '/assignments', label: 'Task Management', icon: '📋' },
  { href: '/schedule', label: 'Weekly Timetable', icon: '⏱️' },
  { href: '/finance', label: 'Financial Portal', icon: '💰' },
  { href: '/announcements', label: 'Institutional News', icon: '📢' },
  { href: '/profile', label: 'Account Profile', icon: '👤' },
];

const adminNav = [
  { href: '/admin/students', label: 'Student Admissions', icon: '🎓' },
  { href: '/admin/student-registry', label: 'Student Registry', icon: '📁' },
  { href: '/admin/subjects', label: 'Curriculum Master', icon: '📅' },
  { href: '/admin/subject-registry', label: 'Subject Registry', icon: '📋' },
  { href: '/admin/tasks', label: 'Task Management', icon: '🚀' },
  { href: '/admin/rankings', label: 'Scholastic Rankings', icon: '🏆' },
  { href: '/admin/finance', label: 'Financial Management', icon: '🏦' },
  { href: '/admin/rooms', label: 'Room Management', icon: '🏨' },
  { href: '/admin/notices', label: 'Public Notices', icon: '📢' },
  { href: '/profile', label: 'Admin Account', icon: '👤' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={styles.mobileToggle}
      >
        ☰
      </button>

      <div
        className={`sidebar-overlay ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(false)}
      />

      <aside className={`${styles.sidebar} ${isOpen ? 'sidebar-open' : ''}`}>
        <button
          onClick={() => setIsOpen(false)}
          className={styles.closeBtn}
        >
          ✕
        </button>

        <div className={styles.header}>
          <div className={styles.logoWrapper}>
            <Image
              src="/images/chcc.jpg"
              alt="CHCC Logo"
              width={85}
              height={85}
              className={styles.logoImage}
              priority
            />
          </div>
          <div className={styles.branding}>
            <div className={styles.schoolName}>Concepcion Holy Cross College Inc.</div>
            <div className={styles.tagline}>In Hoc Signo Vinces</div>
          </div>
        </div>

        <div className={styles.divider} />

        <nav className={styles.nav}>
          {(user?.role === 'admin' ? adminNav : studentNav).map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                onClick={() => setIsOpen(false)}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                <span className={styles.navText}>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className={styles.bottom}>
          <div className={styles.studentCard}>
            <div className={styles.studentAvatar}>
              {user?.photo_url ? (
                <img src={user.photo_url} alt="Profile" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                user?.avatar
              )}
            </div>
            <div className={styles.studentInfo}>
              <div className={styles.studentName}>{user?.name}</div>
              <div className={styles.studentMeta}>
                {user?.role === 'admin' ? 'Strategic Oversight' : `ID: ${user?.studentId}`}
              </div>
            </div>
          </div>
          <button className={styles.logoutBtn} onClick={logout}>
            <span>👋</span> Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
