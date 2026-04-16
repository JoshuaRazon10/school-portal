'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import Topbar from '@/components/Topbar/Topbar';
import { api } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import Modal from '@/components/Modal/Modal';

interface Subject {
  id: number;
  code: string;
  name: string;
  units: number;
  teacher: string;
  type: 'major' | 'minor';
  day: string;
  timeStart: string;
  timeEnd: string;
  room: string;
}

interface RoomSlot {
  time: string;
  minutes: number;
  occupied: boolean;
  subject: { id: number; code: string; name: string } | null;
}

const ROOMS = ['Room 101', 'Room 102', 'Room 103', 'Room 201', 'Room 202', 'Room 301', 'Room 302', 'Lab 1', 'Lab 2', 'Lab 3', 'Gym'];
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const TIMES: string[] = [];
for (let mins = 7 * 60; mins <= 20 * 60; mins += 30) {
  const h24 = Math.floor(mins / 60);
  const m = mins % 60;
  const ampm = h24 >= 12 ? 'PM' : 'AM';
  const h12 = h24 > 12 ? h24 - 12 : h24 === 0 ? 12 : h24;
  TIMES.push(`${h12.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${ampm}`);
}

export default function AdminSubjects() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [roomSlots, setRoomSlots] = useState<RoomSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState<{
    title: string; message: string; type: 'danger' | 'success' | 'info' | 'warning'; onConfirm: () => void;
  }>({ title: '', message: '', type: 'info', onConfirm: () => { } });

  const [formData, setFormData] = useState({
    code: '', name: '', units: '3', teacher: '', programId: '13', yearLevel: '1', semester: '1', type: 'major',
    day: 'Monday', timeStart: '08:00 AM', timeEnd: '10:00 AM', room: 'Room 101'
  });

  useEffect(() => {
    if (user?.role === 'admin') loadSubjects();
  }, [user]);

  const loadSubjects = async () => {
    try {
      const res = await api.get('/admin/all-subjects');
      if (res.success) setSubjects(res.subjects);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoomAvailability = useCallback(async (room: string, day: string) => {
    setSlotsLoading(true);
    try {
      const res = await api.get(`/admin/room-availability?room=${encodeURIComponent(room)}&day=${encodeURIComponent(day)}`);
      if (res.success) setRoomSlots(res.slots);
    } finally {
      setSlotsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (showAddForm) fetchRoomAvailability(formData.room, formData.day);
  }, [showAddForm, formData.room, formData.day, fetchRoomAvailability]);

  const parseTime = (timeStr: string) => {
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (modifier === 'PM' && hours !== 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  };

  const isSlotOccupied = (timeStr: string) => {
    const slot = roomSlots.find(s => s.time === timeStr);
    if (!slot) return false;
    if (editingSubject && slot.subject && slot.subject.id === editingSubject.id) return false;
    return slot.occupied;
  };

  const hasConflict = () => {
    const startMins = parseTime(formData.timeStart);
    const endMins = parseTime(formData.timeEnd);
    for (const slot of roomSlots) {
      if (slot.minutes >= startMins && slot.minutes < endMins && slot.occupied) {
        if (editingSubject && slot.subject && slot.subject.id === editingSubject.id) continue;
        return true;
      }
    }
    return false;
  };

  const showAlert = (title: string, message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setModalConfig({ title, message, type, onConfirm: () => setModalOpen(false) });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (hasConflict()) {
      showAlert('Schedule Conflict', 'The selected time range overlaps with an existing subject specification.', 'warning');
      return;
    }
    const url = editingSubject ? `/admin/update-subject/${editingSubject.id}` : '/admin/create-subject';
    const res = await (api as any)[editingSubject ? 'put' : 'post'](url, formData);
    if (res.success) {
      showToast(`Institutional spec "${formData.code}" has been finalized.`, 'success');
      resetForm();
      loadSubjects();
    } else {
      showToast(res.message || 'Curriculum synchronization failed.', 'error');
    }
  };

  const handleEdit = (s: Subject) => {
    setEditingSubject(s);
    setFormData({
      code: s.code, name: s.name, units: s.units.toString(), teacher: s.teacher,
      programId: '13', yearLevel: '1', semester: '1', type: s.type,
      day: s.day || 'Monday', timeStart: s.timeStart || '08:00 AM', timeEnd: s.timeEnd || '10:00 AM', room: s.room || 'Room 101'
    });
    setShowAddForm(true);
  };

  const resetForm = () => {
    setEditingSubject(null);
    setShowAddForm(false);
    setFormData({
      code: '', name: '', units: '3', teacher: '', programId: '13', yearLevel: '1', semester: '1', type: 'major',
      day: 'Monday', timeStart: '08:00 AM', timeEnd: '10:00 AM', room: 'Room 101'
    });
  };

  if (user?.role !== 'admin') return <div className="page-content">Access Denied</div>;

  return (
    <div className="animate-in" style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: 100 }}>
      <Topbar title="Curriculum Design Studio" subtitle="Strategic management of institutional academic offerings and infrastructure allocation." />

      <Modal
        isOpen={modalOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        onConfirm={modalConfig.onConfirm}
        onCancel={() => setModalOpen(false)}
        confirmText="Authorize Specification"
      />

      <main className="page-content" style={{ maxWidth: 1400, margin: '0 auto', padding: '0 20px' }}>

        <div className="mobile-stack" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, gap: 20 }}>
          <h2 style={{ fontSize: 28, fontWeight: 950, letterSpacing: '-1.5px', color: '#1e3a5f' }}>Registry Archives</h2>
          <button onClick={() => showAddForm ? resetForm() : setShowAddForm(true)} className="admin-workbench-btn" style={{ background: showAddForm ? '#ef4444' : '#1e3a5f', width: 'auto' }}>
            {showAddForm ? '✕ ABORT' : '+ NEW OFFERING'}
          </button>
        </div>

        {showAddForm && (
          <div className="modern-admin-card animate-slide-up" style={{ padding: '32px 20px', marginBottom: 40 }}>
            <h3 className="admin-sublabel" style={{ marginBottom: 32 }}>Institutional subject specification</h3>
            <form onSubmit={handleSubmit} className="mobile-stack" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <div className="admin-form-group">
                <label>Unique Identification (Code)</label>
                <input required value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })} placeholder="e.g. CS311" />
              </div>
              <div className="admin-form-group">
                <label>Scholastic Designation (Name)</label>
                <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. ADVANCED DATA STRUCTURES" />
              </div>
              <div className="admin-form-group">
                <label>Curricular Load (Units)</label>
                <input type="number" required value={formData.units} onChange={e => setFormData({ ...formData, units: e.target.value })} />
              </div>
              <div className="admin-form-group">
                <label>Assigned Kurs Instructor</label>
                <input required value={formData.teacher} onChange={e => setFormData({ ...formData, teacher: e.target.value })} placeholder="PROF. IDENTITY" />
              </div>

              <div className="mobile-stack" style={{ gridColumn: 'span 2', display: 'grid', gridTemplateColumns: '1fr 1fr 1.5fr', gap: 24, marginTop: 16 }}>
                <div className="admin-form-group">
                  <label>Operational Day</label>
                  <select value={formData.day} onChange={e => setFormData({ ...formData, day: e.target.value })}>
                    {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="admin-form-group">
                  <label>Infrastructure (Room)</label>
                  <select value={formData.room} onChange={e => setFormData({ ...formData, room: e.target.value })}>
                    {ROOMS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div className="admin-form-group">
                  <label>Temporal Slot (Start to End)</label>
                  <div className="mobile-stack" style={{ display: 'flex', gap: 8 }}>
                    <select value={formData.timeStart} onChange={e => setFormData({ ...formData, timeStart: e.target.value })} style={{ flex: 1 }}>
                      {TIMES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <select value={formData.timeEnd} onChange={e => setFormData({ ...formData, timeEnd: e.target.value })} style={{ flex: 1 }}>
                      {TIMES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div style={{ gridColumn: 'span 2', marginTop: 32 }}>
                <button type="submit" className="admin-workbench-btn" style={{ width: '100%' }}>Finalize Curricular Specification</button>
              </div>
            </form>
          </div>
        )}

        <div className="modern-admin-card scroll-x" style={{ padding: 0, overflowX: 'auto' }}>
          <table style={{ minWidth: 800, width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#fcfdfe', borderBottom: '2.5px solid #f1f5f9' }}>
                <th className="th-cell">Protocol</th>
                <th className="th-cell">Instructional Identity</th>
                <th className="th-cell">Temporal/Spatial Allocation</th>
                <th className="th-cell">Units</th>
                <th className="th-cell" style={{ textAlign: 'center' }}>Management</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map(s => (
                <tr key={s.id} className="row-hover">
                  <td className="td-cell">
                    <span style={{ fontSize: 9, fontWeight: 950, padding: '4px 10px', borderRadius: 8, background: s.type === 'major' ? '#eff6ff' : '#f8fafc', color: s.type === 'major' ? '#1e3a5f' : '#64748b', border: '1px solid #edf2f7' }}>
                      {s.type.toUpperCase()}
                    </span>
                  </td>
                  <td className="td-cell">
                    <div style={{ fontSize: 16, fontWeight: 950, color: '#1e3a5f' }}>{s.code}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8' }}>{s.name}</div>
                  </td>
                  <td className="td-cell">
                    <div style={{ fontSize: 13, fontWeight: 850, color: '#1e293b' }}>{s.day} · {s.room}</div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8' }}>{s.timeStart} — {s.timeEnd}</div>
                  </td>
                  <td className="td-cell" style={{ fontWeight: 950, color: '#1e3a5f' }}>{s.units}</td>
                  <td className="td-cell" style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                      <button onClick={() => handleEdit(s)} className="action-ic-btn" style={{ color: '#3b82f6' }}>EDIT</button>
                      <button onClick={() => { }} className="action-ic-btn" style={{ color: '#ef4444' }}>PURGE</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      <style jsx>{`
         .modern-admin-card { background: #fff; border-radius: 40px; border: 1.5px solid #edf2f7; box-shadow: 0 10px 30px rgba(0,0,0,0.02); }
         .admin-sublabel { font-size: 11px; fontWeight: 900; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.2px; }
         
         .admin-form-group { display: flex; flex-direction: column; gap: 12px; }
         .admin-form-group label { font-size: 11px; fontWeight: 900; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; }
         .admin-form-group input, .admin-form-group select { padding: 18px 24px; border-radius: 18px; border: 2.5px solid #edf2f7; background: #f8fafc; font-weight: 700; font-size: 14px; outline: none; transition: 0.3s; }
         .admin-form-group input:focus, .admin-form-group select:focus { border-color: #1e3a5f; background: #fff; }

         .admin-workbench-btn { padding: 20px 32px; border-radius: 18px; border: none; color: #fff; font-weight: 950; font-size: 12px; text-transform: uppercase; cursor: pointer; transition: 0.3s; letter-spacing: 1px; }
         .admin-workbench-btn:hover { transform: translateY(-4px); filter: brightness(1.2); box-shadow: 0 10px 20px rgba(0,0,0,0.1); }

         .th-cell { padding: 24px 32px; font-size: 10px; font-weight: 950; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; text-align: left; }
         .td-cell { padding: 24px 32px; border-bottom: 1.5px solid #fcfdfe; }
         .row-hover:hover { background: #fcfdfe; }
         
         .action-ic-btn { background: transparent; border: none; font-size: 10px; fontWeight: 950; cursor: pointer; opacity: 0.6; transition: 0.2s; }
         .action-ic-btn:hover { opacity: 1; transform: scale(1.1); }
      `}</style>
    </div>
  );
}
