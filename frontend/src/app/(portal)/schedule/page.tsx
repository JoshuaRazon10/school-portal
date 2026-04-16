'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Topbar from '@/components/Topbar/Topbar';
import { api } from '@/lib/api';

interface ScheduleItem {
  id: number;
  day: string;
  time_start: string;
  time_end: string;
  subject: string;
  room: string;
  teacher: string;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function Schedule() {
  const { user } = useAuth();
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSchedule();
  }, []);

  const loadSchedule = async () => {
    try {
      const res = await api.get('/schedule');
      if (res.success) setSchedule(res.schedules);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="spinner"></div>;

  return (
    <div className="animate-in" style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: 100 }}>
      <Topbar title="Academic Timetable" subtitle="Strategic oversight of weekly instructional sessions and infrastructure allocation." />

      <main className="page-content" style={{ maxWidth: 1400, margin: '0 auto', padding: '0 40px' }}>

        {user?.role === 'admin' && (
          <div className="modern-admin-card" style={{ marginBottom: 48, padding: 32, background: '#eff6ff', border: '1.5px solid #dbeafe', color: '#1e3a5f' }}>
            <p style={{ fontSize: 13, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 20 }}>💡</span>
              <span>ADMIN NOTE: Class schedules are autonomously managed through the Curriculum Master protocol.</span>
            </p>
          </div>
        )}

        {DAYS.map((day, dIdx) => {
          const dayItems = schedule.filter(item => item.day === day);
          return (
            <div key={day} style={{ marginBottom: 60 }} className={`animate-slide-up delay-${(dIdx % 5) + 1}`}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                <div style={{ width: 48, height: 48, borderRadius: 16, background: '#1e3a5f', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 950 }}>{day[0]}</div>
                <h2 style={{ fontSize: 24, fontWeight: 950, color: '#1e3a5f', letterSpacing: '-0.5px' }}>{day.toUpperCase()}</h2>
                <div style={{ flex: 1, height: 1, background: '#edf2f7', marginLeft: 16 }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: 24 }}>
                {dayItems.map(item => (
                  <div key={item.id} className="schedule-card">
                    <div className="time-strip">
                      <div className="t-start">{item.time_start}</div>
                      <div className="t-end">{item.time_end}</div>
                    </div>
                    <div className="session-info">
                      <h3 className="subject-title">{item.subject}</h3>
                      <div className="location-meta">
                        <span>{item.room}</span>
                        <span className="dot">•</span>
                        <span>{item.teacher}</span>
                      </div>
                    </div>
                    <div className="status-indicator active" />
                  </div>
                ))}
                {dayItems.length === 0 && (
                  <div style={{ gridColumn: 'span 2', padding: 48, borderRadius: 32, background: 'rgba(241, 245, 249, 0.5)', border: '1.5px dashed #e2e8f0', textAlign: 'center' }}>
                    <p style={{ fontSize: 13, fontWeight: 800, color: '#94a3b8' }}>NO TACTICAL SESSIONS SCHEDULED FOR {day.toUpperCase()}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </main>

      <style jsx>{`
         .schedule-card {
            background: #fff; padding: 24px; border-radius: 32px; border: 1.5px solid #edf2f7;
            display: flex; gap: 24px; align-items: center; position: relative; overflow: hidden;
            box-shadow: 0 4px 15px rgba(0,0,0,0.02); transition: 0.3s;
         }
         .schedule-card:hover { transform: translateX(8px); border-color: #1e3a5f; box-shadow: 0 10px 25px rgba(30,58,95,0.05); }
         
         .time-strip {
            padding: 16px; background: #f8fafc; border-radius: 20px; text-align: center; border: 1px solid #edf2f7; min-width: 100px;
         }
         .t-start { font-size: 13px; fontWeight: 950; color: #1e3a5f; }
         .t-end { font-size: 10px; fontWeight: 700; color: #94a3b8; marginTop: 2px; }
         
         .session-info { flex: 1; }
         .subject-title { font-size: 18px; fontWeight: 950; color: #1e293b; marginBottom: 6px; letterSpacing: -0.3px; }
         .location-meta { font-size: 12px; fontWeight: 700; color: #94a3b8; display: flex; gap: 8px; align-items: center; }
         .dot { opacity: 0.3; }
         
         .status-indicator { position: absolute; top: 0; right: 0; width: 6px; height: 100%; background: #edf2f7; transition: 0.3s; }
         .schedule-card:hover .status-indicator.active { background: #1e3a5f; }

         @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
         .animate-slide-up { animation: slideUp 0.6s cubic-bezier(0, 0, 0.2, 1) backwards; }
         .delay-1 { animation-delay: 0.1s; }
         .delay-2 { animation-delay: 0.2s; }
         .delay-3 { animation-delay: 0.3s; }
         .delay-4 { animation-delay: 0.4s; }
         .delay-5 { animation-delay: 0.5s; }
      `}</style>
    </div>
  );
}
