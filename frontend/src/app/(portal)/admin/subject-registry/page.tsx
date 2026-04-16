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
    day: string;
    timeStart: string;
    timeEnd: string;
    room: string;
}

const DAYS_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function SubjectRegistry() {
    const { user } = useAuth();
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'major' | 'minor'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards');

    useEffect(() => {
        loadSubjects();
    }, []);

    const loadSubjects = async () => {
        try {
            const res = await api.get('/admin/all-subjects');
            if (res.success) setSubjects(res.subjects);
        } catch (err) {
            console.error('Failed to load subjects:', err);
        } finally {
            setLoading(false);
        }
    };

    const filtered = subjects.filter(s => {
        if (filter !== 'all' && s.type !== filter) return false;
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            return s.code.toLowerCase().includes(q) || s.name.toLowerCase().includes(q) || s.teacher.toLowerCase().includes(q) || (s.room || '').toLowerCase().includes(q);
        }
        return true;
    });

    const majorCount = subjects.filter(s => s.type === 'major').length;
    const minorCount = subjects.filter(s => s.type === 'minor').length;

    if (user?.role !== 'admin') return <div className="page-content">Access Denied</div>;

    return (
        <div className="animate-in">
            <Topbar title="Subject Registry" subtitle="Complete institutional curriculum catalog — all major and minor subject offerings." />

            <main className="page-content">

                {/* Stats Bar */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
                    <div className="card" style={{ textAlign: 'center', padding: '20px 16px', cursor: 'pointer', border: filter === 'all' ? '2px solid var(--primary)' : '1px solid var(--divider)' }} onClick={() => setFilter('all')}>
                        <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--primary)' }}>{subjects.length}</div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Subjects</div>
                    </div>
                    <div className="card" style={{ textAlign: 'center', padding: '20px 16px', cursor: 'pointer', border: filter === 'major' ? '2px solid #3b82f6' : '1px solid var(--divider)' }} onClick={() => setFilter('major')}>
                        <div style={{ fontSize: 28, fontWeight: 900, color: '#3b82f6' }}>{majorCount}</div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Major Subjects</div>
                    </div>
                    <div className="card" style={{ textAlign: 'center', padding: '20px 16px', cursor: 'pointer', border: filter === 'minor' ? '2px solid #8b5cf6' : '1px solid var(--divider)' }} onClick={() => setFilter('minor')}>
                        <div style={{ fontSize: 28, fontWeight: 900, color: '#8b5cf6' }}>{minorCount}</div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Minor / GE Subjects</div>
                    </div>
                </div>

                {/* Search + View Toggle */}
                <div style={{ display: 'flex', gap: 12, marginBottom: 24, alignItems: 'center', flexWrap: 'wrap' }}>
                    <input
                        className="form-input"
                        style={{ flex: 1, minWidth: 200 }}
                        placeholder="🔍 Search by code, name, instructor, or room..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                    <div style={{ display: 'flex', gap: 4, background: 'var(--secondary)', borderRadius: 10, padding: 4 }}>
                        <button
                            onClick={() => setViewMode('cards')}
                            style={{
                                padding: '8px 16px', borderRadius: 8, fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer',
                                background: viewMode === 'cards' ? 'var(--primary)' : 'transparent',
                                color: viewMode === 'cards' ? '#fff' : 'var(--text-muted)',
                            }}
                        >
                            Cards
                        </button>
                        <button
                            onClick={() => setViewMode('table')}
                            style={{
                                padding: '8px 16px', borderRadius: 8, fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer',
                                background: viewMode === 'table' ? 'var(--primary)' : 'transparent',
                                color: viewMode === 'table' ? '#fff' : 'var(--text-muted)',
                            }}
                        >
                            Table
                        </button>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)' }}>
                        Showing {filtered.length} of {subjects.length}
                    </div>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
                        <div className="spinner" style={{ margin: '0 auto 16px' }} />
                        Loading institutional curriculum...
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
                        No subjects match your search criteria.
                    </div>
                ) : viewMode === 'cards' ? (
                    /* ═══════════════ CARDS VIEW ═══════════════ */
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
                        {filtered.map(s => (
                            <div key={s.id} className="card animate-in" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {/* Header */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <div style={{ fontSize: 11, fontWeight: 900, color: 'var(--primary)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>{s.code}</div>
                                        <div style={{ fontSize: 16, fontWeight: 800, lineHeight: 1.3 }}>{s.name}</div>
                                    </div>
                                    <span
                                        style={{
                                            padding: '4px 10px',
                                            borderRadius: 20,
                                            fontSize: 9,
                                            fontWeight: 800,
                                            textTransform: 'uppercase',
                                            letterSpacing: 0.5,
                                            background: s.type === 'major' ? '#3b82f620' : '#8b5cf620',
                                            color: s.type === 'major' ? '#3b82f6' : '#8b5cf6',
                                            border: `1px solid ${s.type === 'major' ? '#3b82f640' : '#8b5cf640'}`,
                                        }}
                                    >
                                        {s.type}
                                    </span>
                                </div>

                                {/* Divider */}
                                <div style={{ height: 1, background: 'var(--divider)' }} />

                                {/* Details Grid */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                    <div>
                                        <div style={{ fontSize: 9, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 2 }}>Instructor</div>
                                        <div style={{ fontSize: 13, fontWeight: 700 }}>{s.teacher}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 9, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 2 }}>Units</div>
                                        <div style={{ fontSize: 13, fontWeight: 700 }}>{s.units}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 9, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 2 }}>Schedule</div>
                                        <div style={{ fontSize: 13, fontWeight: 700 }}>{s.day || '—'}</div>
                                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.timeStart && s.timeEnd ? `${s.timeStart} – ${s.timeEnd}` : 'TBA'}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 9, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 2 }}>Room</div>
                                        <div style={{ fontSize: 13, fontWeight: 700 }}>{s.room || 'TBA'}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    /* ═══════════════ TABLE VIEW ═══════════════ */
                    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ background: '#f8fafc', borderBottom: '2px solid var(--divider)' }}>
                                        <th style={{ padding: '14px 16px', fontSize: 11, fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase' }}>Type</th>
                                        <th style={{ padding: '14px 16px', fontSize: 11, fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase' }}>Code</th>
                                        <th style={{ padding: '14px 16px', fontSize: 11, fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase' }}>Subject Name</th>
                                        <th style={{ padding: '14px 16px', fontSize: 11, fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase' }}>Instructor</th>
                                        <th style={{ padding: '14px 16px', fontSize: 11, fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase' }}>Day</th>
                                        <th style={{ padding: '14px 16px', fontSize: 11, fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase' }}>Time</th>
                                        <th style={{ padding: '14px 16px', fontSize: 11, fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase' }}>Room</th>
                                        <th style={{ padding: '14px 16px', fontSize: 11, fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', textAlign: 'center' }}>Units</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((s, i) => (
                                        <tr key={s.id} style={{ borderBottom: '1px solid var(--divider)', background: i % 2 === 0 ? 'transparent' : '#f9fafb08' }}>
                                            <td style={{ padding: '12px 16px' }}>
                                                <span style={{
                                                    padding: '3px 8px', borderRadius: 12, fontSize: 9, fontWeight: 800, textTransform: 'uppercase',
                                                    background: s.type === 'major' ? '#3b82f620' : '#8b5cf620',
                                                    color: s.type === 'major' ? '#3b82f6' : '#8b5cf6',
                                                }}>
                                                    {s.type}
                                                </span>
                                            </td>
                                            <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 800, color: 'var(--primary)' }}>{s.code}</td>
                                            <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 700 }}>{s.name}</td>
                                            <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text-muted)' }}>{s.teacher}</td>
                                            <td style={{ padding: '12px 16px', fontSize: 12, fontWeight: 700 }}>{s.day || '—'}</td>
                                            <td style={{ padding: '12px 16px', fontSize: 12, fontWeight: 600 }}>{s.timeStart && s.timeEnd ? `${s.timeStart} – ${s.timeEnd}` : 'TBA'}</td>
                                            <td style={{ padding: '12px 16px', fontSize: 12, fontWeight: 700 }}>{s.room || 'TBA'}</td>
                                            <td style={{ padding: '12px 16px', fontSize: 14, fontWeight: 800, textAlign: 'center' }}>{s.units}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

            </main>
        </div>
    );
}
