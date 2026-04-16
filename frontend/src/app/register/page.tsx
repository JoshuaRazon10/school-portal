'use client';
import Link from 'next/link';
import Image from 'next/image';
import styles from '../login/login.module.css';

export default function Register() {
  return (
    <div className={styles.page}>
      <div className={styles.blob1} />
      <div className={styles.container} style={{ maxWidth: 500 }}>
        <div className={styles.card} style={{ textAlign: 'center', padding: '60px 40px' }}>
          <div className={styles.header}>
             <div className={styles.logoCircle}>
                <Image 
                  src="/images/chcc.jpg" 
                  alt="CHCC Logo" 
                  width={100} 
                  height={100} 
                  className={styles.logoImg}
                />
             </div>
             <h1 className={styles.title} style={{ marginTop: 24 }}>Public Enrollment Closed</h1>
             <p className={styles.subtitle}>Admission for A.Y. 2025-2026 is currently handled by the institutional registrar office only.</p>
          </div>

          <div className="divider" style={{ margin: '32px 0' }} />

          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 32, lineHeight: 1.6 }}>
            New student credentials must be provided by your academic counselor. Please visit the registrar for your institutional login.
          </p>

          <Link href="/login" className="btn btn-primary btn-full">
             Go to Portal Login
          </Link>
        </div>
      </div>
    </div>
  );
}
