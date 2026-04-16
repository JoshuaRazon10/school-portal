'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Topbar from '@/components/Topbar/Topbar';
import { api } from '@/lib/api';

export default function Grades() {
  const { user } = useAuth();
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGrades() {
      try {
        const res = await api.get('/grades');
        if (res.success) setGrades(res.grades);
      } catch (err) {
        console.error('Error fetching grades:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchGrades();
  }, []);

  if (loading) return <div className="spinner"></div>;

  return (
    <div className="animate-in" style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: 100 }}>
      <Topbar title="Scholastic Achievement Ledger" subtitle="Detailed breakdown of institutional academic performance and credit registry." />

      <main className="page-content" style={{ maxWidth: 1200, margin: '0 auto' }}>

        <div className="grades-header mobile-stack">
          <div className="header-text">
            <h1 className="header-title">Grade Records</h1>
            <p className="header-subtitle">Academic Cycle 2025-2026 · {user?.course}</p>
          </div>
          <div className="metric-container mobile-stack">
            <div className="grade-metric">
              <div className="metric-icon">🔥</div>
              <div>
                <div className="metric-label">Institutional GPA</div>
                <div className="metric-value">{Number(user?.gpa).toFixed(2)}</div>
              </div>
            </div>
            <div className="grade-metric">
              <div className="metric-icon">📗</div>
              <div>
                <div className="metric-label">Scholastic Status</div>
                <div className="metric-value" style={{ color: '#10b981' }}>GOOD STANDING</div>
              </div>
            </div>
          </div>
        </div>

        {/* Grades Table Card */}
        <div className="modern-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#fcfdfe', borderBottom: '2px solid #f1f5f9' }}>
                  <th className="th-cell">Subject Description</th>
                  <th className="th-cell">Academic Term</th>
                  <th className="th-cell">Performance Vector</th>
                  <th className="th-cell" style={{ textAlign: 'center' }}>Institutional Grade</th>
                </tr>
              </thead>
              <tbody>
                {grades.map((g: any, i: number) => (
                  <tr key={g.id} className="row-hover">
                    <td className="td-cell" style={{ fontWeight: 700, color: '#1e293b' }}>{g.courseName}</td>
                    <td className="td-cell" style={{ color: '#94a3b8', fontWeight: 600 }}>{g.semester}</td>
                    <td className="td-cell" style={{ width: 240 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ flex: 1, height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                          <div style={{
                            width: `${g.score}%`, height: '100%',
                            background: g.score >= 75 ? 'linear-gradient(90deg, #3b82f6, #60a5fa)' : '#ef4444',
                            borderRadius: 4,
                            transition: 'width 1s cubic-bezier(0.2, 0.8, 0.2, 1)'
                          }} />
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 950, color: g.score >= 75 ? '#1e3a5f' : '#ef4444' }}>{g.score}%</span>
                      </div>
                    </td>
                    <td className="td-cell" style={{ textAlign: 'center' }}>
                      <span className="grade-badge" style={{
                        background: Number(g.grade) <= 2.0 ? '#ecfdf5' : '#f8fafc',
                        color: Number(g.grade) <= 2.0 ? '#059669' : '#1e3a5f',
                        border: `1.5px solid ${Number(g.grade) <= 2.0 ? '#d1fae5' : '#e2e8f0'}`
                      }}>
                        {g.grade}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </main>

      <style jsx>{`
         .grade-metric {
            background: #fff; padding: 16px 24px; border-radius: 20px;
            display: flex; gap: 16px; align-items: center;
            border: 1.5px solid #edf2f7;box-shadow: 0 4px 10px rgba(0,0,0,0.02);
         }
         .metric-icon { font-size: 24px; }
         .metric-label { font-size: 10px; font-weight: 850; color: #94a3b8; text-transform: uppercase; }
         .metric-value { font-size: 16px; font-weight: 950; color: #1e3a5f; }

         .modern-card { background: #fff; border-radius: 32px; border: 1.5px solid #edf2f7; box-shadow: 0 20px 40px rgba(0,0,0,0.03); }
         
         .grades-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 40px; gap: 24px; }
         .header-title { font-size: 36px; font-weight: 950; letter-spacing: -1.5px; color: #1e3a5f; }
         .header-subtitle { color: #64748b; font-weight: 600; font-size: 14px; }
         .metric-container { display: flex; gap: 16px; }

         .th-cell { padding: 24px 30px; font-size: 11px; color: #94a3b8; font-weight: 900; text-transform: uppercase; text-align: left; letter-spacing: 0.5px; }
         .td-cell { padding: 24px 30px; font-size: 14px; border-bottom: 1.5px solid #f8fafc; }
         
         .row-hover { transition: background 0.2s ease; }
         .row-hover:hover { background: #fcfdfe; }
         
         .grade-badge {
            display: inline-flex; align-items: center; justify-content: center;
            width: 44px; height: 44px; border-radius: 14px;
            font-size: 14px; font-weight: 950;
         }

         @media (max-width: 1024px) {
            .header-title { font-size: 28px; }
            .grades-header { flex-direction: column; align-items: flex-start; }
            .th-cell, .td-cell { padding: 16px 20px; }
         }

         @media (max-width: 768px) {
            .header-title { font-size: 24px; text-align: center; }
            .header-subtitle { text-align: center; }
            .metric-container { width: 100%; flex-direction: column; }
            .grade-metric { width: 100%; }
         }

      `}</style>
    </div>
  );
}
