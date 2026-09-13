import { useNavigate } from 'react-router-dom';
import { playTap } from '../lib/sound';
import { ChevronLeft, Menu, Search, Bell } from 'lucide-react';

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
          <ChevronLeft size={20} color="#7C6EFA" strokeWidth={2.5} />
        </button>
      ) : (
        <button onClick={() => { playTap(); onMenuOpen?.(); }}
          style={{ background: '#F4F3FF', border: 'none', borderRadius: '12px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
          aria-label="Open menu">
          <Menu size={20} color="#7C6EFA" strokeWidth={2.5} />
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
            <Search size={18} color="#7C6EFA" strokeWidth={2.5} />
          </button>
        )}
        <button onClick={() => playTap()}
          style={{ background: '#F4F3FF', border: 'none', borderRadius: '12px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' }}
          aria-label="Notifications">
          <Bell size={18} color="#7C6EFA" strokeWidth={2.5} />
          <span style={{ position: 'absolute', top: '7px', right: '7px', width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#FF6B9D', border: '1.5px solid white' }} />
        </button>
      </div>
    </header>
  );
}
