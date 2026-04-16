'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';
import Link from 'next/link';
import styles from './login.module.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) router.replace('/dashboard');
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(email, password);
    if (result.success) {
      router.replace('/dashboard');
    } else {
      setError(result.message ?? 'Login failed');
    }
    setLoading(false);
  };

  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className={styles.page}>
      {/* Decorative Blobs */}
      <div className={styles.blob1} />
      <div className={styles.blob2} />

      <div className={styles.container}>
        <div className={styles.card}>
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
            <h1 className={styles.title}>Student Portal Access</h1>
            <p className={styles.subtitle}>Concepcion Holy Cross College Inc.</p>
          </div>

          <div className={styles.divider} />

          {error && <div className={styles.errorAlert}>⚠️ {error}</div>}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Portal Email</label>
              <input
                id="email"
                type="email"
                className="form-input"
                placeholder="juan.delacruz@chcc.edu.ph"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">Security Code</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  style={{ paddingRight: 45 }}
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, opacity: 0.7
                  }}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? 'Validating...' : 'Log In to Dashboard'}
            </button>
          </form>

          <div className={styles.footer}>
            <p>New Student?</p>
            <Link href="/register" className={styles.registerLink}>Submit Enrollment Application</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
