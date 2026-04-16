'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Topbar from '@/components/Topbar/Topbar';
import { api } from '@/lib/api';

interface Student {
    id: number;
    name: string;
    studentId: string;
    course: string;
    yearLevel: number;
    semester: number;
    email: string;
    gpa: number;
    phone: string;
}

export default function StudentRegistry() {
    const { user } = useAuth();
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

    useEffect(() => {
        loadStudents();
    }, []);

    const loadStudents = async () => {
        try {
            const res = await api.get('/admin/students');
            if (res.success) setStudents(res.students);
        } catch (err) {
            console.error('Failed to load students:', err);
        } finally {
            setLoading(false);
        }
    };

    const filtered = students.filter(s => {
        const q = searchQuery.toLowerCase();
        return s.name.toLowerCase().includes(q) ||
            s.studentId.toLowerCase().includes(q) ||
            s.course.toLowerCase().includes(q) ||
            s.email.toLowerCase().includes(q);
    });

    if (user?.role !== 'admin') return <div className="page-content">Access Denied</div>;

    return (
        <div className="animate-in">
            <Topbar title="Institutional Student Registry" subtitle="Complete directory of all admitted students across all academic programs." />

            <main className="page-content">

                {/* Filters & Search */}
                <div style={{ display: 'flex', gap: 12, marginBottom: 32, alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: 300 }}>
                        <input
                            className="form-input"
                            style={{ paddingLeft: 40 }}
                            placeholder="🔍 Search by name, ID, course, or email..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: 4, background: 'var(--secondary)', borderRadius: 10, padding: 4 }}>
                        <button
                            onClick={() => setViewMode('table')}
                            style={{
                                padding: '8px 16px', borderRadius: 8, fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer',
                                background: viewMode === 'table' ? 'var(--primary)' : 'transparent',
                                color: viewMode === 'table' ? '#fff' : 'var(--text-muted)',
                            }}
                        >
                            Table View
                        </button>
                        <button
                            onClick={() => setViewMode('cards')}
                            style={{
                                padding: '8px 16px', borderRadius: 8, fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer',
                                background: viewMode === 'cards' ? 'var(--primary)' : 'transparent',
                                color: viewMode === 'cards' ? '#fff' : 'var(--text-muted)',
                            }}
                        >
                            Gallery View
                        </button>
                    </div>

                    <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--primary)' }}>
                        Institutional Headcount: {filtered.length}
                    </div>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: 80, opacity: 0.5 }}>
                        <div className="spinner" style={{ margin: '0 auto 16px' }} />
                        Retrieving admissions records...
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', padding: 80, opacity: 0.5 }}>
                        <div style={{ fontSize: 48, marginBottom: 16 }}>📁</div>
                        <h3 style={{ fontSize: 16, fontWeight: 800 }}>No Student Records Identified</h3>
                        <p style={{ fontSize: 13 }}>Adjust your search parameters or initiate a new student admission.</p>
                    </div>
                ) : viewMode === 'table' ? (
                    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ background: '#f8fafc', borderBottom: '2px solid var(--divider)' }}>
                                        <th style={{ padding: '16px 20px', fontSize: 11, fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase' }}>Portal ID</th>
                                        <th style={{ padding: '16px 20px', fontSize: 11, fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase' }}>Full Name</th>
                                        <th style={{ padding: '16px 20px', fontSize: 11, fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase' }}>Bachelor Program</th>
                                        <th style={{ padding: '16px 20px', fontSize: 11, fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', textAlign: 'center' }}>Level</th>
                                        <th style={{ padding: '16px 20px', fontSize: 11, fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase' }}>Institutional Email</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((s, i) => (
                                        <tr key={s.id} style={{ borderBottom: '1px solid var(--divider)', background: i % 2 === 0 ? 'transparent' : '#f9fafb08' }}>
                                            <td style={{ padding: '14px 20px', fontSize: 13, fontWeight: 800, color: 'var(--primary)' }}>{s.studentId}</td>
                                            <td style={{ padding: '14px 20px', fontSize: 14, fontWeight: 700 }}>{s.name}</td>
                                            <td style={{ padding: '14px 20px', fontSize: 13, fontWeight: 600 }}>{s.course}</td>
                                            <td style={{ padding: '14px 20px', fontSize: 13, fontWeight: 700, textAlign: 'center' }}>Yr {s.yearLevel}</td>
                                            <td style={{ padding: '14px 20px', fontSize: 12, color: 'var(--text-muted)' }}>{s.email}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
                        {filtered.map(s => (
                            <div key={s.id} className="card animate-in" style={{ padding: 24, display: 'flex', gap: 20, alignItems: 'center' }}>
                                <div style={{ width: 64, height: 64, background: 'var(--secondary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 900, color: 'var(--primary)' }}>
                                    {s.name[0]}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 11, fontWeight: 900, color: 'var(--primary)', marginBottom: 2 }}>{s.studentId}</div>
                                    <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 4 }}>{s.name}</div>
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>{s.course}</div>
                                    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                                        <span style={{ fontSize: 10, fontWeight: 800, background: 'var(--secondary)', padding: '2px 8px', borderRadius: 4 }}>Yr {s.yearLevel}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

            </main>
        </div>
    );
}
