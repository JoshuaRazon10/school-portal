'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Topbar from '@/components/Topbar/Topbar';
import { api } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import Modal from '@/components/Modal/Modal';

interface Comment {
   id: number;
   userName: string;
   userPhoto: string;
   avatar: string;
   content: string;
   created_at: string;
}

interface Announcement {
   id: number;
   title: string;
   content: string;
   category: string;
   important: boolean;
   author: string;
   date: string;
   image_url: string | null;
   comments?: Comment[];
   showComments?: boolean;
}

export default function AdminNotices() {
   const { user } = useAuth();
   const { showToast } = useToast();
   const [notices, setNotices] = useState<Announcement[]>([]);
   const [formData, setFormData] = useState({
      title: '', content: '', category: 'Institutional', important: false,
   });
   const [imageFile, setImageFile] = useState<File | null>(null);
   const [previewUrl, setPreviewUrl] = useState<string | null>(null);
   const [showForm, setShowForm] = useState(false);
   const [isSubmitting, setIsSubmitting] = useState(false);

   const [modalOpen, setModalOpen] = useState(false);
   const [modalConfig, setModalConfig] = useState<{
      title: string; message: string; type: 'danger' | 'success' | 'info'; onConfirm: () => void;
   }>({ title: '', message: '', type: 'info', onConfirm: () => { } });

   useEffect(() => {
      if (user?.role === 'admin') loadNotices();
   }, [user]);

   useEffect(() => {
      if (showForm) {
         document.body.style.overflow = 'hidden';
      } else {
         document.body.style.overflow = 'auto';
      }
      return () => { document.body.style.overflow = 'auto'; };
   }, [showForm]);

   const loadNotices = async () => {
      const res = await api.get('/announcements');
      if (res.success) setNotices(res.announcements.map((n: any) => ({ ...n, showComments: false, comments: [] })));
   };

   const toggleComments = async (id: number) => {
      const updated = notices.map(n => n.id === id ? { ...n, showComments: !n.showComments } : n);
      setNotices(updated);
      const target = updated.find(n => n.id === id);
      if (target?.showComments && (!target.comments || target.comments.length === 0)) {
         const res = await api.get(`/announcements/${id}/comments`);
         if (res.success) setNotices(prev => prev.map(n => n.id === id ? { ...n, comments: res.comments } : n));
      }
   };

   const showAlert = (title: string, message: string, type: 'success' | 'info' = 'success') => {
      setModalConfig({ title, message, type, onConfirm: () => setModalOpen(false) });
      setModalOpen(true);
   };

   const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] || null;
      setImageFile(file);
      if (file) setPreviewUrl(URL.createObjectURL(file));
      else setPreviewUrl(null);
   };

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);
      try {
         const fd = new FormData();
         fd.append('title', formData.title);
         fd.append('content', formData.content);
         fd.append('category', formData.category);
         fd.append('important', String(formData.important));
         fd.append('author', 'Concepcion Holy Cross College Inc.');
         fd.append('date', new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }));
         if (imageFile) fd.append('image', imageFile);

         const res = await api.post('/announcements', fd);
         if (res.success) {
            showToast('Institutional notice broadcasted successfully.', 'success');
            setFormData({ title: '', content: '', category: 'Institutional', important: false });
            setImageFile(null); setPreviewUrl(null); setShowForm(false);
            loadNotices();
         } else {
            showToast(res.message || 'Failed to dispatch institutional notice.', 'error');
         }
      } finally {
         setIsSubmitting(false);
      }
   };

   const deleteNotice = (id: number) => {
      setModalConfig({
         title: 'Purge Social Notice',
         message: 'DANGER: You are about to permanently purge this broadcast and associated engagement data. This action is irreversible.',
         type: 'danger',
         onConfirm: async () => {
            setModalOpen(false);
            const res = await api.delete(`/announcements/delete-announcement/${id}`);
            if (res.success) {
               showAlert('Archive Updated', 'The social record has been erased.', 'success');
               loadNotices();
            }
         }
      });
      setModalOpen(true);
   };

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
            confirmText="Acknowledge Operation"
         />

         {showForm && (
            <div style={{
               position: 'fixed', inset: 0, zIndex: 2000,
               background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(12px)',
               display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40
            }}>
               <div className="modern-admin-card animate-pop" style={{
                  width: '100%', maxWidth: 1100, padding: 60,
                  background: '#1e3a5f', color: '#fff', position: 'relative', maxHeight: '90vh', display: 'flex', flexDirection: 'column',
                  borderRadius: 40, overflow: 'hidden'
               }}>
                  <button onClick={() => setShowForm(false)} style={{
                     position: 'absolute', top: 32, right: 32, background: 'rgba(255,255,255,0.1)',
                     border: 'none', width: 48, height: 48, borderRadius: '50%', color: '#fff',
                     fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>✕</button>

                  <h2 style={{ fontSize: 32, fontWeight: 950, letterSpacing: '-1.5px', marginBottom: 8 }}>Content Composer</h2>
                  <p style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: 48, textTransform: 'uppercase', letterSpacing: 1.5 }}>Authorized Institutional Broadcast Protocol</p>

                  <form onSubmit={handleSubmit} className="workbench-scroller" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 40, overflowY: 'auto', flex: 1, minHeight: 0 }}>
                     <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        <div className="admin-form-group-dark">
                           <label>Protocol Headline</label>
                           <input required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="Strategic Title..." />
                        </div>
                        <div className="admin-form-group-dark">
                           <label>Social Intelligence (Post Body)</label>
                           <textarea rows={8} required value={formData.content} onChange={e => setFormData({ ...formData, content: e.target.value })} placeholder="Broadcast details..." />
                        </div>
                     </div>
                     <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        <div className="admin-form-group-dark">
                           <label>Categorical Classification</label>
                           <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                              <option>Institutional</option>
                              <option>Academic</option>
                              <option>Holidays</option>
                              <option>Strategic Events</option>
                           </select>
                        </div>
                        <div className="admin-form-group-dark">
                           <label>Media Payload</label>
                           <div style={{ padding: 40, border: '2.5px dashed rgba(255,255,255,0.2)', borderRadius: 24, textAlign: 'center', cursor: 'pointer', position: 'relative' }}>
                              <input type="file" accept="image/*" onChange={handleImageChange} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
                              {previewUrl ? <img src={previewUrl} style={{ maxWidth: '100%', borderRadius: 12 }} /> : <div style={{ fontSize: 13, fontWeight: 700, opacity: 0.5 }}>ATTACH MEDIA INFRASTRUCTURE</div>}
                           </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 10 }}>
                           <input type="checkbox" id="imp" checked={formData.important} onChange={e => setFormData({ ...formData, important: e.target.checked })} style={{ width: 22, height: 22, cursor: 'pointer' }} />
                           <label htmlFor="imp" style={{ fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>MARK AS CRITICAL ALERT</label>
                        </div>
                     </div>
                     <div style={{ gridColumn: 'span 2', marginTop: 32 }}>
                        <button type="submit" disabled={isSubmitting} className="admin-workbench-btn" style={{ width: '100%', background: '#fff', color: '#1e3a5f', padding: 24 }}>
                           {isSubmitting ? 'INITIATING BROADCAST...' : 'EXECUTE UNIVERSAL DISPATCH'}
                        </button>
                     </div>
                  </form>
               </div>
            </div>
         )}

         <div className="animate-in" style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: 100 }}>
            <Topbar title="Social Intelligence Terminal" subtitle="Oversee institutional communications, engagement analytics, and social broadcasts." />

            <main className="page-content" style={{ maxWidth: 1400, margin: '0 auto', padding: '0 40px' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 48 }}>
                  <h2 style={{ fontSize: 32, fontWeight: 950, letterSpacing: '-1.5px', color: '#1e3a5f' }}>Digital Town Square</h2>
                  <button onClick={() => setShowForm(true)} className="admin-workbench-btn" style={{ background: '#1e3a5f' }}>
                     + BROADCAST NEW NOTICE
                  </button>
               </div>

               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: 32 }}>
                  {notices.map(n => (
                     <div key={n.id} className="social-notice-card animate-slide-up">
                        {n.image_url && <div className="notice-img"><img src={n.image_url} /></div>}
                        <div className="notice-content">
                           <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                              <span className="notice-tag">{n.category.toUpperCase()}</span>
                              <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8' }}>{n.date}</span>
                           </div>
                           <h3 className="notice-title">{n.title}</h3>
                           <p className="notice-text">{n.content}</p>
                           <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
                              <button onClick={() => toggleComments(n.id)} className="notice-action-btn">ENGAGEMENT FEED</button>
                              <button onClick={() => deleteNotice(n.id)} className="notice-action-btn purge">PURGE</button>
                           </div>
                           {n.showComments && (
                              <div className="comments-section">
                                 {n.comments?.map(c => (
                                    <div key={c.id} className="comment-bubble">
                                       <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 8 }}>
                                          <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#1e3a5f', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900 }}>{c.userName[0]}</div>
                                          <div className="comment-user">{c.userName}</div>
                                       </div>
                                       <div className="comment-body">{c.content}</div>
                                    </div>
                                 ))}
                              </div>
                           )}
                        </div>
                     </div>
                  ))}
               </div>
            </main>
         </div>

         <style jsx>{`
            .modern-admin-card { border-radius: 40px; box-shadow: 0 40px 100px rgba(0,0,0,0.3); }
            .admin-form-group-dark { display: flex; flex-direction: column; gap: 12px; }
            .admin-form-group-dark label { font-size: 11px; fontWeight: 900; color: rgba(255,255,255,0.4); text-transform: uppercase; }
            .admin-form-group-dark input, .admin-form-group-dark textarea, .admin-form-group-dark select { padding: 20px; border-radius: 18px; border: 2.5px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.05); color: #fff; font-weight: 700; outline: none; transition: 0.3s; }
            .admin-form-group-dark input:focus { border-color: #3b82f6; background: rgba(255,255,255,0.08); }
            .admin-workbench-btn { padding: 22px 32px; border-radius: 20px; border: none; font-weight: 950; font-size: 13px; text-transform: uppercase; cursor: pointer; transition: 0.3s; letter-spacing: 1px; }
            .social-notice-card { background: #fff; border-radius: 40px; border: 1.5px solid #edf2f7; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.02); transition: 0.4s; }
            .social-notice-card:hover { transform: translateY(-8px); border-color: #3b82f6; }
            .notice-img { height: 240px; overflow: hidden; }
            .notice-img img { width: 100%; height: 100%; object-fit: cover; }
            .notice-content { padding: 40px; }
            .notice-tag { font-size: 10px; fontWeight: 950; color: #1e3a5f; background: #eff6ff; padding: 6px 14px; borderRadius: 10px; border: 1px solid #dbeafe; }
            .notice-title { fontSize: 22px; fontWeight: 950; color: #1e3a5f; marginBottom: 16px; letterSpacing: -0.5px; }
            .notice-text { fontSize: 15px; fontWeight: 600; color: #64748b; lineHeight: 1.6; }
            .notice-action-btn { flex: 1; padding: 14px; border-radius: 14px; border: 1.5px solid #edf2f7; background: #fff; color: #1e3a5f; font-weight: 900; font-size: 11px; cursor: pointer; transition: 0.2s; }
            .notice-action-btn:hover { background: #fcfdfe; transform: scale(1.02); }
            .notice-action-btn.purge { color: #ef4444; border-color: #fee2e2; }
            .comments-section { margin-top: 32px; padding-top: 32px; border-top: 2px dashed #f1f5f9; display: flex; flex-direction: column; gap: 16px; }
            .comment-bubble { background: #f8fafc; padding: 20px; border-radius: 20px; border: 1px solid #edf2f7; }
            .comment-user { font-size: 13px; fontWeight: 950; color: #1e3a5f; }
            .comment-body { fontSize: 13px; fontWeight: 600; color: #64748b; margin-top: 8px; }
            @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
            .animate-slide-up { animation: slideUp 0.6s cubic-bezier(0, 0, 0.2, 1); }
            @keyframes pop { from { opacity: 0; transform: scale(0.9) translateY(20px); } to { opacity: 1; transform: scale(1) translateY(0); } }
            .animate-pop { animation: pop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
            .workbench-scroller::-webkit-scrollbar { width: 6px; }
            .workbench-scroller::-webkit-scrollbar-track { background: transparent; }
            .workbench-scroller::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
            .workbench-scroller::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
            .workbench-scroller { scrollbar-width: thin; scrollbar-color: #e2e8f0 transparent; }
         `}</style>
      </>
   );
}
