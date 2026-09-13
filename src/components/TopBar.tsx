import { useNavigate } from 'react-router-dom';
import { playTap } from '../lib/sound';

interface TopBarProps {
  title: string;
  showBack?: boolean;
  onMenuOpen?: () => void;
  showSearch?: boolean;
}

export default function TopBar({ title, showBack = false, onMenuOpen, showSearch = true }: TopBarProps) {
  const navigate = useNavigate();
  const PURPLE = '#7C6EFA';

  return (
    <header
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
        height: '56px',
        background: 'rgba(255,255,255,0.88)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(124,110,250,0.1)',
        boxShadow: '0 1px 0 rgba(26,26,62,0.06)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        gap: '12px',
        zIndex: 50,
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      {showBack ? (
        <button onClick={() => { playTap(); navigate(-1); }}
          style={{ background: '#F4F3FF', border: 'none', borderRadius: '12px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, transition: 'background 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.background = '#ECEAFF'}
          onMouseLeave={e => e.currentTarget.style.background = '#F4F3FF'}
          aria-label="Go back">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7C6EFA" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
      ) : (
        <button onClick={() => { playTap(); onMenuOpen?.(); }}
          style={{ background: '#F4F3FF', border: 'none', borderRadius: '12px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
          aria-label="Open menu">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7C6EFA" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="7" x2="21" y2="7"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="17" x2="21" y2="17"/>
          </svg>
        </button>
      )}

      <h1 style={{ flex: 1, fontSize: '17px', fontWeight: 700, color: '#1A1A3E', margin: 0, letterSpacing: '-0.01em' }}>
        {title}
      </h1>

      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
        {showSearch && (
          <button onClick={() => { playTap(); navigate('/search'); }}
            style={{ background: '#F4F3FF', border: 'none', borderRadius: '12px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            aria-label="Search">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#7C6EFA" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </button>
        )}
        <button onClick={() => playTap()}
          style={{ background: '#F4F3FF', border: 'none', borderRadius: '12px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' }}
          aria-label="Notifications">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#7C6EFA" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
          </svg>
          <span style={{ position: 'absolute', top: '7px', right: '7px', width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#FF6B9D', border: '1.5px solid white' }} />
        </button>
      </div>
    </header>
  );
}
