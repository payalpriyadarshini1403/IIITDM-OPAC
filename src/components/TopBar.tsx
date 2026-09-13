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

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 'var(--top-bar-height)',
        backgroundColor: 'white',
        borderBottom: '1px solid #EDE9DD',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        gap: '12px',
        zIndex: 50,
      }}
    >
      {showBack ? (
        <button
          onClick={() => { playTap(); navigate(-1); }}
          style={{ background: 'none', border: 'none', padding: '8px', margin: '-8px', display: 'flex', alignItems: 'center' }}
          aria-label="Go back"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#252525" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
      ) : (
        <button
          onClick={() => { playTap(); onMenuOpen?.(); }}
          style={{ background: 'none', border: 'none', padding: '8px', margin: '-8px', display: 'flex', alignItems: 'center' }}
          aria-label="Open menu"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#252525" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
      )}

      <h1 style={{ flex: 1, fontSize: '16px', fontWeight: 500, color: '#252525', margin: 0 }}>
        {title}
      </h1>

      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
        {showSearch && (
          <button
            onClick={() => { playTap(); navigate('/search'); }}
            style={{ background: 'none', border: 'none', padding: '8px', display: 'flex', alignItems: 'center' }}
            aria-label="Search"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#252525" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </button>
        )}
        <button
          onClick={() => playTap()}
          style={{ background: 'none', border: 'none', padding: '8px', display: 'flex', alignItems: 'center', position: 'relative' }}
          aria-label="Notifications"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#252525" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
          </svg>
          <span style={{
            position: 'absolute', top: '6px', right: '6px',
            width: '7px', height: '7px', borderRadius: '50%',
            backgroundColor: '#D99A5B', border: '1.5px solid white',
          }} />
        </button>
      </div>
    </header>
  );
}
