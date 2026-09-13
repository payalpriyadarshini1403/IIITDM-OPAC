import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { playTap } from '../lib/sound';
import { getLoansByUser } from '../lib/queries';
import { Home, Search, Library, User, Folders, LineChart, Sparkles, Users, GraduationCap, Globe, AlertTriangle } from 'lucide-react';

interface SideMenuProps {
  open: boolean;
  onClose: () => void;
}

const MENU_ITEMS = [
  { label: 'Home',                  path: '/home',               icon: <Home size={18} /> },
  { label: 'Search',                path: '/search',             icon: <Search size={18} /> },
  { label: 'Browse by Subject',     path: '/browse',             icon: <Library size={18} /> },
  { label: 'My Account',            path: '/account',            icon: <User size={18} /> },
  { label: 'My Collections',        path: '/collections',        icon: <Folders size={18} /> },
  { label: 'Reading Growth',        path: '/growth',             icon: <LineChart size={18} /> },
  { label: 'Personal Recs',         path: '/personal-recs',      icon: <Sparkles size={18} /> },
  { label: 'Peer Recommendations',  path: '/peer-recs',          icon: <Users size={18} /> },
  { label: 'Faculty Recommendations', path: '/faculty-recs',     icon: <GraduationCap size={18} /> },
  { label: 'Public Collections',    path: '/public-collections', icon: <Globe size={18} /> },
];

export default function SideMenu({ open, onClose }: SideMenuProps) {
  const navigate = useNavigate();
  const { user, isGuest, logout } = useAuth();
  
  const [dueSoonCount, setDueSoonCount] = useState(0);

  useEffect(() => {
    if (user && open) {
      getLoansByUser(user.id).then(loans => {
        const soon = loans.filter(l => {
          if (l.status !== 'active') return false;
          const due = new Date(l.due_date);
          const now = new Date();
          return (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24) <= 3;
        }).length;
        setDueSoonCount(soon);
      });
    }
  }, [user, open]);

  const handleNav = (path: string) => {
    playTap();
    navigate(path);
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)',
            zIndex: 99, transition: 'opacity 0.25s ease',
          }}
        />
      )}

      {/* Drawer */}
      <aside
        style={{
          position: 'fixed', top: 0, left: 0, bottom: 0,
          width: '280px',
          backgroundColor: 'white',
          zIndex: 100,
          transform: open ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: open ? '4px 0 24px rgba(0,0,0,0.12)' : 'none',
        }}
      >
        {/* Header */}
        <div style={{ padding: '24px 20px 16px', borderBottom: '1px solid #EDE9DD', backgroundColor: '#155E63' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '18px', color: 'white', fontWeight: 500,
            }}>
              {user ? user.name[0] : 'G'}
            </div>
            <div>
              <div style={{ color: 'white', fontWeight: 500, fontSize: '14px' }}>
                {user ? user.name : 'Guest'}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>
                {user ? user.institute_id : 'Browse mode'}
              </div>
            </div>
          </div>
          {dueSoonCount > 0 && (
            <div
              onClick={() => handleNav('/account')}
              style={{
                marginTop: '12px', padding: '8px 12px', borderRadius: '8px',
                backgroundColor: 'rgba(217,154,91,0.2)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '8px',
              }}
            >
              <AlertTriangle size={16} color="#D99A5B" />
              <span style={{ fontSize: '12px', color: '#D99A5B', fontWeight: 500 }}>
                {dueSoonCount} book{dueSoonCount > 1 ? 's' : ''} due soon
              </span>
            </div>
          )}
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
          {MENU_ITEMS.map(item => (
            <button
              key={item.path}
              onClick={() => handleNav(item.path)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: '14px',
                padding: '13px 20px', background: 'none', border: 'none',
                textAlign: 'left', cursor: 'pointer', fontSize: '14px',
                color: '#252525', transition: 'background-color 0.15s ease',
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#F7F3E8')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '24px', color: '#6B6B6B' }}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div style={{ padding: '12px 20px', borderTop: '1px solid #EDE9DD' }}>
          {(user || isGuest) ? (
            <button
              onClick={() => { logout(); navigate('/login'); onClose(); }}
              style={{
                width: '100%', padding: '11px', borderRadius: '10px',
                border: '1.5px solid #B91C1C', background: 'none',
                color: '#B91C1C', fontWeight: 500, fontSize: '14px', cursor: 'pointer',
                transition: 'background-color 0.15s ease',
              }}
            >
              Log out
            </button>
          ) : null}
        </div>
      </aside>
    </>
  );
}
