import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Book, BookOpen } from 'lucide-react';
import { playPageFlip } from '../lib/sound';

export default function Splash() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState(0); // 0=closed, 1=opening/text, 2=dots

  useEffect(() => {
    // 0.0s - phase 0 (closed book starts)
    // 0.6s - Trigger open book and text, play sound
    const t1 = setTimeout(() => {
      setPhase(1);
      playPageFlip();
    }, 600);

    // 0.9s - Show divider and dots
    const t2 = setTimeout(() => {
      setPhase(2);
    }, 900);

    // 2.0s - Navigate
    const t3 = setTimeout(() => {
      sessionStorage.setItem('has_splashed', '1');
      navigate('/login', { replace: true });
    }, 2000);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [navigate]);

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#155E63',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        fontFamily: 'Inter, sans-serif'
      }}
    >
      {/* Icon Area */}
      <div style={{
        width: '80px', height: '80px',
        backgroundColor: 'rgba(255,255,255,0.12)',
        borderRadius: '50%', // circular badge
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative'
      }}>
        {/* Closed Book */}
        <div style={{
          position: 'absolute',
          transition: 'all 0.4s ease',
          opacity: phase >= 1 ? 0 : 1,
          transform: phase >= 1 ? 'scale(0.8)' : 'scale(1)',
        }}>
          <Book size={36} color="white" strokeWidth={2} />
        </div>
        
        {/* Open Book */}
        <div style={{
          position: 'absolute',
          transition: 'all 0.4s ease',
          opacity: phase >= 1 ? 1 : 0,
          transform: phase >= 1 ? 'scale(1)' : 'scale(1.2)',
        }}>
          <BookOpen size={36} color="white" strokeWidth={2} />
        </div>
      </div>

      {/* Wordmark */}
      <div style={{ 
        textAlign: 'center', 
        transition: 'all 0.4s ease',
        opacity: phase >= 1 ? 1 : 0,
        transform: phase >= 1 ? 'translateY(0)' : 'translateY(12px)',
      }}>
        <div style={{ color: 'white', fontSize: '22px', fontWeight: 600, letterSpacing: '0.02em' }}>
          IIITDM OPAC
        </div>
        <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: '13px', marginTop: '4px', letterSpacing: '0.05em' }}>
          Library Search & Discovery
        </div>
      </div>

      {/* Divider and Dots */}
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px',
        transition: 'all 0.4s ease',
        opacity: phase >= 2 ? 1 : 0,
        transform: phase >= 2 ? 'translateY(0)' : 'translateY(12px)',
        marginTop: '16px'
      }}>
        <div style={{ width: '40px', height: '2px', backgroundColor: '#D99A5B', borderRadius: '2px' }} />
        
        <div style={{ display: 'flex', gap: '6px' }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              width: '6px', height: '6px', borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.6)',
              animation: `pulse-dot 1.2s ease ${i * 0.2}s infinite`,
            }} />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes pulse-dot { 0%,100%{opacity:0.3;transform:scale(0.8)} 50%{opacity:1;transform:scale(1)} }
      `}</style>
    </div>
  );
}
