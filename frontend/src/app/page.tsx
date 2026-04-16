'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [phase, setPhase] = useState<'intro' | 'zoom' | 'navigating'>('intro');

  useEffect(() => {
    // 1. Initial brand reveal (0.6s) - Cinematic delay
    const zoomTimer = setTimeout(() => {
      setPhase('zoom');
    }, 600);

    // 2. Longer, smoother zoom duration (1.2s total from start)
    const navTimer = setTimeout(() => {
      setPhase('navigating');
    }, 1800);

    return () => {
      clearTimeout(zoomTimer);
      clearTimeout(navTimer);
    };
  }, []);

  useEffect(() => {
    // Only navigate once we've reached the final scale/fade state
    if (!loading && phase === 'navigating') {
      router.replace(user ? '/dashboard' : '/login');
    }
  }, [user, loading, router, phase]);

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh',
      background: 'white',
      position: 'fixed',
      top: 0, left: 0, width: '100%', height: '100%',
      zIndex: 999,
      pointerEvents: 'none',
      // Final fade out of the entire splash container
      opacity: phase === 'navigating' ? 0 : 1,
      visibility: phase === 'navigating' ? 'hidden' : 'visible',
      transition: 'opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1), visibility 0.8s'
    }}>
      <div className={`splash-logo ${phase === 'zoom' || phase === 'navigating' ? 'zoom-effect' : ''}`} style={{ marginBottom: 32 }}>
        <Image 
          src="/images/chcc.jpg" 
          alt="CHCC Logo" 
          width={180} 
          height={180} 
          priority
          style={{ borderRadius: '50%', boxShadow: '0 25px 60px rgba(30,58,138,0.25)', border: '6px solid white' }}
        />
      </div>
      
      <div className={`branding-text ${phase === 'zoom' || phase === 'navigating' ? 'zoom-effect' : ''}`} style={{ textAlign: 'center' }}>
         <h1 style={{ fontSize: 28, fontWeight: 900, color: '#102a71', letterSpacing: '0.12em', marginBottom: 12, textTransform: 'uppercase' }}>CONCEPCION HOLY CROSS COLLEGE INC.</h1>
         <p style={{ fontSize: 14, color: '#64748b', fontWeight: 800, letterSpacing: '0.25em' }}>IN HOC SIGNO VINCES</p>
      </div>

      <style jsx>{`
        .splash-logo {
          transition: transform 1.2s cubic-bezier(0.5, 0, 0.2, 1);
        }
        .branding-text {
          transition: transform 1.2s cubic-bezier(0.5, 0, 0.2, 1), opacity 0.8s ease;
        }
        .zoom-effect {
          transform: scale(10);
          opacity: 0;
        }
      `}</style>
    </div>
  );
}
