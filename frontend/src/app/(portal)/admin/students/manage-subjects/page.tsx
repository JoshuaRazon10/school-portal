'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Topbar from '@/components/Topbar/Topbar';
import { api } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import Modal from '@/components/Modal/Modal';

interface Student {
  id: number;
  name: string;
  studentId: string;
  course: string;
}

interface Subject {
  id: number;
  code: string;
  name: string;
}

function ManageSubjectsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const studentId = searchParams.get('id');
  const { showToast } = useToast();

  const [student, setStudent] = useState<Student | null>(null);
  const [enrolled, setEnrolled] = useState<Subject[]>([]);
  const [offerings, setOfferings] = useState<Subject[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState<{
    title: string;
    message: string;
    type: 'danger' | 'success' | 'info';
    onConfirm: () => void;
  }>({
    title: '',
    message: '',
    type: 'info',
    onConfirm: () => { },
  });

  useEffect(() => {
    if (studentId) loadData();
  }, [studentId]);

  const loadData = async () => {
    setLoading(true);
    const [sRes, eRes, oRes] = await Promise.all([
      api.get(`/admin/students`),
      api.get(`/courses?userId=${studentId}`),
      api.get(`/admin/all-subjects`)
    ]);

    if (sRes.success) {
      const target = sRes.students.find((s: any) => s.id === parseInt(studentId!));
      setStudent(target);
    }
    if (eRes.success) setEnrolled(eRes.courses);
    if (oRes.success) setOfferings(oRes.subjects);
    setLoading(false);
  };

  const handleEnroll = async (subId: number) => {
    const res = await api.post('/admin/enroll-subject', { userId: studentId, subjectId: subId });
    if (res.success) {
      showToast('Institutional Subject Enrollment Confirmed.', 'success');
      await loadData();
    } else {
      showToast('Enrollment Error: ' + res.message, 'error');
    }
  };

  const handleDrop = (subId: number) => {
    setModalConfig({
      title: 'Curricular Drop Confirmation',
      message: `Are you sure you want to remove this subject specification from ${student?.name}'s active selection? This will instantly adjust the student's academic loadout.`,
      type: 'danger',
      onConfirm: async () => {
        setModalOpen(false);
        const res = await api.delete('/admin/unenroll-subject', { userId: studentId, subjectId: subId });
        if (res.success) {
          showToast('Student Dropped from Subject.', 'info');
          await loadData();
        }
      }
    });
    setModalOpen(true);
  };

  const filteredOfferings = offerings.filter(o =>
    o.name.toLowerCase().includes(search.toLowerCase()) ||
    o.code.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="page-content">Accessing Institutional Database...</div>;
  if (!student) return <div className="page-content">Student record not identified.</div>;

  return (
    <div className="animate-in">
      <Topbar
        title={`Manage Loadout: ${student.name}`}
        subtitle={`Official curricular oversight for ${student.course} (${student.studentId}).`}
      />

      <Modal
        isOpen={modalOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        onConfirm={modalConfig.onConfirm}
        onCancel={() => setModalOpen(false)}
        confirmText="Confirm Change"
        cancelText="Dismiss"
      />

      <main className="page-content">
        <div style={{ marginBottom: 24 }}>
          <button onClick={() => router.push('/admin/students')} className="btn btn-secondary">
            ← Return to Directory
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>

          {/* Section 1: Active Loadout */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ fontSize: 18, fontWeight: 900 }}>Enrolled Subjects</h3>
              <div className="badge badge-primary">{enrolled.length} Assigned</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {enrolled.map(s => (
                <div key={s.id} style={{ padding: 20, background: 'var(--secondary)', borderRadius: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--divider)' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--primary)' }}>{s.code}</div>
                    <div style={{ fontSize: 15, fontWeight: 700 }}>{s.name}</div>
                  </div>
                  <button
                    onClick={() => handleDrop(s.id)}
                    className="btn btn-primary"
                    style={{ background: '#ef4444', padding: '8px 16px', fontSize: 11 }}
                  >
                    Drop Subject
                  </button>
                </div>
              ))}
              {enrolled.length === 0 && (
                <div style={{ textAlign: 'center', padding: 40, background: '#f8fafc', borderRadius: 16, border: '2px dashed var(--divider)' }}>
                  <p style={{ opacity: 0.5, fontSize: 14 }}>No active curricular assignments identified.</p>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Institutional Curriculum */}
          <div className="card">
            <h3 style={{ fontSize: 18, fontWeight: 900, marginBottom: 24 }}>Institutional Curriculum</h3>

            <div style={{ marginBottom: 20 }}>
              <input
                className="form-input"
                placeholder="Search institutional course offerings..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ background: '#f8fafc', fontSize: 13 }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 600, overflowY: 'auto' }}>
              {filteredOfferings.map(o => {
                const isEnrolled = enrolled.some(e => e.id === o.id);
                return (
                  <div key={o.id} style={{ padding: 16, border: '1.5px solid var(--divider)', borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: isEnrolled ? 0.6 : 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 800 }}>{o.name} <span style={{ opacity: 0.5 }}>({o.code})</span></div>
                    {isEnrolled ? (
                      <span style={{ fontSize: 10, fontWeight: 900, color: '#10b981' }}>✓ ACTIVE LOADOUT</span>
                    ) : (
                      <button onClick={() => handleEnroll(o.id)} className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: 11 }}>
                        + Enroll
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

export default function ManageSubjects() {
  return (
    <Suspense fallback={<div>Institutional Access Processing...</div>}>
      <ManageSubjectsContent />
    </Suspense>
  );
}
