'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Topbar from '@/components/Topbar/Topbar';
import { api } from '@/lib/api';

interface Transaction {
    id: number;
    amount: number;
    payment_date: string;
    method: string;
    reference_no: string;
}

export default function StudentFinance() {
    const { user } = useAuth();
    const [balance, setBalance] = useState(0);
    const [scholarship, setScholarship] = useState('NONE');
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadFinance();
    }, []);

    const loadFinance = async () => {
        try {
            const res = await api.get('/admin-advanced/my-finance');
            if (res.success) {
                setBalance(Number(res.balance));
                setScholarship(res.scholarship);
                setTransactions(res.transactions);
            }
        } catch (err) {
            console.error('Finance load error:', err);
        } finally {
            setLoading(false);
        }
    };

    const totalPaid = transactions.reduce((sum, tx) => sum + Number(tx.amount), 0);

    if (loading) return <div className="spinner"></div>;

    return (
        <div className="animate-in" style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: 100 }}>
            <Topbar title="Institutional Financial Hub" subtitle="Strategic oversight of personal account balances and fiscal transaction history." />

            <main className="page-content" style={{ maxWidth: 1400, margin: '0 auto', padding: '0 40px' }}>

                {/* Fiscal Metrics Deck */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32, marginBottom: 48 }}>
                    <div className="fiscal-card gradient-blue">
                        <div className="card-overlay">₱</div>
                        <div className="f-label">GLOBAL OUTSTANDING ARREARS</div>
                        <div className="f-value">₱{balance.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</div>
                        <p className="f-desc">{balance > 0 ? 'Protocol: Immediate settlement required at the cashier.' : 'Status: Identity is clear of fiscal debit.'}</p>
                    </div>
                    <div className="fiscal-card slate">
                        <div className="card-overlay">✓</div>
                        <div className="f-label">TOTAL CAPITAL SYNCED</div>
                        <div className="f-value">₱{totalPaid.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</div>
                        <p className="f-desc">Synchronized across {transactions.length} successful transfers.</p>
                    </div>
                    <div className="fiscal-card deep">
                        <div className="card-overlay">🏆</div>
                        <div className="f-label">SCHOLASTIC CLASSIFICATION</div>
                        <div className="f-value">{scholarship === 'NONE' ? 'REGULAR CORE' : scholarship}</div>
                        <p className="f-desc">Institutional aid and grant status protocol.</p>
                    </div>
                </div>

                {/* Transaction Ledger */}
                <div className="modern-card" style={{ padding: 48 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
                        <h3 style={{ fontSize: 22, fontWeight: 950, color: '#1e3a5f' }}>Transaction Audit Trail</h3>
                        <div className="ledger-stat">
                            <span>SECURE AUDIT ACTIVE</span>
                            <div className="pulse-dot"></div>
                        </div>
                    </div>

                    {transactions.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '100px 0' }}>
                            <div style={{ fontSize: 60, marginBottom: 24 }}>🧾</div>
                            <h4 style={{ fontSize: 20, fontWeight: 900, color: '#1e293b' }}>No Fiscal Records Found</h4>
                            <p style={{ color: '#94a3b8', fontWeight: 600 }}>Your institutional transfers will be logged here upon synchronization.</p>
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: '#fcfdfe', borderBottom: '2.5px solid #f1f5f9' }}>
                                        <th className="th-cell">Protocol Date</th>
                                        <th className="th-cell">Capital Amount</th>
                                        <th className="th-cell">Channel Method</th>
                                        <th className="th-cell">Reference Identity</th>
                                        <th className="th-cell" style={{ textAlign: 'center' }}>Dispatch Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.map((tx, idx) => (
                                        <tr key={tx.id} className="row-hover">
                                            <td className="td-cell">
                                                <div style={{ fontWeight: 950, color: '#1e3a5f', fontSize: 14 }}>{new Date(tx.payment_date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}</div>
                                                <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', marginTop: 2 }}>{new Date(tx.payment_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                            </td>
                                            <td className="td-cell" style={{ fontSize: 16, fontWeight: 950, color: '#059669' }}>
                                                ₱{Number(tx.amount).toLocaleString()}
                                            </td>
                                            <td className="td-cell">
                                                <span className="method-tag">{tx.method.toUpperCase()}</span>
                                            </td>
                                            <td className="td-cell" style={{ fontSize: 12, fontWeight: 800, color: '#94a3b8', fontFamily: 'monospace' }}>
                                                {tx.reference_no}
                                            </td>
                                            <td className="td-cell" style={{ textAlign: 'center' }}>
                                                <span className="status-badge">ARCHIVED ✓</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

            </main>

            <style jsx>{`
               .fiscal-card { padding: 48px; border-radius: 40px; color: #fff; position: relative; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.05); transition: 0.4s; }
               .fiscal-card:hover { transform: translateY(-8px); filter: brightness(1.1); }
               .gradient-blue { background: linear-gradient(135deg, #1e3a5f 0%, #3b82f6 100%); }
               .slate { background: #1e293b; }
               .deep { background: #0f172a; }
               
               .card-overlay { position: absolute; top: -20px; right: -20px; font-size: 140px; font-weight: 950; opacity: 0.05; pointer-events: none; }
               
               .f-label { font-size: 10px; font-weight: 900; opacity: 0.6; letter-spacing: 2px; margin-bottom: 12px; }
               .f-value { font-size: 38px; font-weight: 950; letter-spacing: -1.5px; margin-bottom: 16px; }
               .f-desc { font-size: 12px; font-weight: 700; opacity: 0.5; line-height: 1.5; }

               .modern-card { background: #fff; border-radius: 40px; border: 1.5px solid #edf2f7; box-shadow: 0 10px 30px rgba(0,0,0,0.02); }
               
               .ledger-stat { display: flex; align-items: center; gap: 12px; padding: 10px 20px; background: #eff6ff; border-radius: 12px; font-size: 11px; font-weight: 950; color: #1e3a5f; letter-spacing: 0.5px; }
               .pulse-dot { width: 8px; height: 8px; border-radius: 50%; background: #3b82f6; animation: pulse 2s infinite; }
               @keyframes pulse { 0% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(1.4); } 100% { opacity: 1; transform: scale(1); } }

               .th-cell { padding: 24px 32px; font-size: 10px; font-weight: 950; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; text-align: left; }
               .td-cell { padding: 24px 32px; border-bottom: 1.5px solid #fcfdfe; }
               .row-hover:hover { background: #fcfdfe; }
               
               .method-tag { font-size: 10px; font-weight: 950; color: #1e3a5f; background: #f1f5f9; padding: 6px 12px; border-radius: 8px; }
               .status-badge { font-size: 10px; font-weight: 950; color: #059669; background: #ecfdf5; padding: 6px 16px; border-radius: 10px; border: 1px solid #d1fae5; }
            `}</style>
        </div>
    );
}
