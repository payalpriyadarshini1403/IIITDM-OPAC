import { NavLink, useLocation } from 'react-router-dom';
import { playTap } from '../lib/sound';

const PURPLE = '#7C6EFA';
const TEXT3 = '#9B9BB4';

import { Home, Search, List, User } from 'lucide-react';

const NAV_ITEMS = [
  {
    to: '/home', label: 'Home',
    icon: (active: boolean) => <Home size={22} color={active ? PURPLE : TEXT3} strokeWidth={1.8} />
  },
  {
    to: '/search', label: 'Search',
    icon: (active: boolean) => <Search size={22} color={active ? PURPLE : TEXT3} strokeWidth={1.8} />
  },
  {
    to: '/browse', label: 'Browse',
    icon: (active: boolean) => <List size={22} color={active ? PURPLE : TEXT3} strokeWidth={1.8} />
  },
  {
    to: '/account', label: 'Account',
    icon: (active: boolean) => <User size={22} color={active ? PURPLE : TEXT3} strokeWidth={1.8} />
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
