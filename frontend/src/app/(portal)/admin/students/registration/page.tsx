'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Topbar from '@/components/Topbar/Topbar';
import { api } from '@/lib/api';
import { useToast } from '@/context/ToastContext';

const COURSES = [
  'BS in Accountancy',
  'BS in Accounting Information System',
  'BS in Business Administration (Major in Financial Management)',
  'BS in Business Administration (Major in Marketing Management)',
  'BS in Criminology',
  'BS in Industrial Security Management',
  'BS in Nursing',
  'Bachelor of Elementary Education (BEEd)',
  'Bachelor of Secondary Education (BSEd) Major in English',
  'Bachelor of Secondary Education (BSEd) Major in Mathematics',
  'Bachelor of Secondary Education (BSEd) Major in Filipino',
  'Bachelor of Secondary Education (BSEd) Major in Social Studies',
  'BS in Computer Science',
  'Associate in Computer Technology',
  'BS in Hospitality Management (BSHM)',
];

export default function StudentRegistration() {
  const router = useRouter();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    course: COURSES[0],
    yearLevel: '1',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/admin/register-student', formData);
      if (res.success) {
        showToast(`Identity Synchronized: ${formData.name}`, 'success');
        router.push('/admin/students');
      } else {
        showToast(res.message || 'System protocol rejection.', 'error');
      }
    } catch (err: any) {
      showToast('Institutional node failure.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in" style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: 100 }}>
      <Topbar title="New Admissions Entry" subtitle="Official registration of student members into the institutional portal archives." />

      <main className="page-content" style={{ maxWidth: 1000, margin: '0 auto', padding: '0 40px' }}>
        <button onClick={() => router.push('/admin/students')} style={{ background: 'transparent', border: 'none', color: '#64748b', fontWeight: 800, fontSize: 13, display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: 40 }}>
          <span>←</span> RETURN TO RECORD CENTER
        </button>

        <div className="modern-card" style={{ padding: 60 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 60 }}>
            <div style={{ width: 64, height: 64, borderRadius: 20, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>🏛️</div>
            <div>
              <h2 style={{ fontSize: 26, fontWeight: 950, color: '#1e3a5f', letterSpacing: '-1px' }}>Admissions Specification Form</h2>
              <p style={{ color: '#94a3b8', fontWeight: 700, fontSize: 14 }}>Establish a new academic identity with permanent archival records.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }}>

            <div className="admin-form-group" style={{ gridColumn: 'span 2' }}>
              <label>Full Name (Official Record)</label>
              <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value.toUpperCase() })} placeholder="LASTNAME, FIRSTNAME MI" />
            </div>

            <div className="admin-form-group">
              <label>Institutional Email</label>
              <input type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="identity@institutional.edu.ph" />
            </div>

            <div className="admin-form-group">
              <label>Initial Security Key</label>
              <input type="password" required value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} placeholder="REQUIRED" />
            </div>

            <div className="admin-form-group">
              <label>Contact Registry (Phone)</label>
              <input type="text" required value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="09XXXXXXXXX" />
            </div>

            <div className="admin-form-group">
              <label>Scholastic Program Portfolio</label>
              <select value={formData.course} onChange={e => setFormData({ ...formData, course: e.target.value })}>
                {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="admin-form-group">
              <label>Year Level Orientation</label>
              <select value={formData.yearLevel} onChange={e => setFormData({ ...formData, yearLevel: e.target.value })}>
                <option value="1">1st Year (Freshman)</option>
                <option value="2">2nd Year (Sophomore)</option>
                <option value="3">3rd Year (Junior)</option>
                <option value="4">4th Year (Senior)</option>
              </select>
            </div>

            <div style={{ gridColumn: 'span 2', marginTop: 24 }}>
              <button type="submit" disabled={loading} className="admin-action-btn">
                {loading ? 'SYNCHRONIZING ACCOUNT...' : 'AUTHORIZE ADMISSION ENTRY'}
              </button>
            </div>

          </form>
        </div>
      </main>

      <style jsx>{`
         .modern-card { background: #fff; border-radius: 40px; border: 1.5px solid #edf2f7; box-shadow: 0 30px 60px rgba(0,0,0,0.03); }
         
         .admin-form-group { display: flex; flex-direction: column; gap: 12px; }
         .admin-form-group label { font-size: 11px; fontWeight: 900; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; }
         .admin-form-group input, .admin-form-group select {
            padding: 20px 24px; border-radius: 20px; border: 2.5px solid #edf2f7; background: #f8fafc; font-weight: 700; font-size: 15px; outline: none; transition: 0.3s;
         }
         .admin-form-group input:focus, .admin-form-group select:focus { border-color: #1e3a5f; background: #fff; box-shadow: 0 0 0 6px rgba(30,58,95,0.04); }
         
         .admin-action-btn {
            width: 100%; padding: 24px; border-radius: 24px; border: none; background: #1e3a5f; color: #fff;
            font-weight: 950; font-size: 14px; text-transform: uppercase; cursor: pointer;
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); letter-spacing: 1px;
            box-shadow: 0 15px 30px rgba(30,58,95,0.2);
         }
         .admin-action-btn:hover:not(:disabled) { transform: translateY(-4px); filter: brightness(1.1); box-shadow: 0 20px 40px rgba(30,58,95,0.25); }
         .admin-action-btn:disabled { opacity: 0.6; cursor: not-allowed; }
      `}</style>
    </div>
  );
}
