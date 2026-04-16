'use client';
import { useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import Topbar from '@/components/Topbar/Topbar';
import { useToast } from '@/context/ToastContext';

export default function Profile() {
  const { user, token } = useAuth();
  const { showToast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [showPassModal, setShowPassModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('photo', file);

    setUploading(true);
    try {
      const res = await fetch('http://localhost:5000/api/profile/upload-photo', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        const updatedUser = { ...user, photo_url: data.photoUrl };
        sessionStorage.setItem('portal_user', JSON.stringify(updatedUser));
        showToast('Institutional identity synchronized.', 'success');
        setTimeout(() => window.location.reload(), 1000);
      } else {
        showToast(data.message || 'Upload protocol exception.', 'error');
      }
    } catch (err) {
      showToast('Institutional server unreachable.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const profileItems = [
    { label: 'Portal ID', value: user?.studentId, icon: '🆔' },
    { label: 'Institutional Email', value: user?.email, icon: '📧' },
    { label: 'Contact Number', value: user?.phone || 'UNREGISTERED', icon: '📱' },
    { label: 'Current Residency', value: user?.address || 'UNREGISTERED', icon: '🏠' },
    { label: 'Birth Registry', value: user?.dob || 'UNREGISTERED', icon: '🎂' },
  ];

  return (
    <div className="animate-in" style={{ background: '#f0f4f8', minHeight: '100vh', paddingBottom: 100 }}>
      <Topbar title="My Institutional Identity" subtitle="Manage your scholastic profile and secure authentication credentials." />

      <main className="page-content" style={{ maxWidth: 1200, margin: '0 auto' }}>

        {/* Modern Hero Section */}
        <div style={{ position: 'relative', marginBottom: 120 }}>
          <div style={{
            height: 240,
            background: 'linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)',
            borderRadius: 32,
            overflow: 'hidden',
            position: 'relative',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
          }}>
            <div style={{ position: 'absolute', inset: 0, opacity: 0.1, background: 'radial-gradient(circle at 20% 30%, #fff 0%, transparent 50%)' }} />
            <div style={{ position: 'absolute', bottom: 40, left: 240 }}>
              <h1 style={{ color: '#fff', fontSize: 42, fontWeight: 950, letterSpacing: '-1.5px', marginBottom: 8 }}>{user?.name}</h1>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 700, fontSize: 16 }}>{user?.course || 'Institutional Administration'}</p>
            </div>
          </div>

          {/* Floating Avatar Overlay */}
          <div style={{ position: 'absolute', top: 120, left: 60 }}>
            <div style={{ position: 'relative', cursor: 'pointer' }} onClick={handlePhotoClick}>
              <div style={{
                width: 160, height: 160, borderRadius: '50%', border: '8px solid #f0f4f8',
                overflow: 'hidden', background: '#fff', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
              }}>
                {user?.photo_url ? (
                  <img src={user.photo_url} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', background: '#1e3a5f', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 50, fontWeight: 900 }}>
                    {user?.name?.[0]}
                  </div>
                )}
              </div>
              <div style={{
                position: 'absolute', bottom: 10, right: 10,
                background: '#1e3a5f', color: '#fff', width: 44, height: 44,
                borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '4px solid #f0f4f8'
              }}>
                📷
              </div>
              {uploading && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.7)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 900 }}>
                  SYNCING...
                </div>
              )}
            </div>
          </div>
        </div>

        <input type="file" ref={fileInputRef} onChange={handleFileChange} hidden accept="image/*" />

        {/* Content Matrix */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 40, alignItems: 'start' }}>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
            {/* Scholastic Status Cards */}
            {user?.role === 'student' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
                <div className="stat-card">
                  <div className="stat-icon">🎓</div>
                  <div>
                    <div className="stat-label">Scholastic Level</div>
                    <div className="stat-value">Year {user?.yearLevel}</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">📊</div>
                  <div>
                    <div className="stat-label">Academic GPA</div>
                    <div className="stat-value">{Number(user?.gpa).toFixed(2)}</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">✅</div>
                  <div>
                    <div className="stat-label">Account Status</div>
                    <div className="stat-value" style={{ color: '#10b981' }}>STANDBY</div>
                  </div>
                </div>
              </div>
            )}

            {/* Identity Ledger */}
            <div className="modern-card">
              <h3 style={{ fontSize: 22, fontWeight: 950, marginBottom: 32, letterSpacing: '-0.5px' }}>Institutional Identity Ledger</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }}>
                {profileItems.map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                    <div style={{ width: 54, height: 54, borderRadius: 16, background: '#f8fafc', border: '1.5px solid #edf2f7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>{item.icon}</div>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 4 }}>{item.label}</div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: '#1e293b' }}>{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Security Sidebar */}
          <div style={{ position: 'sticky', top: 120 }}>
            <div className="modern-card" style={{ background: '#fff', border: '2px solid #edf2f7' }}>
              <div style={{ fontSize: 48, marginBottom: 24 }}>🛡️</div>
              <h3 style={{ fontSize: 20, fontWeight: 950, marginBottom: 16 }}>Security Management</h3>
              <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.6, marginBottom: 32, fontWeight: 600 }}>Update your institutional security keys to maintain secure access to the portal.</p>
              <button onClick={() => setShowPassModal(true)} className="pass-btn">
                Update Security Keys
              </button>
            </div>
          </div>

        </div>

        {/* Floating Password Modal */}
        {showPassModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(12px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="animate-pop" style={{ background: '#fff', width: '100%', maxWidth: 450, borderRadius: 40, padding: 48, boxShadow: '0 30px 60px -12px rgba(0,0,0,0.3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
                <h2 style={{ fontSize: 24, fontWeight: 950, letterSpacing: '-0.5px' }}>Security Protocol</h2>
                <button onClick={() => setShowPassModal(false)} style={{ background: '#f8fafc', border: 'none', width: 44, height: 44, borderRadius: 16, cursor: 'pointer', fontSize: 18 }}>✕</button>
              </div>

              <form onSubmit={async (e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const oldPass = (form.elements.namedItem('oldPass') as HTMLInputElement).value;
                const newPass = (form.elements.namedItem('newPass') as HTMLInputElement).value;
                const confirmPass = (form.elements.namedItem('confirmPass') as HTMLInputElement).value;

                if (newPass !== confirmPass) {
                  showToast('Verification mismatch: security keys must be identical.', 'error');
                  return;
                }

                try {
                  const res = await fetch('http://localhost:5000/api/profile/change-password', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ oldPassword: oldPass, newPassword: newPass })
                  });
                  const data = await res.json();
                  if (data.success) {
                    showToast(data.message, 'success');
                    setShowPassModal(false);
                  } else {
                    showToast(data.message, 'error');
                  }
                } catch (err) {
                  showToast('Security server unreachable.', 'error');
                }
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  <div className="form-item">
                    <label>Current Security Key</label>
                    <input name="oldPass" type="password" required />
                  </div>
                  <div className="form-item">
                    <label>New Security Key</label>
                    <input name="newPass" type="password" required />
                  </div>
                  <div className="form-item">
                    <label>Confirm Security Key</label>
                    <input name="confirmPass" type="password" required />
                  </div>
                  <button type="submit" className="pass-btn" style={{ marginTop: 12, padding: 22 }}>
                    Authorize Credential Sync
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </main>

      <style jsx>{`
         .stat-card {
            background: #fff; padding: 24px; border-radius: 24px;
            display: flex; gap: 20px; align-items: center;
            border: 1.5px solid #edf2f7;box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02);
         }
         .stat-icon { width: 54px; height: 54px; border-radius: 18px; background: #eff6ff; display: flex; align-items: center; justify-content: center; font-size: 26px; }
         .stat-label { font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; margin-bottom: 2px; }
         .stat-value { font-size: 18px; font-weight: 950; color: #1e293b; }

         .modern-card { background: #fff; padding: 40px; border-radius: 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.02); border: 1.5px solid #edf2f7; }
         
         .pass-btn {
            width: 100%; padding: 18px; border-radius: 18px; border: none;
            background: #1e3a5f; color: #fff; font-weight: 900; font-size: 14px;
            text-transform: uppercase; letter-spacing: 1px; cursor: pointer;
            transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
         }
         .pass-btn:hover { transform: translateY(-4px); box-shadow: 0 15px 30px rgba(30,58,95,0.25); filter: brightness(1.1); }
         
         .form-item label { display: block; font-size: 11px; font-weight: 900; color: #94a3b8; text-transform: uppercase; margin-bottom: 10px; letter-spacing: 0.5px; }
         .form-item input { width: 100%; padding: 18px 24px; border-radius: 16px; border: 1.5px solid #e2e8f0; background: #f8fafc; font-size: 15px; font-weight: 700; outline: none; transition: 0.3s; }
         .form-item input:focus { border-color: #1e3a5f; background: #fff; box-shadow: 0 0 0 5px rgba(30,58,95,0.05); }
      `}</style>
    </div>
  );
}
