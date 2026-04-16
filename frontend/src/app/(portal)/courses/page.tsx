'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Topbar from '@/components/Topbar/Topbar';
import { api } from '@/lib/api';

interface Subject {
  id: number;
  code: string;
  name: string;
  units: number;
  teacher: string;
  type: 'major' | 'minor';
}

export default function MyCourses() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMyCurriculum();
  }, []);

  const loadMyCurriculum = async () => {
    try {
      const res = await api.get('/courses');
      if (res.success) setSubjects(res.courses);
    } finally {
      setLoading(false);
    }
  };

  const majors = subjects.filter(s => s.type === 'major');
  const minors = subjects.filter(s => s.type === 'minor');

  if (loading) return <div className="spinner"></div>;

  return (
    <div className="animate-in" style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: 100 }}>
      <Topbar title="Academic Curriculum Hub" subtitle="Visualize your institutional departmental load and curricular roadmap." />

      <main className="page-content" style={{ maxWidth: 1200, margin: '0 auto' }}>

        <div style={{ marginBottom: 60 }}>
          <h1 style={{ fontSize: 36, fontWeight: 950, color: '#1e3a5f', letterSpacing: '-1.5px', marginBottom: 12 }}>Departmental Curriculum</h1>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1.2 }}>
            Current Academic Load: <span style={{ color: '#1e3a5f' }}>{subjects.reduce((sum, s) => sum + s.units, 0)} Units</span>
          </p>
        </div>

        <div style={{ display: 'grid', gap: 60 }}>

          {/* Section 1: Major Subjects */}
          <div className="section-container">
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
              <div style={{ width: 54, height: 54, borderRadius: 16, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>🧬</div>
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 950, color: '#1e293b' }}>Program Major Subjects</h2>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8' }}>Core departmental competencies and specialization courses.</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 24 }}>
              {majors.map((s) => (
                <div key={s.id} className="subject-card modern-shadow">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                    <div style={{ background: '#1e3a5f', color: '#fff', padding: '6px 14px', borderRadius: 10, fontSize: 11, fontWeight: 900 }}>{s.code}</div>
                    <div style={{ fontSize: 11, fontWeight: 800, color: '#94a3b8' }}>{s.units} CREDIT UNITS</div>
                  </div>
                  <h3 style={{ fontSize: 18, fontWeight: 900, color: '#111827', marginBottom: 12, lineHeight: 1.4 }}>{s.name}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 'auto' }}>
                    <div style={{ width: 32, height: 32, borderRadius: 10, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>👤</div>
                    <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>{s.teacher}</div>
                  </div>
                </div>
              ))}
              {majors.length === 0 && (
                <div style={{ gridColumn: '1/-1', padding: 60, textAlign: 'center', background: '#fff', borderRadius: 32, border: '2px dashed #edf2f7', opacity: 0.5 }}>
                  No active major courses found.
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Minor & GE */}
          <div className="section-container">
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
              <div style={{ width: 54, height: 54, borderRadius: 16, background: '#f8fafc', border: '1.5px solid #edf2f7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>📚</div>
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 950, color: '#1e293b' }}>General Education & Electives</h2>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8' }}>Broadening horizons through institutional general education.</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 24 }}>
              {minors.map((s) => (
                <div key={s.id} className="subject-card" style={{ background: '#fcfdfe' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                    <div style={{ background: '#f1f5f9', color: '#64748b', padding: '6px 14px', borderRadius: 10, fontSize: 11, fontWeight: 900 }}>{s.code}</div>
                    <div style={{ fontSize: 11, fontWeight: 800, color: '#94a3b8' }}>{s.units} CREDITS</div>
                  </div>
                  <h3 style={{ fontSize: 17, fontWeight: 800, color: '#1e293b', marginBottom: 8 }}>{s.name}</h3>
                  <p style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>{s.teacher}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>

      <style jsx>{`
         .subject-card {
            background: #fff; padding: 32px; border-radius: 28px;
            border: 1.5px solid #edf2f7; transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            display: flex; flex-direction: column; height: 100%;
         }
         .subject-card:hover { transform: translateY(-8px); box-shadow: 0 20px 40px rgba(0,0,0,0.05); border-color: #1e3a5f; }
         .modern-shadow { box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02); }
      `}</style>
    </div>
  );
}
