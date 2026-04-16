'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Topbar from '@/components/Topbar/Topbar';
import { api } from '@/lib/api';
import Modal from '@/components/Modal/Modal';
import { useSearchParams } from 'next/navigation';

interface Student {
    id: number;
    name: string;
    studentId: string;
    course: string;
    yearLevel: number;
    email: string;
    balance: number;
    scholarship: string;
}

interface Transaction {
    id: number;
    amount: number;
    payment_date: string;
    method: string;
    reference_no: string;
}

export default function AdminFinance() {
    const { user } = useAuth();
    const [students, setStudents] = useState<Student[]>([]);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [detailLoading, setDetailLoading] = useState(false);

    // Payment form
    const [payAmount, setPayAmount] = useState('');
    const [payMethod, setPayMethod] = useState('Cash');
    const [payRef, setPayRef] = useState('');

    // Set balance form
    const [newBalance, setNewBalance] = useState('');
    const [showSetBalance, setShowSetBalance] = useState(false);

    // Modal
    const [modalOpen, setModalOpen] = useState(false);
    const [modalConfig, setModalConfig] = useState<{
        title: string; message: string; type: 'danger' | 'success' | 'info'; onConfirm: () => void;
    }>({ title: '', message: '', type: 'info', onConfirm: () => { } });

    const showAlert = (title: string, message: string, type: 'success' | 'info' = 'success') => {
        setModalConfig({ title, message, type, onConfirm: () => setModalOpen(false) });
        setModalOpen(true);
    };

    const searchParams = useSearchParams();

    useEffect(() => {
        if (user?.role === 'admin') loadStudents();
    }, [user]);

    useEffect(() => {
        if (selectedStudent) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => { document.body.style.overflow = 'auto'; };
    }, [selectedStudent]);

    useEffect(() => {
        if (students.length > 0) {
            const targetId = searchParams.get('id');
            if (targetId) {
                const s = students.find(item => item.id === parseInt(targetId));
                if (s) selectStudent(s);
            }
        }
    }, [students, searchParams]);

    const loadStudents = async () => {
        try {
            const res = await api.get('/admin-advanced/finance/students');
            if (res.success) setStudents(res.students);
        } finally {
            setLoading(false);
        }
    };

    const selectStudent = async (s: Student) => {
        setSelectedStudent(s);
        setDetailLoading(true);
        setPayAmount(''); setPayRef(''); setPayMethod('Cash');
        setShowSetBalance(false);
        try {
            const res = await api.get(`/admin-advanced/financials/${s.id}`);
            if (res.success) {
                setTransactions(res.transactions);
                setSelectedStudent(prev => prev ? { ...prev, balance: res.balance.total_balance || 0 } : null);
            }
        } finally {
            setDetailLoading(false);
        }
    };

    const handlePayment = () => {
        if (!selectedStudent || !payAmount || Number(payAmount) <= 0) return;
        setModalConfig({
            title: 'Confirm Payment Processing',
            message: `You are about to record a payment of ₱${Number(payAmount).toLocaleString()} for ${selectedStudent.name}. This will be permanently recorded in the institutional ledger.`,
            type: 'info',
            onConfirm: async () => {
                setModalOpen(false);
                const res = await api.post('/admin-advanced/record-payment', {
                    userId: selectedStudent.id,
                    amount: payAmount,
                    method: payMethod,
                    ref: payRef || `PAY-${Date.now()}`
                });
                if (res.success) {
                    showAlert('Payment Authorized', `Transaction synchronized successfully. New balance: ₱${Number(res.newBalance).toLocaleString()}`, 'success');
                    setPayAmount(''); setPayRef('');
                    selectStudent({ ...selectedStudent, balance: Number(res.newBalance) });
                    loadStudents();
                }
            }
        });
        setModalOpen(true);
    };

    const handleSetBalance = async () => {
        if (!selectedStudent || newBalance === '') return;
        const res = await api.post('/admin-advanced/finance/set-balance', {
            userId: selectedStudent.id,
            balance: newBalance
        });
        if (res.success) {
            showAlert('Ledger Adjusted', `${selectedStudent.name}'s institutional balance has been re-synchronized to ₱${Number(newBalance).toLocaleString()}.`, 'success');
            setNewBalance('');
            setShowSetBalance(false);
            selectStudent({ ...selectedStudent, balance: Number(newBalance) });
            loadStudents();
        }
    };

    const filtered = students.filter(s => {
        const q = searchQuery.toLowerCase();
        return s.name.toLowerCase().includes(q) || s.studentId.toLowerCase().includes(q);
    });

    const totalOutstanding = students.reduce((sum, s) => sum + Number(s.balance), 0);

    if (user?.role !== 'admin') return <div className="page-content">Access Denied</div>;

    return (
        <>
            {/* Global Fixed Overlays */}
            <Modal
                isOpen={modalOpen}
                title={modalConfig.title}
                message={modalConfig.message}
                type={modalConfig.type}
                onConfirm={modalConfig.onConfirm}
                onCancel={() => setModalOpen(false)}
                confirmText="Authorize Transaction"
            />

            {selectedStudent && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 2000,
                    background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(16px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px'
                }}>
                    <div className="modern-admin-card animate-pop" style={{
                        width: '100%', maxWidth: 1200, padding: 0,
                        maxHeight: '94vh', display: 'flex', flexDirection: 'column',
                        boxShadow: '0 40px 100px rgba(0,0,0,0.3)', border: 'none',
                        borderRadius: 40, overflow: 'hidden', background: '#fff'
                    }}>
                        <div style={{ padding: '40px 24px', background: 'linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)', color: '#fff', position: 'relative', flexShrink: 0, borderTopLeftRadius: 40, borderTopRightRadius: 40 }}>
                            <button onClick={() => setSelectedStudent(null)} style={{
                                position: 'absolute', top: 20, right: 20, background: 'rgba(255,255,255,0.1)',
                                border: 'none', width: 40, height: 40, borderRadius: '50%', color: '#fff',
                                fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10
                            }}>✕</button>

                            <div className="mobile-stack" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 24 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                                    <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 950, backdropFilter: 'blur(10px)', border: '1.5px solid rgba(255,255,255,0.2)', flexShrink: 0 }}>
                                        {selectedStudent.name[0]}
                                    </div>
                                    <div>
                                        <h2 style={{ fontSize: 22, fontWeight: 950, letterSpacing: '-0.5px' }}>{selectedStudent.name}</h2>
                                        <p style={{ opacity: 0.6, fontSize: 12, fontWeight: 700 }}>ID: {selectedStudent.studentId} · {selectedStudent.course}</p>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'left' }}>
                                    <div style={{ fontSize: 9, fontWeight: 950, opacity: 0.5, textTransform: 'uppercase', marginBottom: 4 }}>Institutional Balance</div>
                                    <div style={{ fontSize: 28, fontWeight: 950, color: Number(selectedStudent.balance) > 0 ? '#fca5a5' : '#86efac' }}>
                                        ₱{Number(selectedStudent.balance).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mobile-stack" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 500px)', gap: 0, flex: 1, overflowY: 'auto', background: '#fff', borderBottomLeftRadius: 40, borderBottomRightRadius: 40 }}>
                            <div className="workbench-scroller" style={{ padding: '24px 20px', borderRight: '1.5px solid #f1f5f9', minHeight: 0 }}>
                                {detailLoading ? (
                                    <div style={{ textAlign: 'center', padding: 100, opacity: 0.5 }}>Retrieving Fiscal Audit Trail...</div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
                                        <div>
                                            <h4 className="admin-sublabel" style={{ marginBottom: 32 }}>Transaction Terminal</h4>
                                            <form onSubmit={(e) => { e.preventDefault(); handlePayment(); }} style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                                                <div className="admin-form-group">
                                                    <label>Payment Amount (CREDIT)</label>
                                                    <input type="number" step="0.01" required value={payAmount} onChange={e => setPayAmount(e.target.value)} style={{ fontSize: 32, textAlign: 'center', fontWeight: 950, padding: 32 }} placeholder="₱ 0.00" />
                                                </div>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 16 }}>
                                                    <div className="admin-form-group">
                                                        <label>Settlement Method</label>
                                                        <select value={payMethod} onChange={e => setPayMethod(e.target.value)}>
                                                            <option>Cash</option>
                                                            <option>Bank Direct Transfer</option>
                                                            <option>GCash Digital Core</option>
                                                            <option>Administrative Credit</option>
                                                        </select>
                                                    </div>
                                                    <div className="admin-form-group">
                                                        <label>Reference Hub</label>
                                                        <input placeholder="Auto-Sync" value={payRef} onChange={e => setPayRef(e.target.value)} />
                                                    </div>
                                                </div>
                                                <button type="submit" className="admin-workbench-btn" style={{ background: '#1e3a5f' }}>AUTHORIZE PAYMENT SYNC</button>
                                            </form>
                                            <div style={{ marginTop: 48, paddingTop: 40, borderTop: '2.5px dashed #f1f5f9' }}>
                                                <button onClick={() => setShowSetBalance(!showSetBalance)} style={{ width: '100%', padding: '16px', borderRadius: 16, border: '1.5px solid #edf2f7', background: '#f8fafc', color: '#94a3b8', fontWeight: 800, fontSize: 11, cursor: 'pointer' }}>
                                                    {showSetBalance ? 'CANCEL ADJUSTMENT' : 'MANUAL LEDGER ADJUSTMENT PROTOCOL'}
                                                </button>
                                                {showSetBalance && (
                                                    <div className="animate-slide-up" style={{ marginTop: 24, display: 'flex', gap: 12 }}>
                                                        <input style={{ flex: 1, padding: 16, borderRadius: 12, border: '1.5px solid #1e3a5f', fontWeight: 700, outline: 'none' }} placeholder="New Total Balance" value={newBalance} onChange={e => setNewBalance(e.target.value)} type="number" />
                                                        <button onClick={handleSetBalance} style={{ padding: '0 24px', borderRadius: 12, background: '#1e3a5f', color: '#fff', border: 'none', fontWeight: 900, cursor: 'pointer' }}>ADJUST</button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="workbench-scroller" style={{ padding: '24px 20px', background: '#fcfdfe', minHeight: 0 }}>
                                <h4 className="admin-sublabel" style={{ marginBottom: 32 }}>Transaction Audit Ledger</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    {transactions.map(tx => (
                                        <div key={tx.id} style={{ background: '#fff', padding: 24, borderRadius: 24, border: '1.5px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <div style={{ fontSize: 18, fontWeight: 950, color: '#059669' }}>-₱{Number(tx.amount).toLocaleString()}</div>
                                                <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', marginTop: 4 }}>{new Date(tx.payment_date).toLocaleDateString()} · {tx.method}</div>
                                            </div>
                                            <div style={{ fontSize: 10, fontWeight: 950, color: '#cbd5e1', border: '1px solid #edf2f7', padding: '4px 10px', borderRadius: 10 }}>#{tx.reference_no}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="animate-in" style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: 100 }}>
                <Topbar title="Global Financial Desk" subtitle="Strategic oversight of institutional account balances, payment synchronization, and fiscal auditing." />

                <main className="page-content" style={{ maxWidth: 1600, margin: '0 auto', padding: '0 20px' }}>
                    <div className="mobile-stack" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 40 }}>
                        <div className="fiscal-card" style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)', color: '#fff', padding: 32 }}>
                            <div className="fiscal-label" style={{ color: 'rgba(255,255,255,0.6)' }}>Institutional Registry</div>
                            <div className="fiscal-value" style={{ fontSize: 24 }}>{students.length} <span style={{ fontSize: 13, opacity: 0.5 }}>IDENTITIES</span></div>
                        </div>
                        <div className="fiscal-card" style={{ background: '#fff', border: '2px solid #fee2e2', padding: 32 }}>
                            <div className="fiscal-label" style={{ color: '#ef4444' }}>Outstanding Arrears</div>
                            <div className="fiscal-value" style={{ color: '#111827', fontSize: 24 }}>₱{totalOutstanding.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</div>
                        </div>
                        <div className="fiscal-card" style={{ background: '#fff', border: '2px solid #edf2f7', padding: 32 }}>
                            <div className="fiscal-label" style={{ color: '#3b82f6' }}>Payment Channels</div>
                            <div className="fiscal-value" style={{ color: '#111827', fontSize: 24 }}>5 <span style={{ fontSize: 13, opacity: 0.5 }}>ACTIVE</span></div>
                        </div>
                    </div>

                    <div className="modern-admin-card" style={{ padding: '24px 20px' }}>
                        <div className="mobile-stack" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, gap: 20 }}>
                            <h2 style={{ fontSize: 28, fontWeight: 950, color: '#1e3a5f', letterSpacing: '-1.5px' }}>Financial Ledger Directory</h2>
                            <div style={{ display: 'flex', gap: 12 }}>
                                <button className="admin-workbench-btn" style={{ padding: '12px 24px', fontSize: 11 }}>📊 Fiscal Reports</button>
                            </div>
                        </div>

                        <div style={{ position: 'relative', marginBottom: 32 }}>
                            <input
                                className="admin-search-input"
                                placeholder="Search accounts by name or ID..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                style={{ padding: '20px 20px 20px 60px', fontSize: 16, borderRadius: 20 }}
                            />
                            <span style={{ position: 'absolute', left: 22, top: '50%', transform: 'translateY(-50%)', fontSize: 20, opacity: 0.3 }}>🔍</span>
                        </div>

                        <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
                            {loading ? (
                                <div style={{ textAlign: 'center', padding: 40, opacity: 0.5, gridColumn: 'span 3' }}>Synchronizing Fiscal Records...</div>
                            ) : filtered.map(s => (
                                <div key={s.id} onClick={() => selectStudent(s)} className={`admin-registry-item-card ${selectedStudent?.id === s.id ? 'active' : ''}`}>
                                    <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#f1f5f9', color: '#1e3a5f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 950 }}>
                                        {s.name[0]}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div className="name" style={{ fontSize: 18 }}>{s.name}</div>
                                        <div className="meta" style={{ fontSize: 13 }}>{s.studentId} · {s.course}</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: 16, fontWeight: 950, color: Number(s.balance) > 0 ? '#ef4444' : '#059669' }}>
                                            ₱{Number(s.balance).toLocaleString('en-PH')}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </main>
            </div>

            <style jsx>{`
               .fiscal-card { padding: 40px; border-radius: 40px; box-shadow: 0 15px 35px rgba(0,0,0,0.03); }
               .fiscal-label { font-size: 11px; fontWeight: 950; text-transform: uppercase; letter-spacing: 1.2px; margin-bottom: 12px; }
               .fiscal-value { font-size: 32px; fontWeight: 950; letter-spacing: -1px; }
               .modern-admin-card { background: #fff; border-radius: 40px; border: 1.5px solid #edf2f7; box-shadow: 0 10px 30px rgba(0,0,0,0.02); }
               .admin-search-input { width: 100%; padding: 18px 24px 18px 54px; border-radius: 20px; border: 2px solid #edf2f7; background: #f8fafc; font-weight: 700; font-size: 15px; outline: none; transition: 0.3s; }
               .admin-search-input:focus { border-color: #1e3a5f; background: #fff; box-shadow: 0 0 0 5px rgba(30,58,95,0.05); }
               .admin-sublabel { font-size: 11px; fontWeight: 900; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.2px; }
               .admin-registry-item-card { display: flex; align-items: center; gap: 20px; padding: 24px; border-radius: 32px; cursor: pointer; transition: 0.3s; background: #fff; border: 1.5px solid #f1f5f9; }
               .admin-registry-item-card:hover { transform: translateY(-8px); border-color: #3b82f6; box-shadow: 0 20px 40px rgba(0,0,0,0.05); }
               .admin-registry-item-card .name { font-weight: 900; color: #1e293b; }
               .admin-registry-item-card .meta { fontWeight: 700; color: #94a3b8; margin-top: 4px; }
               .admin-form-group { display: flex; flex-direction: column; gap: 12px; }
               .admin-form-group label { font-size: 11px; fontWeight: 900; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; }
               .admin-form-group input, .admin-form-group select { padding: 20px; border-radius: 18px; border: 2.5px solid #edf2f7; background: #f8fafc; font-weight: 700; font-size: 15px; outline: none; transition: 0.3s; }
               .admin-form-group input:focus, .admin-form-group select:focus { border-color: #1e3a5f; background: #fff; box-shadow: 0 0 0 6px rgba(30,58,95,0.04); }
               .admin-workbench-btn { padding: 24px; border-radius: 24px; border: none; background: #1e3a5f; color: #fff; font-weight: 950; font-size: 14px; text-transform: uppercase; cursor: pointer; transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); letter-spacing: 1px; box-shadow: 0 15px 30px rgba(30,58,95,0.2); }
               .admin-workbench-btn:hover { transform: translateY(-4px); filter: brightness(1.2); box-shadow: 0 20px 40px rgba(30,58,95,0.25); }
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
