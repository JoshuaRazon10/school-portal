'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import Topbar from '@/components/Topbar/Topbar';
import { api } from '@/lib/api';

export default function Dashboard() {
   const { user } = useAuth();

   if (!user) return <div className="spinner"></div>;

   return (
      <div className="animate-in" style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: 100 }}>
         <Topbar title={`${user.name.split(' ')[0]}'s Mission Control`} subtitle="Strategic oversight of academic identity and institutional performance." />

         <main className="page-content dash-main">

            {/* Identity Hero */}
            <div className="dash-hero">
               <div style={{ position: 'absolute', top: -50, right: -50, width: 300, height: 300, background: 'rgba(255,255,255,0.03)', borderRadius: '50%' }} />
               <div style={{ position: 'relative', zIndex: 1 }}>
                  <div className="dash-hero-inner">
                     <div>
                        <h1 className="dash-hero-title">Welcome back, {user.name.split(',')[0]}</h1>
                        <div className="dash-hero-tags">
                           <span style={{ padding: '6px 16px', background: 'rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 13, fontWeight: 800 }}>{user.course}</span>
                           <span style={{ padding: '6px 16px', background: 'rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 13, fontWeight: 800 }}>YEAR {user.yearLevel}</span>
                        </div>
                     </div>
                     <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 13, fontWeight: 900, opacity: 0.6, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 }}>Scholastic Standing</div>
                        <div style={{ fontSize: 48, fontWeight: 950 }}>{user.gpa} <span style={{ fontSize: 18, opacity: 0.5 }}>GPA</span></div>
                     </div>
                  </div>
               </div>
            </div>

            <div className="dash-cards-grid">
               <Link href="/courses" className="modern-dash-card" style={{ textDecoration: 'none' }}>
                  <div className="card-icon blue">📚</div>
                  <h3 className="card-title">Academic Hub</h3>
                  <p className="card-desc">Review institutional subject specifications and curriculum progress.</p>
               </Link>
               <Link href="/grades" className="modern-dash-card" style={{ textDecoration: 'none' }}>
                  <div className="card-icon gold">🏆</div>
                  <h3 className="card-title">Scholastic Records</h3>
                  <p className="card-desc">Analyze hierarchical rankings and historical performance telemetry.</p>
               </Link>
               <Link href="/assignments" className="modern-dash-card" style={{ textDecoration: 'none' }}>
                  <div className="card-icon green">🚀</div>
                  <h3 className="card-title">Mission Tasks</h3>
                  <p className="card-desc">Execute tactical academic requirements and track dispatch status.</p>
               </Link>
            </div>

            <div className="dash-bottom-grid">

               <div className="modern-card" style={{ padding: 40 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                     <h3 style={{ fontSize: 20, fontWeight: 950, color: '#1e3a5f' }}>Institutional Bulletins</h3>
                     <Link href="/announcements" style={{ fontSize: 11, fontWeight: 900, color: '#3b82f6', textDecoration: 'none', letterSpacing: 0.5 }}>VIEW ARCHIVES →</Link>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                     {[
                        { title: 'Official 2nd semester enrollment protocol initialized', date: 'APR 01', type: 'ADMIN', color: '#1e3a5f' },
                        { title: 'Foundation Day tactical event program released', date: 'MAR 28', type: 'EVENT', color: '#059669' },
                        { title: 'Mid-term permit clearance schedule finalized', date: 'MAR 25', type: 'FINANCE', color: '#dc2626' }
                     ].map((ann, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                           <div style={{ width: 54, height: 54, borderRadius: 16, background: ann.color, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
                              <span style={{ fontSize: 9, fontWeight: 950 }}>{ann.date.split(' ')[0]}</span>
                              <span style={{ fontSize: 18, fontWeight: 950 }}>{ann.date.split(' ')[1]}</span>
                           </div>
                           <div>
                              <p style={{ fontSize: 15, fontWeight: 800, color: '#1e293b' }}>{ann.title}</p>
                              <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                                 <span style={{ fontSize: 10, fontWeight: 950, color: ann.color }}>{ann.type}</span>
                                 <span style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8' }}>OFFICE OF THE REGISTRAR</span>
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>

               <div className="modern-card" style={{ padding: 40, border: '2.5px solid #1e3a5f', background: '#fcfdfe' }}>
                  <h3 style={{ fontSize: 20, fontWeight: 950, color: '#1e3a5f', marginBottom: 32 }}>Telemetry Feed</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                     {[
                        { label: 'CURRICULAR PROGRESS', val: 85, color: '#1e3a5f' },
                        { label: 'MISSION COMPLETION', val: 62, color: '#3b82f6' },
                        { label: 'INSTITUTIONAL CLEARANCE', val: 100, color: '#059669' }
                     ].map((stat, idx) => (
                        <div key={idx}>
                           <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                              <span style={{ fontSize: 11, fontWeight: 950, color: '#94a3b8', letterSpacing: 1 }}>{stat.label}</span>
                              <span style={{ fontSize: 13, fontWeight: 950, color: stat.color }}>{stat.val}%</span>
                           </div>
                           <div style={{ height: 10, background: '#f1f5f9', borderRadius: 99, overflow: 'hidden' }}>
                              <div style={{ width: `${stat.val}%`, height: '100%', background: stat.color, borderRadius: 99, transition: '1s' }} />
                           </div>
                        </div>
                     ))}
                  </div>
                  <div style={{ marginTop: 40, padding: 24, borderRadius: 24, background: '#fff', border: '1.5px solid #edf2f7', textAlign: 'center' }}>
                     <p style={{ fontSize: 14, fontWeight: 800, color: '#1e293b', marginBottom: 6 }}>Institutional Motto</p>
                     <p style={{ fontSize: 13, color: '#94a3b8', fontStyle: 'italic', fontWeight: 600 }}>"In Hoc Signo Vinces"</p>
                  </div>
               </div>

            </div>
         </main>

          <style jsx>{`
          .dash-main { max-width: 1400px; margin: 0 auto; padding: 24px 40px; }
          .dash-hero {
             background: linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%);
             padding: 60px 50px; border-radius: 40px; color: #fff; margin-bottom: 48px;
             position: relative; overflow: hidden; box-shadow: 0 20px 50px rgba(30,58,95,0.2);
          }
          .dash-hero-inner { display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 24px; }
          .dash-hero-title { font-size: 42px; font-weight: 950; letter-spacing: -2px; margin-bottom: 16px; }
          .dash-hero-tags { display: flex; gap: 12px; flex-wrap: wrap; }
          .dash-cards-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; margin-bottom: 48px; }
          .dash-bottom-grid { display: grid; grid-template-columns: 1.5fr 1fr; gap: 32px; }

          .modern-dash-card {
             background: #fff; padding: 40px; border-radius: 32px; border: 1.5px solid #edf2f7;
             transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); box-shadow: 0 10px 30px rgba(0,0,0,0.02);
          }
          .modern-dash-card:hover { transform: translateY(-12px); border-color: #3b82f6; box-shadow: 0 20px 40px rgba(59,130,246,0.1); }
          
          .card-icon { width: 64px; height: 64px; border-radius: 18px; display: flex; align-items: center; justify-content: center; font-size: 32px; margin-bottom: 24px; }
          .card-icon.blue { background: #eff6ff; }
          .card-icon.gold { background: #fffbeb; }
          .card-icon.green { background: #ecfdf5; }
          
          .card-title { font-size: 20px; font-weight: 950; color: #1e293b; margin-bottom: 12px; }
          .card-desc { font-size: 14px; font-weight: 600; color: #94a3b8; line-height: 1.6; }

          .modern-card { background: #fff; border-radius: 40px; border: 1.5px solid #edf2f7; box-shadow: 0 10px 30px rgba(0,0,0,0.02); }

          @media (max-width: 1024px) {
             .dash-cards-grid { grid-template-columns: repeat(2, 1fr); gap: 20px; }
             .dash-bottom-grid { grid-template-columns: 1fr; }
             .dash-hero { padding: 40px 32px; border-radius: 24px; }
             .dash-hero-title { font-size: 28px; letter-spacing: -1px; }
          }
          @media (max-width: 768px) {
             .dash-main { padding: 16px; }
             .dash-cards-grid { grid-template-columns: 1fr; gap: 16px; }
             .dash-bottom-grid { grid-template-columns: 1fr; gap: 16px; }
             .dash-hero { padding: 28px 20px; border-radius: 20px; margin-bottom: 24px; }
             .dash-hero-inner { flex-direction: column; align-items: flex-start; }
             .dash-hero-title { font-size: 22px; margin-bottom: 8px; }
             .modern-dash-card { padding: 24px; border-radius: 20px; }
             .modern-card { border-radius: 20px; padding: 24px !important; }
             .card-icon { width: 48px; height: 48px; font-size: 24px; margin-bottom: 16px; }
             .card-title { font-size: 16px; }
          }
       `}</style>
      </div>
   );
}
