'use client';
import { useAuth } from '@/context/AuthContext';
import styles from './Topbar.module.css';

interface TopbarProps {
  title: string;
  subtitle?: string;
}

export default function Topbar({ title, subtitle }: TopbarProps) {
  const { user } = useAuth();
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <header className={styles.topbar}>
      <div className={styles.left}>
        <h1 className={styles.title}>{title}</h1>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
      <div className={styles.right}>
        <div className={styles.datePill}>
          <span>📅</span>
          {dateStr}
        </div>
        <div className={styles.userPill}>
          <div className={styles.pillAvatar}>
             {user?.photo_url ? (
               <img src={user.photo_url} alt="Profile" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
             ) : (
               user?.avatar
             )}
          </div>
          <span className={styles.pillName}>{user?.name?.split(' ')[0]}</span>
        </div>
      </div>
    </header>
  );
}
