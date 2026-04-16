'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Topbar from '@/components/Topbar/Topbar';
import { api } from '@/lib/api';

interface Student {
    id: number;
    name: string;
    student_id: string; // Wait, API returns studentId or student_id?
    studentId: string;
    course: string;
    yearLevel: number;
    gpa: number;
}

export default function ScholasticRankings() {
    const { user } = useAuth();
    const [students, setStudents] = useState<Student[]>([]);
    const [courses, setCourses] = useState<string[]>([]);
    const [selectedCourse, setSelectedCourse] = useState<string>('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const res = await api.get('/admin/students');
        if (res.success) {
            setStudents(res.students);
            const uniqueCourses = Array.from(new Set(res.students.map((s: any) => s.course))) as string[];
            setCourses(uniqueCourses);
        }
        setLoading(false);
    };

    const filteredDetails = students
        .filter(s => selectedCourse === 'all' || s.course === selectedCourse)
        .sort((a, b) => b.gpa - a.gpa);

    const topThree = filteredDetails.slice(0, 3);

    if (user?.role !== 'admin') return <div className="page-content">Access Denied</div>;
    if (loading) return <div className="spinner"></div>;

    return (
        <div className="animate-in" style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: 100 }}>
            <Topbar title="Scholastic Achievement Archives" subtitle="Hierarchical student ranking based on institutional scholastic metrics." />

            <main className="page-content" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 40px' }}>

                {/* Tactical Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 60 }}>
                    <div>
                        <h1 style={{ fontSize: 42, fontWeight: 950, letterSpacing: '-2px', color: '#1e3a5f', marginBottom: 8 }}>Hall of Fame</h1>
                        <p style={{ color: '#94a3b8', fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: 1.5 }}>
                            Academic High Performers · {selectedCourse === 'all' ? 'Institutional Wide' : selectedCourse}
                        </p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <label style={{ fontSize: 10, fontWeight: 900, color: '#1e3a5f', textTransform: 'uppercase', textAlign: 'right' }}>Program Filter</label>
                        <select
                            style={{
                                padding: '16px 24px', borderRadius: 20, border: '2px solid #edf2f7',
                                background: '#fff', fontWeight: 800, outline: 'none', color: '#1e3a5f',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
                            }}
                            value={selectedCourse}
                            onChange={e => setSelectedCourse(e.target.value)}
                        >
                            <option value="all">Entire Institutional Population</option>
                            {courses.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                </div>

                {/* Podium Visualization */}
                {topThree.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32, marginBottom: 80, alignItems: 'flex-end' }}>

                        {/* 2nd Place */}
                        {topThree[1] && (
                            <div className="podium-card silver animate-slide-up" style={{ height: 320 }}>
                                <div className="rank-ring">2</div>
                                <h3 className="podium-name">{topThree[1].name}</h3>
                                <div className="podium-course">{topThree[1].course}</div>
                                <div className="podium-gpa">GPA {Number(topThree[1].gpa).toFixed(2)}</div>
                            </div>
                        )}

                        {/* 1st Place */}
                        {topThree[0] && (
                            <div className="podium-card gold animate-slide-up" style={{ height: 400 }}>
                                <div className="rank-ring gold-ring">1</div>
                                <h3 className="podium-name" style={{ fontSize: 24 }}>{topThree[0].name}</h3>
                                <div className="podium-course">{topThree[0].course}</div>
                                <div className="podium-gpa" style={{ background: '#fff', color: '#1e3a5f' }}>GPA {Number(topThree[0].gpa).toFixed(2)}</div>
                            </div>
                        )}

                        {/* 3rd Place */}
                        {topThree[2] && (
                            <div className="podium-card bronze animate-slide-up" style={{ height: 280 }}>
                                <div className="rank-ring">3</div>
                                <h3 className="podium-name">{topThree[2].name}</h3>
                                <div className="podium-course">{topThree[2].course}</div>
                                <div className="podium-gpa">GPA {Number(topThree[2].gpa).toFixed(2)}</div>
                            </div>
                        )}
                    </div>
                )}

                {/* Full Ledger */}
                <div className="modern-card" style={{ padding: 0, overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#fcfdfe', borderBottom: '2.5px solid #f1f5f9' }}>
                                <th className="th-cell">Position</th>
                                <th className="th-cell">Scholastic Identity</th>
                                <th className="th-cell">Bachelor Program</th>
                                <th className="th-cell" style={{ textAlign: 'center' }}>Institutional GPA</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredDetails.map((s, i) => (
                                <tr key={s.id} className="row-hover">
                                    <td className="td-cell" style={{ fontWeight: 950, color: i < 3 ? '#1e3a5f' : '#cbd5e1', fontSize: 18 }}>#{i + 1}</td>
                                    <td className="td-cell">
                                        <div style={{ fontSize: 16, fontWeight: 900, color: '#1e293b' }}>{s.name}</div>
                                        <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8' }}>ID: {s.studentId} · YEAR {s.yearLevel}</div>
                                    </td>
                                    <td className="td-cell" style={{ fontWeight: 800, color: '#64748b' }}>{s.course}</td>
                                    <td className="td-cell" style={{ textAlign: 'center' }}>
                                        <span className="gpa-badge" style={{
                                            background: i < 3 ? '#eff6ff' : '#f8fafc',
                                            color: i < 3 ? '#1e3a5f' : '#64748b',
                                            border: `1.5px solid ${i < 3 ? '#dbeafe' : '#edf2f7'}`
                                        }}>
                                            {Number(s.gpa).toFixed(2)}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>

            <style jsx>{`
               .podium-card {
                  background: #fff; border-radius: 40px; border: 2.5px solid #edf2f7;
                  display: flex; flex-direction: column; align-items: center; justify-content: flex-end;
                  padding-bottom: 40px; box-shadow: 0 20px 40px rgba(0,0,0,0.03);
                  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
               }
               .podium-card:hover { transform: translateY(-12px) scale(1.02); box-shadow: 0 30px 60px rgba(0,0,0,0.08); }
               
               .podium-card.gold { background: linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%); color: #fff; border-color: #1e3a5f; }
               
               .rank-ring {
                  width: 64px; height: 64px; border-radius: 50%; background: #f1f5f9;
                  display: flex; align-items: center; justify-content: center;
                  font-weight: 950; font-size: 24px; color: #1e3a5f;
                  margin-bottom: 24px; border: 4px solid #fff;
               }
               .gold-ring { background: #fbbf24; color: #92400e; border-color: rgba(255,255,255,0.1); }
               
               .podium-name { font-weight: 950; margin-bottom: 4px; text-align: center; }
               .podium-course { font-size: 11px; font-weight: 800; opacity: 0.6; text-transform: uppercase; margin-bottom: 20px; text-align: center; }
               .podium-gpa { padding: 8px 16px; border-radius: 12px; font-weight: 950; font-size: 14px; background: #eff6ff; color: #1e3a5f; }

               .modern-card { background: #fff; border-radius: 40px; border: 1.5px solid #edf2f7; box-shadow: 0 20px 50px rgba(0,0,0,0.02); }
               
               .th-cell { padding: 24px 32px; font-size: 11px; font-weight: 950; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; text-align: left; }
               .td-cell { padding: 24px 32px; border-bottom: 1.5px solid #fcfdfe; }
               .row-hover:hover { background: #fcfdfe; }
               
               .gpa-badge { padding: 10px 18px; border-radius: 14px; font-weight: 950; font-size: 15px; }
               
               @keyframes slideUp { from { opacity: 0; transform: translateY(50px); } to { opacity: 1; transform: translateY(0); } }
               .animate-slide-up { animation: slideUp 0.6s cubic-bezier(0, 0, 0.2, 1) backwards; }
            `}</style>
        </div>
    );
}
