'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Topbar from '@/components/Topbar/Topbar';
import { api } from '@/lib/api';

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
  commentCount: number;
  comments?: Comment[];
  showComments?: boolean;
}

export default function Announcements() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  // Comment state
  const [commentText, setCommentText] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    const res = await api.get('/announcements');
    if (res.success) {
      setAnnouncements(res.announcements.map((a: any) => ({ ...a, showComments: false, comments: [] })));
    }
    setLoading(false);
  };

  const toggleComments = async (id: number) => {
    const updated = announcements.map(a => {
      if (a.id === id) {
        return { ...a, showComments: !a.showComments };
      }
      return a;
    });
    setAnnouncements(updated);

    const target = updated.find(a => a.id === id);
    if (target?.showComments && (!target.comments || target.comments.length === 0)) {
      const res = await api.get(`/announcements/${id}/comments`);
      if (res.success) {
        setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, comments: res.comments } : a));
      }
    }
  };

  const handlePostComment = async (id: number) => {
    const text = commentText[id];
    if (!text?.trim()) return;

    const res = await api.post(`/announcements/${id}/comments`, { content: text });
    if (res.success) {
      setCommentText({ ...commentText, [id]: '' });
      // Refresh comments
      const cRes = await api.get(`/announcements/${id}/comments`);
      if (cRes.success) {
        setAnnouncements(prev => prev.map(a => a.id === id ? {
          ...a,
          comments: cRes.comments,
          commentCount: (a.commentCount || 0) + 1
        } : a));
      }
    }
  };

  return (
    <div className="animate-in" style={{ background: '#f0f2f5', minHeight: '100vh' }}>
      <Topbar title="Institutional Feed" subtitle="Social-style updates, official announcements, and student engagement." />

      <main className="page-content" style={{ maxWidth: 680, margin: '0 auto', padding: '20px 10px' }}>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, opacity: 0.5 }}>Syncing institutional feed...</div>
        ) : announcements.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 60 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📢</div>
            <h3 style={{ fontSize: 18, fontWeight: 800 }}>No announcements yet.</h3>
            <p style={{ opacity: 0.6 }}>Check back later for official updates.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {announcements.map((a) => (
              <div key={a.id} className="card animate-in" style={{ padding: 0, overflow: 'hidden', borderRadius: 12, border: 'none', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>

                {/* Post Header */}
                <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 42, height: 42, borderRadius: '50%', border: '1px solid #eee', overflow: 'hidden', flexShrink: 0 }}>
                      <img src="/images/chcc.jpg" alt="CHCC" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15, color: '#050505' }}>{a.author}</div>
                      <div style={{ fontSize: 12, color: '#65676b', display: 'flex', alignItems: 'center', gap: 4 }}>
                        {a.date} · 🌍
                        {a.important && <span style={{ color: '#e41e3f', fontWeight: 800 }}>[URGENT]</span>}
                      </div>
                    </div>
                  </div>
                  <span style={{
                    fontSize: 11, fontWeight: 800, background: '#e7f3ff', color: '#1877f2',
                    padding: '4px 10px', borderRadius: 20
                  }}>
                    {a.category}
                  </span>
                </div>

                {/* Post Content */}
                <div style={{ padding: '4px 16px 16px', fontSize: 15, lineHeight: 1.5, color: '#050505' }}>
                  <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>{a.title}</h3>
                  <p style={{ whiteSpace: 'pre-wrap' }}>{a.content}</p>
                </div>

                {/* Post Image */}
                {a.image_url && (
                  <div style={{ background: '#f0f2f5', borderTop: '1px solid #e5e5e5', borderBottom: '1px solid #e5e5e5' }}>
                    <img src={a.image_url} alt="Announcement" style={{ width: '100%', maxHeight: 500, objectFit: 'contain', background: '#000' }} />
                  </div>
                )}

                {/* Comment Interaction Only */}
                <div style={{ padding: '10px 16px', display: 'flex', justifyContent: 'center', borderTop: '1px solid #eee' }}>
                  <button
                    className="btn-social"
                    style={{ width: '100%', color: a.showComments ? '#1877f2' : '#65676b', justifyContent: 'center' }}
                    onClick={() => toggleComments(a.id)}
                  >
                    <span style={{ fontSize: 18 }}>💬</span> {a.showComments ? 'Hide Comments' : `View ${a.commentCount} student comments`}
                  </button>
                </div>

                {/* Comments Section */}
                {a.showComments && (
                  <div style={{ padding: '12px 16px', background: '#fff', borderTop: '1px solid #e5e5e5', display: 'flex', flexDirection: 'column', gap: 16 }}>

                    {/* Comment Input */}
                    <div style={{ display: 'flex', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0 }}>
                        {user?.photo_url ? <img src={user.photo_url} style={{ width: '100%', height: '100%', borderRadius: '50%' }} /> : user?.name[0]}
                      </div>
                      <input
                        placeholder="Add a comment..."
                        value={commentText[a.id] || ''}
                        onChange={e => setCommentText({ ...commentText, [a.id]: e.target.value })}
                        onKeyDown={e => e.key === 'Enter' && handlePostComment(a.id)}
                        style={{
                          flex: 1, padding: '8px 16px', background: '#f0f2f5',
                          border: 'none', borderRadius: 20, fontSize: 13, outline: 'none'
                        }}
                      />
                    </div>

                    {/* Comment List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {a.comments?.map(c => (
                        <div key={c.id} style={{ display: 'flex', gap: 10 }}>
                          <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, flexShrink: 0 }}>
                            {c.userPhoto ? <img src={c.userPhoto} style={{ width: '100%', height: '100%', borderRadius: '50%' }} /> : c.userName[0]}
                          </div>
                          <div style={{ background: '#f0f2f5', padding: '10px 14px', borderRadius: 16, flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 2 }}>{c.userName}</div>
                            <div style={{ fontSize: 13, color: '#333', lineHeight: 1.4 }}>{c.content}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            ))}
          </div>
        )}

        <style jsx>{`
          .btn-social {
            background: transparent;
            border: none;
            padding: 10px;
            border-radius: 6px;
            color: #65676b;
            font-weight: 700;
            font-size: 14;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 10px;
            transition: background 0.2s;
          }
          .btn-social:hover {
            background: #f2f2f2;
          }
        `}</style>
      </main>
    </div>
  );
}
