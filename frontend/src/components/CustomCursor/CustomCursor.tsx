'use client';
import { useEffect, useState, useRef } from 'react';

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  
  const targetPos = useRef({ x: 0, y: 0 });
  const [followerPos, setFollowerPos] = useState({ x: 0, y: 0 });
  const followerPosRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      targetPos.current = { x: e.clientX, y: e.clientY };
      setPosition({ x: e.clientX, y: e.clientY });
      setIsVisible(true);
      
      const target = e.target as HTMLElement;
      setIsHovering(
        !!(target.tagName === 'BUTTON' || 
        target.tagName === 'A' || 
        target.closest('button') || 
        target.closest('a') ||
        target.classList.contains('card') ||
        target.getAttribute('role') === 'button')
      );
    };

    const onMouseLeave = () => setIsVisible(false);
    const onMouseEnter = () => setIsVisible(true);
    
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseleave', onMouseLeave);
    window.addEventListener('mouseenter', onMouseEnter);

    let animationFrameId: number;
    const updateFollower = () => {
      const dx = targetPos.current.x - followerPosRef.current.x;
      const dy = targetPos.current.y - followerPosRef.current.y;
      
      followerPosRef.current.x += dx * 0.15;
      followerPosRef.current.y += dy * 0.15;
      
      setFollowerPos({ x: followerPosRef.current.x, y: followerPosRef.current.y });
      animationFrameId = requestAnimationFrame(updateFollower);
    };
    
    updateFollower();

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseleave', onMouseLeave);
      window.removeEventListener('mouseenter', onMouseEnter);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <>
      <div style={{
        position: 'fixed',
        top: 0, left: 0,
        width: 8, height: 8,
        background: 'var(--primary)',
        borderRadius: '50%',
        pointerEvents: 'none',
        zIndex: 10000,
        transform: `translate3d(${position.x - 4}px, ${position.y - 4}px, 0)`,
        transition: 'transform 0.05s linear',
      }} />
      <div style={{
        position: 'fixed',
        top: 0, left: 0,
        width: isHovering ? 60 : 32,
        height: isHovering ? 60 : 32,
        border: '1.5px solid var(--primary-light)',
        background: isHovering ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
        borderRadius: '50%',
        pointerEvents: 'none',
        zIndex: 9999,
        transform: `translate3d(${followerPos.x - (isHovering ? 30 : 16)}px, ${followerPos.y - (isHovering ? 30 : 16)}px, 0)`,
        transition: 'width 0.3s ease, height 0.3s ease, background 0.3s ease',
        mixBlendMode: 'multiply',
        opacity: 0.6
      }} />
    </>
  );
}
