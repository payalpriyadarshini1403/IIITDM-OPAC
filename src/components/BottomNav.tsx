import { NavLink, useLocation } from 'react-router-dom';
import { playTap } from '../lib/sound';

const PURPLE = '#7C6EFA';
const TEXT3 = '#9B9BB4';

const NAV_ITEMS = [
  {
    to: '/home', label: 'Home',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? PURPLE : 'none'} stroke={active ? PURPLE : TEXT3} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    to: '/search', label: 'Search',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? PURPLE : TEXT3} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
    ),
  },
  {
    to: '/browse', label: 'Browse',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? PURPLE : TEXT3} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
        <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
      </svg>
    ),
  },
  {
    to: '/account', label: 'Account',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? PURPLE : 'none'} stroke={active ? PURPLE : TEXT3} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0, left: 0, right: 0,
        height: '72px',
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(124,110,250,0.1)',
        boxShadow: '0 -4px 20px rgba(26,26,62,0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        zIndex: 50,
        paddingBottom: 'env(safe-area-inset-bottom)',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      {NAV_ITEMS.map(item => {
        const active = location.pathname.startsWith(item.to);
        return (
          <NavLink key={item.to} to={item.to} onClick={() => playTap()}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '8px 20px', textDecoration: 'none', flex: 1, position: 'relative' }}
          >
            {active && (
              <div style={{ position: 'absolute', top: '2px', width: '28px', height: '3px', borderRadius: '99px', background: PURPLE, boxShadow: `0 2px 8px ${PURPLE}66` }} />
            )}
            <div style={{ padding: '6px 10px', borderRadius: '12px', background: active ? '#EEF0FF' : 'transparent', transition: 'all 0.2s' }}>
              {item.icon(active)}
            </div>
            <span style={{ fontSize: '10px', fontWeight: active ? 700 : 500, color: active ? PURPLE : TEXT3, letterSpacing: '0.02em', transition: 'color 0.2s' }}>
              {item.label}
            </span>
          </NavLink>
        );
      })}
    </nav>
  );
}
