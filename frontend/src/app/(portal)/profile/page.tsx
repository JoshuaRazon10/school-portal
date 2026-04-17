'use client';
import { useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import Topbar from '@/components/Topbar/Topbar';
import { api } from '@/lib/api';
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
      const res = await api.post('/profile/upload-photo', formData);
      
      if (res.success) {
        const updatedUser = { ...user, photo_url: res.photoUrl };
        localStorage.setItem('portal_user', JSON.stringify(updatedUser));
        showToast('Institutional identity synchronized.', 'success');
        setTimeout(() => window.location.reload(), 1000);
      } else {
        showToast(res.message || 'Upload protocol exception.', 'error');
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
        <div className="profile-hero-section">
          <div className="profile-banner">
            <div className="banner-overlay" />
            <div className="banner-content">
              <h1 className="banner-name">{user?.name}</h1>
              <p className="banner-course">{user?.course || 'Institutional Administration'}</p>
            </div>
          </div>

          <div className="avatar-container" onClick={handlePhotoClick}>
            <div className="avatar-wrapper">
              {user?.photo_url ? (
                <img src={user.photo_url} alt="Profile" className="avatar-image" />
              ) : (
                <div className="avatar-placeholder">{user?.name?.[0]}</div>
              )}
            </div>
            <div className="avatar-edit-badge">📷</div>
            {uploading && <div className="avatar-upload-overlay">SYNCING...</div>}
          </div>
        </div>

        <input type="file" ref={fileInputRef} onChange={handleFileChange} hidden accept="image/*" />

        {/* Content Matrix */}
        <div className="profile-content-grid">

          <div className="profile-main-column">
            {/* Scholastic Status Cards */}
            {user?.role === 'student' && (
              <div className="grid-cols-3 responsive-grid">
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
              <h3 className="ledger-title">Institutional Identity Ledger</h3>
              <div className="ledger-grid">
                {profileItems.map((item, i) => (
                  <div key={i} className="ledger-item">
                    <div className="ledger-icon">{item.icon}</div>
                    <div>
                      <div className="ledger-label">{item.label}</div>
                      <div className="ledger-value">{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Security Sidebar */}
          <div className="security-sidebar">
            <div className="modern-card security-card">
              <div style={{ fontSize: 48, marginBottom: 24 }}>🛡️</div>
              <h3 style={{ fontSize: 20, fontWeight: 950, marginBottom: 16 }}>Security Management</h3>
              <p className="security-desc">Update your institutional security keys to maintain secure access to the portal.</p>
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
                  const res = await api.post('/profile/change-password', { oldPassword: oldPass, newPassword: newPass });
                  if (res.success) {
                    showToast(res.message, 'success');
                    setShowPassModal(false);
                  } else {
                    showToast(res.message, 'error');
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
         
         .profile-hero-section { position: relative; margin-bottom: 120px; }
         .profile-banner { height: 240px; background: linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%); border-radius: 32px; overflow: hidden; position: relative; box-shadow: 0 20px 40px rgba(0,0,0,0.1); }
         .banner-overlay { position: absolute; inset: 0; opacity: 0.1; background: radial-gradient(circle at 20% 30%, #fff 0%, transparent 50%); }
         .banner-content { position: absolute; bottom: 40px; left: 240px; }
         .banner-name { color: #fff; font-size: 42px; font-weight: 950; letter-spacing: -1.5px; margin-bottom: 8px; }
         .banner-course { color: rgba(255,255,255,0.6); font-weight: 700; font-size: 16px; }

         .avatar-container { position: absolute; top: 120px; left: 60px; cursor: pointer; }
         .avatar-wrapper { width: 160px; height: 160px; border-radius: 50%; border: 8px solid #f0f4f8; overflow: hidden; background: #fff; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); }
         .avatar-image { width: 100%; height: 100%; object-fit: cover; }
         .avatar-placeholder { width: 100%; height: 100%; background: #1e3a5f; color: #fff; display: flex; align-items: center; justify-content: center; fontSize: 50px; font-weight: 900; }
         .avatar-edit-badge { position: absolute; bottom: 10px; right: 10px; background: #1e3a5f; color: #fff; width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 4px solid #f0f4f8; }
         .avatar-upload-overlay { position: absolute; inset: 0; background: rgba(255,255,255,0.7); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 900; }

         .profile-content-grid { display: grid; grid-template-columns: 1fr 380px; gap: 40px; align-items: start; }
         .profile-main-column { display: flex; flexDirection: column; gap: 40px; }
         .ledger-title { font-size: 22px; font-weight: 950; margin-bottom: 32px; letter-spacing: -0.5px; }
         .ledger-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
         .ledger-item { display: flex; gap: 20px; align-items: center; }
         .ledger-icon { width: 54px; height: 54px; border-radius: 16px; background: #f8fafc; border: 1.5px solid #edf2f7; display: flex; align-items: center; justify-content: center; font-size: 24px; }
         .ledger-label { font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; margin-bottom: 4px; }
         .ledger-value { font-size: 15px; font-weight: 800; color: #1e293b; }

         .security-sidebar { position: sticky; top: 120px; }
         .security-desc { color: #64748b; font-size: 14px; line-height: 1.6; margin-bottom: 32px; font-weight: 600; }

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

         @media (max-width: 1024px) {
            .profile-hero-section { margin-bottom: 160px; }
            .profile-content-grid { grid-template-columns: 1fr; gap: 32px; }
            .security-sidebar { position: static; }
            .banner-content { left: 0; right: 0; text-align: center; bottom: 80px; }
            .banner-name { font-size: 28px; }
            .avatar-container { top: 160px; left: 50%; transform: translateX(-50%); }
         }

         @media (max-width: 768px) {
            .profile-banner { height: 180px; border-radius: 20px; }
            .banner-content { text-align: center; left: 0; right: 0; bottom: 100px; padding: 0 20px; }
            .banner-name { font-size: 24px; }
            .avatar-wrapper { width: 120px; height: 120px; border: 6px solid #f0f4f8; }
            .avatar-container { top: 120px; }
            .ledger-grid { grid-template-columns: 1fr; gap: 24px; }
            .modern-card { padding: 24px; }
         }

      `}</style>
    </div>
  );
}
