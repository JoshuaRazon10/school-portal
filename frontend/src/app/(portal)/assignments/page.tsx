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

        <div className="assignments-header mobile-stack">
          <div>
            <h1 className="header-title">My Assignments</h1>
            <p className="header-subtitle">Academic Cycle 2025-2026 · {user?.course}</p>
          </div>
          <div className="stats-pills">
            <div className="stat-pill">
              <span className="stat-label">PENDING:</span> {assignments.filter(a => a.status !== 'submitted').length}
            </div>
            <div className="stat-pill dark">
              COMPLETED: {assignments.filter(a => a.status === 'submitted').length}
            </div>
          </div>
        </div>

        <div className="assignments-grid">

          <div className="missions-column">
            {assignments.map((item) => {
              const p = getPriorityInfo(item.priority);
              return (
                <div key={item.id} className="mission-card" style={{ borderLeft: `6px solid ${p.color}` }}>
                  <div className="mission-icon">
                    {p.icon}
                  </div>
                  <div className="mission-info">
                    <div className="mission-meta">
                      <span className="course-code">{item.course_code}</span>
                      <span className="due-date">Due: {item.due_date}</span>
                    </div>
                    <h3 className="mission-title">{item.title}</h3>
                    <div className="mission-badges">
                      <span className={`status-badge ${item.status}`}>
                        {item.status}
                      </span>
                      <span className="priority-badge">
                        {p.label}
                      </span>
                    </div>
                  </div>
                  <button className="btn-action">VIEW DETAILS</button>
                </div>
              );
            })}

            {assignments.length === 0 && (
              <div className="empty-state">
                <div style={{ fontSize: 64, marginBottom: 20 }}>🛰️</div>
                <h3 style={{ fontSize: 20, fontWeight: 900, color: '#1e293b' }}>No Incoming Missions</h3>
                <p style={{ fontWeight: 600 }}>All laboratory and research tasks are currently synchronized.</p>
              </div>
            )}
          </div>

          <div className="stats-sidebar">
            <div className="modern-card">
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

         .assignments-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 40px; gap: 24px; }
         .header-title { font-size: 36px; font-weight: 950; letter-spacing: -1.5px; color: #1e3a5f; }
         .header-subtitle { color: #64748b; font-weight: 600; font-size: 14px; }
         .stats-pills { display: flex; gap: 12px; }
         .stat-pill { background: #fff; padding: 10px 20px; border-radius: 16px; border: 1.5px solid #edf2f7; fontSize: 13px; font-weight: 800; }
         .stat-pill.dark { background: #1e3a5f; color: #fff; border: none; }
         .stat-label { color: #94a3b8; }

         .assignments-grid { display: grid; grid-template-columns: 1fr 300px; gap: 40px; align-items: start; }
         .missions-column { display: flex; flex-direction: column; gap: 16px; }
         .mission-icon { width: 64px; height: 64px; border-radius: 50%; background: #f8fafc; border: 1.5px solid #edf2f7; display: flex; align-items: center; justify-content: center; font-size: 28px; flex-shrink: 0; }
         .mission-info { flex: 1; }
         .mission-meta { display: flex; align-items: center; gap: 12px; margin-bottom: 4px; }
         .course-code { font-size: 11px; font-weight: 900; color: #1e3a5f; text-transform: uppercase; letter-spacing: 0.5px; }
         .due-date { font-size: 11px; font-weight: 700; color: #94a3b8; }
         .mission-title { font-size: 18px; font-weight: 900; color: #111827; }
         .mission-badges { display: flex; gap: 12px; margin-top: 12px; }
         .status-badge { padding: 4px 10px; border-radius: 8px; font-size: 10px; font-weight: 900; text-transform: uppercase; }
         .status-badge.submitted { background: #ecfdf5; color: #059669; }
         .status-badge.pending, .status-badge.in-progress { background: #eff6ff; color: #1e3a5f; }
         .priority-badge { background: #f8fafc; border: 1px solid #edf2f7; color: #64748b; padding: 4px 10px; border-radius: 8px; font-size: 10px; font-weight: 900; text-transform: uppercase; }
         
         .empty-state { padding: 80px 20px; text-align: center; background: #fff; border-radius: 32px; border: 2.5px dashed #edf2f7; color: #94a3b8; }

         .btn-action {
            background: #f8fafc; border: 1.5px solid #edf2f7; padding: 12px 20px;
            border-radius: 12px; font-size: 11px; font-weight: 950; color: #1e3a5f;
            cursor: pointer; transition: 0.3s;
         }
         .btn-action:hover { background: #1e3a5f; color: #fff; border-color: #1e3a5f; }

         @media (max-width: 1024px) {
            .assignments-grid { grid-template-columns: 1fr; }
            .assignments-header { flex-direction: column; align-items: flex-start; }
            .stats-sidebar { position: static; width: 100%; }
            .mission-card { padding: 24px; }
         }

         @media (max-width: 768px) {
            .mission-card { flex-direction: column; text-align: center; }
            .mission-meta { justify-content: center; }
            .mission-badges { justify-content: center; }
            .stats-pills { width: 100%; flex-direction: column; }
            .stat-pill { text-align: center; }
         }

      `}</style>
    </div>
  );
}
