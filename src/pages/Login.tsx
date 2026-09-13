import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { playSuccess, playError } from '../lib/sound';

export default function Login() {
  const navigate = useNavigate();
  const { login, loginAsGuest } = useAuth();
  const [instituteId, setInstituteId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!instituteId.trim()) { setError('Please enter your Institute ID'); return; }
    setLoading(true);
    setError('');
    const ok = await login(instituteId.trim(), password);
    setLoading(false);
    if (ok) { playSuccess(); navigate('/home', { replace: true }); }
    else     { playError();   setError('Invalid credentials. Please try again.'); }
  };

  const handleGuest = () => {
    loginAsGuest();
    navigate('/home', { replace: true });
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#F7F3E8',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Top teal strip */}
      <div style={{
        backgroundColor: '#155E63',
        padding: '48px 24px 40px',
        borderBottomLeftRadius: '28px',
        borderBottomRightRadius: '28px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <svg width="28" height="28" viewBox="0 0 44 44" fill="none">
            <rect x="4" y="6" width="28" height="34" rx="3" stroke="white" strokeWidth="2.2"/>
            <rect x="12" y="6" width="28" height="34" rx="3" fill="rgba(255,255,255,0.15)" stroke="white" strokeWidth="2.2"/>
            <line x1="17" y1="16" x2="32" y2="16" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <line x1="17" y1="22" x2="32" y2="22" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <line x1="17" y1="28" x2="25" y2="28" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span style={{ color: 'white', fontSize: '18px', fontWeight: 500 }}>IIITDM OPAC</span>
        </div>
        <h1 style={{ color: 'white', fontSize: '26px', fontWeight: 500, margin: '0 0 4px' }}>
          Welcome back
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', margin: 0 }}>
          Sign in with your institute credentials
        </p>
      </div>

      {/* Form card */}
      <div style={{ padding: '24px 20px', flex: 1 }}>
        <form onSubmit={handleLogin} style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          animation: 'slideUp 0.35s ease both',
        }}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#6B6B6B', marginBottom: '6px', letterSpacing: '0.04em' }}>
              INSTITUTE ID
            </label>
            <input
              id="institute-id"
              type="text"
              placeholder="e.g. BTech2024001"
              value={instituteId}
              onChange={e => setInstituteId(e.target.value)}
              autoCapitalize="none"
              autoCorrect="off"
              style={{
                width: '100%', padding: '13px 14px', borderRadius: '10px',
                border: `1.5px solid ${error ? '#B91C1C' : '#E5E0D8'}`,
                fontSize: '14px', color: '#252525', outline: 'none',
                fontFamily: 'Inter, sans-serif', transition: 'border-color 0.2s',
                boxSizing: 'border-box',
              }}
              onFocus={e => { e.target.style.borderColor = '#155E63'; }}
              onBlur={e => { e.target.style.borderColor = error ? '#B91C1C' : '#E5E0D8'; }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#6B6B6B', marginBottom: '6px', letterSpacing: '0.04em' }}>
              PASSWORD
            </label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{
                width: '100%', padding: '13px 14px', borderRadius: '10px',
                border: `1.5px solid ${error ? '#B91C1C' : '#E5E0D8'}`,
                fontSize: '14px', color: '#252525', outline: 'none',
                fontFamily: 'Inter, sans-serif', transition: 'border-color 0.2s',
                boxSizing: 'border-box',
              }}
              onFocus={e => { e.target.style.borderColor = '#155E63'; }}
              onBlur={e => { e.target.style.borderColor = error ? '#B91C1C' : '#E5E0D8'; }}
            />
          </div>

          {error && (
            <div style={{
              marginBottom: '16px', padding: '10px 12px', borderRadius: '8px',
              backgroundColor: '#FEF2F2', color: '#B91C1C', fontSize: '13px',
            }}>
              {error}
            </div>
          )}

          <button
            id="login-btn"
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '14px',
              backgroundColor: loading ? '#5B9EA0' : '#155E63',
              color: 'white', borderRadius: '12px', border: 'none',
              fontWeight: 500, fontSize: '15px', cursor: loading ? 'default' : 'pointer',
              transition: 'background-color 0.2s, transform 0.1s',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#DDD9D0' }} />
          <span style={{ color: '#6B6B6B', fontSize: '13px' }}>or</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#DDD9D0' }} />
        </div>

        <button
          id="guest-btn"
          onClick={handleGuest}
          style={{
            width: '100%', padding: '14px',
            backgroundColor: 'transparent', color: '#155E63',
            borderRadius: '12px', border: '1.5px solid #155E63',
            fontWeight: 500, fontSize: '15px', cursor: 'pointer',
            transition: 'background-color 0.15s', fontFamily: 'Inter, sans-serif',
          }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(21,94,99,0.06)'; }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
        >
          Continue as Guest
        </button>

        <p style={{ textAlign: 'center', color: '#6B6B6B', fontSize: '12px', marginTop: '20px', lineHeight: '1.6' }}>
          Guest mode allows search & browse only.<br/>
          Sign in for loans, holds & personal features.
        </p>
      </div>

      <style>{`
        @keyframes slideUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
      `}</style>
    </div>
  );
}
