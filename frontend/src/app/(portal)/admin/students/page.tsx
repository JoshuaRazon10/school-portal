'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Topbar from '@/components/Topbar/Topbar';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useToast } from '@/context/ToastContext';
import Modal from '@/components/Modal/Modal';

interface Student {
   id: number;
   name: string;
   studentId: string;
   course: string;
   yearLevel: number;
   email: string;
   photo_url?: string;
}

interface Subject {
   id: number;
   code: string;
   name: string;
}

export default function AdminStudents() {
   const { user } = useAuth();
   const { showToast } = useToast();
   const router = useRouter();
   const [students, setStudents] = useState<Student[]>([]);
   const [searchQuery, setSearchQuery] = useState('');
   const [allSubjects, setAllSubjects] = useState<Subject[]>([]);
   const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
   const [studentEnrolled, setSizeEnrolled] = useState<Subject[]>([]);
   const [activeTab, setActiveTab] = useState<'enroll' | 'grades' | 'tasks' | 'attendance' | 'finance'>('enroll');
   const [subjectSearch, setSubjectSearch] = useState('');
   const [dropdownOpen, setDropdownOpen] = useState(false);

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

   // Form states
   const [gradeData, setGradeData] = useState({ courseName: '', grade: '1.0', score: '95', status: 'Passed' });
   const [studentFinance, setStudentFinance] = useState<{ balance: number, transactions: any[] }>({ balance: 0, transactions: [] });

   const filteredStudents = students.filter(s =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.studentId.toLowerCase().includes(searchQuery.toLowerCase())
   );

   useEffect(() => {
      if (user?.role === 'admin') loadData();
   }, [user]);

   useEffect(() => {
      if (selectedStudent) {
         document.body.style.overflow = 'hidden';
         document.body.style.paddingRight = 'var(--scrollbar-width, 0px)';
      } else {
         document.body.style.overflow = 'auto';
         document.body.style.paddingRight = '0px';
      }
      return () => {
         document.body.style.overflow = 'auto';
         document.body.style.paddingRight = '0px';
      };
   }, [selectedStudent]);

   useEffect(() => {
      if (selectedStudent) {
         loadStudentSubjects();
         loadFinance();
      }
   }, [selectedStudent]);

   const loadData = async () => {
      const [sRes, subRes] = await Promise.all([api.get('/admin/students'), api.get('/admin/all-subjects')]);
      if (sRes.success) setStudents(sRes.students);
      if (subRes.success) setAllSubjects(subRes.subjects);
   };

   const loadStudentSubjects = async () => {
      if (!selectedStudent) return;
      const res = await api.get(`/courses?userId=${selectedStudent.id}`);
      if (res.success) setSizeEnrolled(res.courses);
   };

   const loadFinance = async () => {
      if (!selectedStudent) return;
      const res = await api.get(`/admin-advanced/financials/${selectedStudent.id}`);
      if (res.success) setStudentFinance({ balance: res.balance.total_balance, transactions: res.transactions });
   };

   const showAlert = (title: string, message: string, type: 'success' | 'info' = 'success') => {
      setModalConfig({ title, message, type, onConfirm: () => setModalOpen(false) });
      setModalOpen(true);
   };

   const handlePurge = () => {
      if (!selectedStudent) return;
      setModalConfig({
         title: 'Purge Institutional Identity',
         message: `WARNING: This action will permanently erase ${selectedStudent.name} from the central record system. This cannot be undone.`,
         type: 'danger',
         onConfirm: async () => {
            setModalOpen(false);
            const res = await api.delete(`/admin/delete-student/${selectedStudent.id}`);
            if (res.success) {
               setSelectedStudent(null);
               loadData();
               showToast('Institutional identity purged from archives.', 'success');
            }
         }
      });
      setModalOpen(true);
   };

   if (user?.role !== 'admin') return <div className="page-content">Access Denied</div>;

   return (
      <>
         {/* Global Fixed Overlays (Outside Animated Layout Shift) */}
         <Modal
            isOpen={modalOpen}
            title={modalConfig.title}
            message={modalConfig.message}
            type={modalConfig.type}
            onConfirm={modalConfig.onConfirm}
            onCancel={() => setModalOpen(false)}
            confirmText="Authorize Protocol"
         />

         {selectedStudent && (
            <div style={{
               position: 'fixed', inset: 0, zIndex: 2000,
               background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(16px)',
               display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
            }}>
               <div className="modern-admin-card animate-pop" style={{
                  width: '100%', maxWidth: 1000, padding: 0,
                  maxHeight: '94vh', display: 'flex', flexDirection: 'column',
                  boxShadow: '0 40px 100px rgba(0,0,0,0.5)', border: 'none', background: '#fff',
                  borderRadius: 40, overflow: 'hidden'
               }}>
                  <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                     <div style={{
                        padding: '40px 40px',
                        background: 'linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)',
                        color: '#fff',
                        position: 'relative',
                        overflow: 'hidden',
                        flexShrink: 0,
                        borderTopLeftRadius: 40, borderTopRightRadius: 40
                     }}>
                        <button onClick={() => setSelectedStudent(null)} style={{
                           position: 'absolute', top: 20, right: 20, background: 'rgba(255,255,255,0.1)',
                           border: 'none', width: 40, height: 40, borderRadius: '50%', color: '#fff',
                           fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10
                        }}>✕</button>

                        <div className="mobile-stack" style={{ display: 'flex', alignItems: 'center', gap: 32, position: 'relative' }}>
                           <div style={{
                              width: 80, height: 80, borderRadius: '50%', border: '4px solid rgba(255,255,255,0.2)',
                              overflow: 'hidden', background: '#fff', flexShrink: 0
                           }}>
                              {selectedStudent.photo_url ? (
                                 <img src={selectedStudent.photo_url} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              ) : (
                                 <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 950, color: '#1e3a5f' }}>
                                    {selectedStudent.name[0]}
                                 </div>
                              )}
                           </div>
                           <div>
                              <h2 style={{ fontSize: 26, fontWeight: 950, letterSpacing: '-1px' }}>{selectedStudent.name}</h2>
                              <div style={{ display: 'flex', gap: 8, marginTop: 8, opacity: 0.7, fontSize: 11, fontWeight: 700 }}>
                                 <span style={{ background: 'rgba(255,255,255,0.1)', padding: '4px 10px', borderRadius: 8 }}>ID: {selectedStudent.studentId}</span>
                                 <span style={{ background: 'rgba(255,255,255,0.1)', padding: '4px 10px', borderRadius: 8 }}>YEAR {selectedStudent.yearLevel}</span>
                                 <span style={{ background: 'rgba(255,255,255,0.1)', padding: '4px 10px', borderRadius: 8 }}>{selectedStudent.course}</span>
                              </div>
                           </div>
                        </div>

                        <div style={{ display: 'flex', gap: 8, marginTop: 32 }}>
                           <button onClick={() => setActiveTab('enroll')} className={`admin-tab-btn ${activeTab === 'enroll' ? 'active' : ''}`}>CURRICULUM</button>
                           <button onClick={() => setActiveTab('grades')} className={`admin-tab-btn ${activeTab === 'grades' ? 'active' : ''}`}>SCHOLASTIC</button>
                           <button onClick={() => { setActiveTab('finance'); loadFinance(); }} className={`admin-tab-btn ${activeTab === 'finance' ? 'active' : ''}`}>FINANCIAL</button>
                           <button onClick={() => setActiveTab('tasks')} className={`admin-tab-btn ${activeTab === 'tasks' ? 'active' : ''}`}>MISSIONS</button>
                           <div style={{ flex: 1 }} />
                           <button onClick={handlePurge} style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', border: '1.5px solid rgba(239, 68, 68, 0.2)', padding: '8px 16px', borderRadius: 12, fontSize: 10, fontWeight: 950, cursor: 'pointer' }}>PURGE RECORD</button>
                        </div>
                     </div>

                     <div className="workbench-scroller" style={{ padding: '40px 60px', background: '#fff', overflowY: 'auto', flex: 1, minHeight: 0 }}>
                        {activeTab === 'enroll' && (
                           <div style={{ textAlign: 'center', padding: '20px 0' }} className="animate-slide-up">
                              <div style={{ fontSize: 80, marginBottom: 24 }}>🎒</div>
                              <h3 style={{ fontSize: 24, fontWeight: 950, color: '#1e293b', marginBottom: 12 }}>Curricular Management Studio</h3>
                              <p style={{ color: '#64748b', maxWidth: 460, margin: '0 auto 40px', lineHeight: 1.6, fontWeight: 600, fontSize: 15 }}>Adjust the academic specifications, departmental load, and subject assignments for this identity profile.</p>
                              <button onClick={() => router.push(`/admin/students/manage-subjects?id=${selectedStudent.id}`)} className="admin-workbench-btn" style={{ padding: '20px 50px', fontSize: 13 }}>AUTHORIZE LOAD UPDATE</button>
                           </div>
                        )}

                        {activeTab === 'grades' && (
                           <div className="animate-slide-up" style={{ maxWidth: 640, margin: '0 auto' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 40 }}>
                                 <div style={{ width: 50, height: 50, borderRadius: 16, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>🎓</div>
                                 <div>
                                    <h3 style={{ fontSize: 22, fontWeight: 950, color: '#1e293b' }}>Scholastic Performance Integration</h3>
                                    <p style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>Synchronize academic achievements with the central system.</p>
                                 </div>
                              </div>
                              <form onSubmit={(e) => { e.preventDefault(); api.post('/admin/set-grade', { ...gradeData, userId: selectedStudent.id }).then((r) => r.success ? showToast('Performance data integrated.', 'success') : showToast(r.message, 'error')); }} style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
                                 <div className="admin-form-group">
                                    <label>Target Academic Load</label>
                                    <div style={{ position: 'relative' }}>
                                       <div
                                          onClick={() => setDropdownOpen(!dropdownOpen)}
                                          style={{ padding: '18px 24px', borderRadius: 16, border: '2.5px solid #edf2f7', background: '#f8fafc', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                       >
                                          <span style={{ fontWeight: 800, color: gradeData.courseName ? '#1e3a5f' : '#94a3b8' }}>
                                             {gradeData.courseName || '-- SELECT STRATEGIC SUBJECT --'}
                                          </span>
                                          <span style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'none', transition: '0.3s' }}>▼</span>
                                       </div>
                                       {dropdownOpen && (
                                          <div style={{
                                             position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100,
                                             marginTop: 12, borderRadius: 20, background: '#fff', border: '1.5px solid #f1f5f9',
                                             maxHeight: 240, overflowY: 'auto', boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                                             display: 'flex', flexDirection: 'column', padding: 12, gap: 4
                                          }}>
                                             <input
                                                placeholder="Filter identities..."
                                                autoFocus
                                                style={{ padding: '12px 16px', borderRadius: 10, border: '1.5px solid #f1f5f9', fontSize: 13, fontWeight: 700, marginBottom: 8, outline: 'none' }}
                                                value={subjectSearch}
                                                onChange={(e) => setSubjectSearch(e.target.value)}
                                                onClick={(e) => e.stopPropagation()}
                                             />
                                             {studentEnrolled.filter(s => s.name.toLowerCase().includes(subjectSearch.toLowerCase())).map(s => (
                                                <div
                                                   key={s.id}
                                                   onClick={(e) => { e.stopPropagation(); setGradeData({ ...gradeData, courseName: s.name }); setDropdownOpen(false); }}
                                                   style={{
                                                      padding: '12px 16px', borderRadius: 12, cursor: 'pointer',
                                                      background: gradeData.courseName === s.name ? '#eff6ff' : 'transparent',
                                                      color: gradeData.courseName === s.name ? '#1e3a5f' : '#64748b',
                                                      fontWeight: 800, fontSize: 13, transition: '0.2s'
                                                   }}
                                                   className="subject-opt"
                                                >
                                                   {s.name}
                                                </div>
                                             ))}
                                          </div>
                                       )}
                                    </div>
                                 </div>
                                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                                    <div className="admin-form-group"><label>Grade Points (GPA)</label><input required value={gradeData.grade} onChange={e => setGradeData({ ...gradeData, grade: e.target.value })} /></div>
                                    <div className="admin-form-group">
                                       <label>Performance Percentage (%)</label>
                                       <input required value={gradeData.score} onChange={e => setGradeData({ ...gradeData, score: e.target.value, status: parseFloat(e.target.value) < 75 ? 'Failed' : 'Passed' })} />
                                    </div>
                                 </div>
                                 <button type="submit" className="admin-workbench-btn" style={{ width: '100%', marginTop: 8 }}>SYNCHRONIZE RECORD</button>
                              </form>
                           </div>
                        )}

                        {activeTab === 'finance' && (
                           <div className="animate-slide-up">
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }}>
                                 <div>
                                    <div style={{
                                       background: '#eff6ff', padding: 24, borderRadius: 24, border: '2px solid #dbeafe',
                                       marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                    }}>
                                       <div>
                                          <div style={{ fontSize: 10, fontWeight: 900, color: '#3b82f6', textTransform: 'uppercase', marginBottom: 4 }}>Current Institutional Balance</div>
                                          <div style={{ fontSize: 32, fontWeight: 950, color: '#1e3a5f' }}>₱ {studentFinance.balance.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</div>
                                       </div>
                                       <div style={{ fontSize: 32 }}>🏦</div>
                                    </div>
                                    <h4 className="admin-sublabel" style={{ marginBottom: 16 }}>Audit Trail</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                       {studentFinance.transactions.slice(0, 4).map((tx: any) => (
                                          <div key={tx.id} style={{ background: '#fff', padding: 12, borderRadius: 16, border: '1.5px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                             <div>
                                                <div style={{ fontWeight: 900, fontSize: 13 }}>₱ {parseFloat(tx.amount).toLocaleString()}</div>
                                                <div style={{ fontSize: 9, fontWeight: 700, color: '#94a3b8' }}>{new Date(tx.payment_date).toLocaleDateString()}</div>
                                             </div>
                                             <div style={{ fontSize: 9, fontWeight: 950, color: '#cbd5e1' }}>#{tx.reference_no.slice(-6)}</div>
                                          </div>
                                       ))}
                                    </div>
                                 </div>
                                 <div style={{ background: '#f8fafc', padding: 32, borderRadius: 24, border: '1.5px solid #edf2f7', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                    <div style={{ fontSize: 48, marginBottom: 16 }}>💳</div>
                                    <h4 style={{ fontWeight: 950, fontSize: 20, marginBottom: 12 }}>Financial Desk</h4>
                                    <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5, marginBottom: 24, fontWeight: 600 }}>Authenticate via the Global Financial Desk to manage balances.</p>
                                    <button onClick={() => router.push(`/admin/finance?id=${selectedStudent.id}`)} className="admin-workbench-btn" style={{ width: '100%', background: '#1e3a5f' }}>OPEN DESK</button>
                                 </div>
                              </div>
                           </div>
                        )}

                        {activeTab === 'tasks' && (
                           <div style={{ textAlign: 'center', padding: '20px 0' }} className="animate-slide-up">
                              <div style={{ fontSize: 80, marginBottom: 24 }}>🚀</div>
                              <h3 style={{ fontSize: 24, fontWeight: 950, color: '#111827', marginBottom: 12 }}>Mission Dispatch Hub</h3>
                              <p style={{ color: '#64748b', maxWidth: 460, margin: '0 auto 40px', lineHeight: 1.6, fontWeight: 600, fontSize: 15 }}>Issue tactical academic requirements and track mission completion status for this record.</p>
                              <button onClick={() => router.push(`/admin/tasks?id=${selectedStudent.id}`)} className="admin-workbench-btn" style={{ background: '#0369a1', padding: '20px 50px' }}>AUTHORIZE DISPATCH</button>
                           </div>
                        )}
                     </div>
                  </div>
               </div>
            </div>
         )}

         <div className="animate-in" style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: 100 }}>
            <Topbar title="Identity Management Console" subtitle="Strategic oversight of institutional records and scholastic flows." />

            <main className="page-content" style={{ maxWidth: 1600, margin: '0 auto', padding: '0 20px' }}>
               <div className="modern-admin-card" style={{ padding: '24px 20px' }}>
                  <div className="mobile-stack" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, gap: 20 }}>
                     <h2 style={{ fontSize: 28, fontWeight: 950, color: '#1e3a5f', letterSpacing: '-1.5px' }}>Identity Archives</h2>
                     <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                        <button onClick={() => router.push('/admin/students/registration')} className="admin-action-btn primary" style={{ flexDirection: 'row', padding: '12px 20px' }}>
                           <span>👤 Admit New Student</span>
                        </button>
                        <button onClick={() => router.push('/admin/student-registry')} className="admin-action-btn secondary" style={{ flexDirection: 'row', padding: '12px 20px' }}>
                           <span>📁 Full Registry Archive</span>
                        </button>
                     </div>
                  </div>

                  <div style={{ position: 'relative', marginBottom: 32 }}>
                     <input
                        className="admin-search-input"
                        placeholder="Search by name or ID..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        style={{ padding: '20px 20px 20px 60px', fontSize: 16, borderRadius: 20 }}
                     />
                     <span style={{ position: 'absolute', left: 22, top: '50%', transform: 'translateY(-50%)', fontSize: 20, opacity: 0.3 }}>🔍</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                     <h3 className="admin-sublabel">Registry Directory</h3>
                     <span style={{ fontSize: 10, fontWeight: 950, color: '#1e3a5f', background: '#eff6ff', padding: '4px 12px', borderRadius: 99 }}>{filteredStudents.length} ACTIVE</span>
                  </div>

                  <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                     {filteredStudents.map(s => (
                        <div key={s.id} onClick={() => setSelectedStudent(s)} className={`admin-registry-item-card ${selectedStudent?.id === s.id ? 'active' : ''}`}>
                           <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#f1f5f9', color: '#1e3a5f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 950 }}>
                              {s.name[0]}
                           </div>
                           <div style={{ flex: 1 }}>
                              <div className="name" style={{ fontSize: 18 }}>{s.name}</div>
                              <div className="meta" style={{ fontSize: 13 }}>{s.studentId} • {s.course}</div>
                           </div>
                           <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}>→</div>
                        </div>
                     ))}
                  </div>
               </div>
            </main>
         </div>

         <style jsx>{`
            .modern-admin-card { background: #fff; border-radius: 40px; border: 1.5px solid #edf2f7; box-shadow: 0 10px 30px rgba(0,0,0,0.02); }
            
            .admin-action-btn { 
               display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 24px; border-radius: 20px;
               border: none; cursor: pointer; transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
               font-size: 11px; fontWeight: 900; textTransform: uppercase; letter-spacing: 0.5px;
            }
            .admin-action-btn.primary { background: #1e3a5f; color: #fff; box-shadow: 0 10px 20px rgba(30,58,95,0.2); }
            .admin-action-btn.secondary { background: #f8fafc; color: #1e3a5f; border: 1.5px solid #edf2f7; }
            .admin-action-btn:hover { transform: translateY(-6px); box-shadow: 0 15px 30px rgba(0,0,0,0.1); }

            .admin-search-input {
               width: 100%; padding: 18px 24px 18px 54px; border-radius: 20px; border: 2px solid #edf2f7;
               background: #f8fafc; font-weight: 700; font-size: 15px; outline: none; transition: 0.3s;
            }
            .admin-search-input:focus { border-color: #1e3a5f; background: #fff; box-shadow: 0 0 0 5px rgba(30,58,95,0.05); }

            .admin-sublabel { font-size: 11px; fontWeight: 900; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.2px; }
            
            .admin-registry-item-card {
                display: flex; align-items: center; gap: 20px; padding: 24px; border-radius: 32px;
                cursor: pointer; transition: 0.3s; background: #fff; border: 1.5px solid #f1f5f9;
            }
            .admin-registry-item-card:hover { transform: translateY(-8px); border-color: #3b82f6; box-shadow: 0 20px 40px rgba(0,0,0,0.05); }
            .admin-registry-item-card .name { font-weight: 900; color: #1e293b; }
            .admin-registry-item-card .meta { fontWeight: 700; color: #94a3b8; margin-top: 4px; }

            .admin-tab-btn {
               padding: 10px 20px; border-radius: 12px; border: none; background: rgba(255,255,255,0.06);
               color: #fff; font-weight: 900; font-size: 10px; cursor: pointer; transition: 0.3s; letter-spacing: 0.5px;
            }
            .admin-tab-btn:hover { background: rgba(255,255,255,0.12); }
            .admin-tab-btn.active { background: #fff; color: #1e3a5f; }

            .admin-workbench-btn {
               padding: 20px 40px; border-radius: 18px; border: none; background: #1e3a5f; color: #fff;
               font-weight: 950; font-size: 13px; text-transform: uppercase; cursor: pointer;
               transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); letter-spacing: 1px;
            }
            .admin-workbench-btn:hover { transform: scale(1.03); filter: brightness(1.2); box-shadow: 0 15px 35px rgba(30,58,95,0.25); }

            .admin-form-group { display: flex; flex-direction: column; gap: 10px; }
            .admin-form-group label { font-size: 11px; fontWeight: 900; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; }
            .admin-form-group input, .admin-form-group select {
               padding: 18px; border-radius: 16px; border: 2px solid #edf2f7; background: #f8fafc; font-weight: 700; outline: none; transition: 0.3s; font-size: 14px;
            }
            .admin-form-group input:focus, .admin-form-group select:focus { border-color: #3b82f6; background: #fff; box-shadow: 0 0 0 6px rgba(59,130,246,0.04); }

            @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
            .animate-slide-up { animation: slideUp 0.5s cubic-bezier(0, 0, 0.2, 1); }
            @keyframes pop { from { opacity: 0; transform: scale(0.9) translateY(40px); } to { opacity: 1; transform: scale(1) translateY(0); } }
            .animate-pop { animation: pop 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275); }

            .workbench-scroller::-webkit-scrollbar { width: 6px; }
            .workbench-scroller::-webkit-scrollbar-track { background: transparent; }
            .workbench-scroller::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
            .workbench-scroller::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
            .workbench-scroller { scrollbar-width: thin; scrollbar-color: #e2e8f0 transparent; }
         `}</style>
      </>
   );
}
