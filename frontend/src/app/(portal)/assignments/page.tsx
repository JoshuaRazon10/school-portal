'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Topbar from '@/components/Topbar/Topbar';
import { api } from '@/lib/api';

interface Assignment {
  id: number;
  course_code: string;
  title: string;
  due_date: string;
  status: 'pending' | 'in-progress' | 'submitted';
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export default function Assignments() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAssignments() {
      try {
        const res = await api.get('/assignments');
        if (res.success) setAssignments(res.assignments);
      } catch (err) {
        console.error('Error fetching assignments:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchAssignments();
  }, []);

  if (loading) return <div className="spinner"></div>;

  const getPriorityInfo = (p: string) => {
    switch (p) {
      case 'urgent': return { color: '#ef4444', icon: '🔥', label: 'Urgent Ops' };
      case 'high': return { color: '#f59e0b', icon: '⚠️', label: 'High Priority' };
      case 'medium': return { color: '#3b82f6', icon: '📄', label: 'Important' };
      default: return { color: '#94a3b8', icon: '📁', label: 'Standard' };
    }
  };

  return (
    <div className="animate-in" style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: 100 }}>
      <Topbar title="Institutional Mission Desk" subtitle="Operational academic requirements and tactical mission deadlines." />

      <main className="page-content" style={{ maxWidth: 1200, margin: '0 auto' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40 }}>
          <div>
            <h1 style={{ fontSize: 36, fontWeight: 950, letterSpacing: '-1.5px', color: '#1e3a5f' }}>My Assignments</h1>
            <p style={{ color: '#64748b', fontWeight: 600, fontSize: 14 }}>Academic Cycle 2025-2026 · {user?.course}</p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ background: '#fff', padding: '10px 20px', borderRadius: 16, border: '1.5px solid #edf2f7', fontSize: 13, fontWeight: 800 }}>
              <span style={{ color: '#94a3b8' }}>PENDING:</span> {assignments.filter(a => a.status !== 'submitted').length}
            </div>
            <div style={{ background: '#1e3a5f', color: '#fff', padding: '10px 20px', borderRadius: 16, fontSize: 13, fontWeight: 800 }}>
              COMPLETED: {assignments.filter(a => a.status === 'submitted').length}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 40, alignItems: 'start' }}>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {assignments.map((item) => {
              const p = getPriorityInfo(item.priority);
              return (
                <div key={item.id} className="mission-card" style={{ borderLeft: `6px solid ${p.color}` }}>
                  <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#f8fafc', border: '1.5px solid #edf2f7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>
                    {p.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                      <span style={{ fontSize: 11, fontWeight: 900, color: '#1e3a5f', textTransform: 'uppercase', letterSpacing: 0.5 }}>{item.course_code}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8' }}>Due: {item.due_date}</span>
                    </div>
                    <h3 style={{ fontSize: 18, fontWeight: 900, color: '#111827' }}>{item.title}</h3>
                    <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                      <span style={{ background: item.status === 'submitted' ? '#ecfdf5' : '#eff6ff', color: item.status === 'submitted' ? '#059669' : '#1e3a5f', padding: '4px 10px', borderRadius: 8, fontSize: 10, fontWeight: 900, textTransform: 'uppercase' }}>
                        {item.status}
                      </span>
                      <span style={{ background: '#f8fafc', border: '1px solid #edf2f7', color: '#64748b', padding: '4px 10px', borderRadius: 8, fontSize: 10, fontWeight: 900, textTransform: 'uppercase' }}>
                        {p.label}
                      </span>
                    </div>
                  </div>
                  <button className="btn-action">VIEW DETAILS</button>
                </div>
              );
            })}

            {assignments.length === 0 && (
              <div style={{
                padding: '120px 0', textAlign: 'center', background: '#fff', borderRadius: 32,
                border: '2px dashed #edf2f7', color: '#94a3b8'
              }}>
                <div style={{ fontSize: 64, marginBottom: 20 }}>🛰️</div>
                <h3 style={{ fontSize: 20, fontWeight: 900, color: '#1e293b' }}>No Incoming Missions</h3>
                <p style={{ fontWeight: 600 }}>All laboratory and research tasks are currently synchronized.</p>
              </div>
            )}
          </div>

          {/* Metrics Sidebar */}
          <div style={{ position: 'sticky', top: 120, display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ background: '#fff', padding: 32, borderRadius: 32, border: '1.5px solid #edf2f7' }}>
              <h4 style={{ fontSize: 16, fontWeight: 950, marginBottom: 24 }}>Mission Stats</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#64748b' }}>Completion Rate</span>
                  <span style={{ fontSize: 14, fontWeight: 950, color: '#1e3a5f' }}>
                    {assignments.length > 0 ? Math.round((assignments.filter(a => a.status === 'submitted').length / assignments.length) * 100) : 100}%
                  </span>
                </div>
                <div style={{ height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', background: '#1e3a5f',
                    width: `${assignments.length > 0 ? (assignments.filter(a => a.status === 'submitted').length / assignments.length) * 100 : 100}%`,
                    transition: 'width 1s ease'
                  }} />
                </div>
                <p style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, lineHeight: 1.5 }}>
                  Keep your completion rate above 80% to maintain institutional scholastic standing.
                </p>
              </div>
            </div>
          </div>

        </div>
      </main>

      <style jsx>{`
         .mission-card {
            background: #fff; padding: 32px; border-radius: 28px;
            display: flex; gap: 24px; align-items: center;
            box-shadow: 0 4px 15px rgba(0,0,0,0.02);
            transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            border: 1.5px solid #edf2f7;
         }
         .mission-card:hover { transform: translateX(12px) scale(1.01); box-shadow: 0 20px 40px rgba(0,0,0,0.05); }
         
         .btn-action {
            background: #f8fafc; border: 1.5px solid #edf2f7; padding: 12px 20px;
            border-radius: 12px; font-size: 11px; font-weight: 950; color: #1e3a5f;
            cursor: pointer; transition: 0.3s;
         }
         .btn-action:hover { background: #1e3a5f; color: #fff; border-color: #1e3a5f; }
      `}</style>
    </div>
  );
}
