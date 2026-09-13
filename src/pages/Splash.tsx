import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => navigate('/login', { replace: true }), 1600);
    return () => clearTimeout(t);
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
      }}
    >
      {/* Logo mark */}
      <div style={{
        width: '80px', height: '80px',
        backgroundColor: 'rgba(255,255,255,0.12)',
        borderRadius: '24px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'fadeIn 0.6s ease both',
      }}>
        <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
          <rect x="4" y="6" width="28" height="34" rx="3" stroke="white" strokeWidth="2.2"/>
          <rect x="12" y="6" width="28" height="34" rx="3" fill="rgba(255,255,255,0.15)" stroke="white" strokeWidth="2.2"/>
          <line x1="17" y1="16" x2="32" y2="16" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          <line x1="17" y1="22" x2="32" y2="22" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          <line x1="17" y1="28" x2="25" y2="28" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>

      {/* Wordmark */}
      <div style={{ textAlign: 'center', animation: 'fadeIn 0.6s ease 0.15s both' }}>
        <div style={{ color: 'white', fontSize: '22px', fontWeight: 500, letterSpacing: '0.02em' }}>
          IIITDM OPAC
        </div>
        <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: '13px', marginTop: '4px', letterSpacing: '0.05em' }}>
          Library Search & Discovery
        </div>
      </div>

      {/* Progress dots */}
      <div style={{
        display: 'flex', gap: '6px', marginTop: '32px',
        animation: 'fadeIn 0.6s ease 0.3s both',
      }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: '6px', height: '6px', borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.6)',
            animation: `pulse-dot 1.2s ease ${i * 0.2}s infinite`,
          }} />
        ))}
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse-dot { 0%,100%{opacity:0.3;transform:scale(0.8)} 50%{opacity:1;transform:scale(1)} }
      `}</style>
    </div>
  );
}
