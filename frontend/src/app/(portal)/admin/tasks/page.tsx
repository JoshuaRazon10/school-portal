'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Topbar from '@/components/Topbar/Topbar';
import { api } from '@/lib/api';
import { useSearchParams } from 'next/navigation';

interface Task {
    id: number;
    student_name: string;
    student_id: string;
    title: string;
    course_code: string;
    due_date: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'pending' | 'in-progress' | 'submitted';
}

export default function AdminTasks() {
    const { user } = useAuth();
    const searchParams = useSearchParams();
    const filterId = searchParams.get('id');
    const [tasks, setTasks] = useState<Task[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState<{ show: boolean; title: string; msg: string; type: 'success' | 'danger' }>({
        show: false, title: '', msg: '', type: 'success'
    });

    // New Task Form
    const [newTask, setNewTask] = useState({
        subjectId: '',
        title: '',
        dueDate: 'Next Friday',
        priority: 'medium'
    });

    useEffect(() => {
        loadData();
    }, []);

    const showAlert = (title: string, msg: string, type: 'success' | 'danger') => {
        setAlert({ show: true, title, msg, type });
        setTimeout(() => setAlert(prev => ({ ...prev, show: false })), 4000);
    };

    const loadData = async () => {
        setLoading(true);
        const [tRes, sRes] = await Promise.all([
            api.get('/admin/all-tasks'),
            api.get('/admin/all-subjects')
        ]);
        if (tRes.success) setTasks(tRes.tasks);
        if (sRes.success) setSubjects(sRes.subjects);
        setLoading(false);
    };

    const handleDispatch = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await api.post('/admin/assign-task-course', newTask);
            if (res.success) {
                setNewTask({ ...newTask, title: '', subjectId: '' });
                loadData();
                showAlert('Mission Dispatched', res.message, 'success');
            } else {
                showAlert('Dispatch Failed', res.message, 'danger');
            }
        } catch (err: any) {
            showAlert('Operational Error', err.response?.data?.message || 'Network protocol failure.', 'danger');
        }
    };

    const filteredTasks = filterId ? tasks.filter(t => t.student_id === filterId) : tasks;

    if (user?.role !== 'admin') return <div className="page-content">Access Denied</div>;

    return (
        <div className="animate-in" style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: 100 }}>
            <Topbar title="Institutional Mission Center" subtitle="Targeted academic requirement dispatch and class-wide mission oversight." />

            {alert.show && (
                <div style={{ position: 'fixed', top: 40, right: 40, zIndex: 1000, background: alert.type === 'success' ? '#ecfdf5' : '#fef2f2', border: '2px solid ' + (alert.type === 'success' ? '#10b981' : '#ef4444'), borderRadius: 24, padding: '24px 32px', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', minWidth: 400 }} className="animate-slide-up">
                    <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                        <div style={{ fontSize: 32 }}>{alert.type === 'success' ? '🛡️' : '⚠️'}</div>
                        <div>
                            <div style={{ fontSize: 16, fontWeight: 950, color: alert.type === 'success' ? '#065f46' : '#991b1b', textTransform: 'uppercase', letterSpacing: 0.5 }}>{alert.title}</div>
                            <div style={{ fontSize: 13, color: alert.type === 'success' ? '#065f46' : '#991b1b', fontWeight: 600, opacity: 0.8, marginTop: 4 }}>{alert.msg}</div>
                        </div>
                    </div>
                </div>
            )}

            <main className="page-content" style={{ maxWidth: 1200, margin: '0 auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: 40, alignItems: 'start' }}>

                    {/* Left: Task Archives */}
                    <div className="glass-card workbench-scroller" style={{ padding: 40, borderRadius: 24, background: '#fff', height: '75vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
                            <h2 style={{ fontSize: 24, fontWeight: 950, letterSpacing: '-0.5px' }}>Institutional Audit Ledger</h2>
                            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)', background: '#eff6ff', padding: '6px 12px', borderRadius: 20 }}>
                                {filteredTasks.length} Dispatched Missions
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {filteredTasks.map(task => (
                                <div key={task.id} className="task-row">
                                    <div className="task-status-pill" style={{ background: task.priority === 'urgent' ? '#fef2f2' : '#f0f9ff' }}>
                                        {task.priority === 'urgent' ? '🔥' : '📄'}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <span style={{ fontSize: 11, fontWeight: 850, color: 'var(--primary)', opacity: 0.6 }}>{task.course_code}</span>
                                            <span style={{ fontSize: 13, fontWeight: 900, color: '#1e293b' }}>{task.title}</span>
                                        </div>
                                        <div style={{ display: 'flex', gap: 12, marginTop: 4, fontSize: 11, fontWeight: 700, color: '#94a3b8' }}>
                                            <span style={{ color: '#1e3a5f' }}>{task.student_name}</span>
                                            <span>•</span>
                                            <span>Due: {task.due_date}</span>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <span className={`badge ${task.status === 'submitted' ? 'badge-success' : 'badge-primary'}`} style={{ textTransform: 'uppercase', fontSize: 10, letterSpacing: 1 }}>{task.status}</span>
                                    </div>
                                </div>
                            ))}
                            {filteredTasks.length === 0 && (
                                <div style={{ textAlign: 'center', padding: '120px 0', opacity: 0.3 }}>
                                    <div style={{ fontSize: 80, marginBottom: 20 }}>🛰️</div>
                                    <h3 style={{ fontSize: 20, fontWeight: 800 }}>No Active Missions Found</h3>
                                    <p>Assign a task using the dispatch console to begin tracking.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Dispatch Console */}
                    <div style={{ position: 'sticky', top: 120 }}>
                        <div className="glass-card" style={{ padding: 40, borderRadius: 28, background: '#1e3a5f', color: '#fff', boxShadow: '0 20px 50px rgba(30,58,95,0.25)' }}>
                            <h3 style={{ fontSize: 22, fontWeight: 950, marginBottom: 32, letterSpacing: '-0.5px' }}>Mission Dispatcher</h3>
                            <form onSubmit={handleDispatch} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

                                <div className="dispatch-group">
                                    <label>Target Curriculum Load (Class Batch)</label>
                                    <select required value={newTask.subjectId} onChange={e => setNewTask({ ...newTask, subjectId: e.target.value })}>
                                        <option value="">-- Choose Subject Group --</option>
                                        {subjects.map(s => <option key={s.id} value={s.id}>{s.code} · {s.name}</option>)}
                                    </select>
                                    <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 6 }}>* Dispatches mission to all students currently enrolled in this subject.</p>
                                </div>

                                <div className="dispatch-group">
                                    <label>Mission Headline</label>
                                    <input placeholder="e.g. FINAL THESIS PROPOSAL" value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value.toUpperCase() })} style={{ fontSize: 15, fontWeight: 800, textTransform: 'uppercase' }} />
                                </div>

                                <div className="grid-2" style={{ gap: 16 }}>
                                    <div className="dispatch-group">
                                        <label>Priority Protocol</label>
                                        <select value={newTask.priority} onChange={e => setNewTask({ ...newTask, priority: e.target.value as any })}>
                                            <option value="low">Standard</option>
                                            <option value="medium">Important</option>
                                            <option value="high">Critical</option>
                                            <option value="urgent">Urgent Ops</option>
                                        </select>
                                    </div>
                                    <div className="dispatch-group">
                                        <label>Deadline Clearance</label>
                                        <input value={newTask.dueDate} onChange={e => setNewTask({ ...newTask, dueDate: e.target.value })} />
                                    </div>
                                </div>

                                <button type="submit" className="btn-dispatch" style={{ marginTop: 12 }}>
                                    🚀 Authorize Mass Dispatch
                                </button>
                            </form>
                        </div>
                    </div>

                </div>
            </main>

            <style jsx>{`
            .task-row {
               display: flex; alignItems: center; gap: 20px; padding: 16px 24px; border-radius: 20px;
               border: 1.5px solid #f8fafc; background: #fff; transition: all 0.3s;
            }
            .task-row:hover { transform: translateX(12px); border-color: #e2e8f0; background: #fafbfc; box-shadow: 0 4px 15px rgba(0,0,0,0.02); }
            .task-status-pill { width: 54px; height: 54px; border-radius: 50%; display: flex; alignItems: center; justifyContent: center; fontSize: 26px; flex-shrink: 0; }
            
            .dispatch-group { display: flex; flex-direction: column; gap: 10px; }
            .dispatch-group label { fontSize: 11px; fontWeight: 900; color: rgba(255,255,255,0.6); textTransform: uppercase; letterSpacing: 1.2px; }
            .dispatch-group input, .dispatch-group select {
               padding: 18px 20px; border-radius: 16px; border: 1.5px solid rgba(255,255,255,0.15);
               background: rgba(0,0,0,0.1); color: #fff; font-weight: 700; font-size: 14px; outline: none; transition: 0.3s;
            }
            .dispatch-group input:focus, .dispatch-group select:focus { border-color: #fff; background: rgba(0,0,0,0.2); }
            .dispatch-group input::placeholder { color: rgba(255,255,255,0.25); }
            .dispatch-group select option { background: #1e3a5f; color: #fff; }
            
            .btn-dispatch {
               padding: 22px; border-radius: 18px; border: none;
               background: #fff; color: #1e3a5f; font-weight: 950; font-size: 14px;
               text-transform: uppercase; letter-spacing: 1px;
               cursor: pointer; transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
               box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            }
            .btn-dispatch:hover { transform: translateY(-5px) scale(1.02); box-shadow: 0 15px 40px rgba(255,255,255,0.2); filter: brightness(1.05); }

            @keyframes pop { from { opacity: 0; transform: scale(0.9) translateY(40px); } to { opacity: 1; transform: scale(1) translateY(0); } }
            .animate-pop { animation: pop 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275); }

            .workbench-scroller::-webkit-scrollbar { display: none; }
            .workbench-scroller { -ms-overflow-style: none; scrollbar-width: none; }
         `}</style>
        </div>
    );
}
