import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import StatusBadge from '../components/StatusBadge';
import { playTap } from '../lib/sound';
import { getBookById, getLocationByBookId, getAvailabilityStatus, type Book, type Location } from '../lib/queries';
import { Lightbulb } from 'lucide-react';

export default function Availability() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [book, setBook] = useState<Book | null>(null);
  const [location, setLocation] = useState<Location | null>(null);
  const [status, setStatus] = useState<'available' | 'limited' | 'unavailable'>('unavailable');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) { setIsLoading(false); return; }
    (async () => {
      const [b, loc, stat] = await Promise.all([
        getBookById(id),
        getLocationByBookId(id),
        getAvailabilityStatus(id)
      ]);
      setBook(b || null);
      setLocation(loc || null);
      setStatus(stat);
      setIsLoading(false);
    })();
  }, [id]);

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#F7F3E8', paddingTop: '80px', textAlign: 'center' }}>
        <TopBar title="Availability" showBack />
        <BottomNav />
      </div>
    );
  }

  if (!book || !location) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#F7F3E8', paddingTop: '80px', textAlign: 'center', color: '#6B6B6B' }}>
        <TopBar title="Availability" showBack />
        <p>Location data not available for this book.</p>
        <BottomNav />
      </div>
    );
  }

  const INFO_ROWS = [
    { icon: '🏛️', label: 'Library',    value: location.library },
    { icon: '🏢', label: 'Floor',      value: location.floor },
    { icon: '📂', label: 'Section',    value: location.section },
    { icon: '📏', label: 'Row',        value: location.shelf_row },
    { icon: '🗂️', label: 'Bay',        value: location.bay },
    { icon: '🔖', label: 'Call Number', value: book.call_number },
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F7F3E8' }}>
      <TopBar title="Availability & Location" showBack />
      <BottomNav />

      <main style={{ padding: '68px 0 80px', animation: 'fadeIn 0.35s ease both' }}>
        {/* Book mini-card */}
        <div style={{ margin: '12px 16px', backgroundColor: 'white', borderRadius: '12px', padding: '14px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ width: '48px', height: '64px', borderRadius: '6px', overflow: 'hidden', backgroundColor: '#EDE9DD', flexShrink: 0 }}>
            <img src={book.cover_url} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '14px', fontWeight: 500, color: '#252525', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{book.title}</div>
            <div style={{ fontSize: '12px', color: '#6B6B6B', marginBottom: '6px' }}>{book.authors[0]}</div>
            <StatusBadge status={status} />
          </div>
        </div>

        {/* Location info */}
        <div style={{ margin: '12px 16px', backgroundColor: 'white', borderRadius: '12px', padding: '4px 0', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <div style={{ padding: '12px 16px 8px', borderBottom: '1px solid #F7F3E8' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 500, color: '#252525', margin: 0 }}>Physical Location</h2>
          </div>
          {INFO_ROWS.map((row, i) => (
            <div key={row.label} style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '13px 16px',
              borderBottom: i < INFO_ROWS.length - 1 ? '1px solid #F7F3E8' : 'none',
            }}>
              <span style={{ fontSize: '16px', width: '20px', textAlign: 'center' }}>{row.icon}</span>
              <span style={{ fontSize: '13px', color: '#6B6B6B', width: '90px', flexShrink: 0 }}>{row.label}</span>
              <span style={{ fontSize: '13px', color: '#252525', fontWeight: 500 }}>{row.value}</span>
            </div>
          ))}
        </div>

        {/* Open map button */}
        <div style={{ padding: '0 16px 16px' }}>
          <button
            id="open-map-btn"
            onClick={() => {
              playTap();
              navigate(`/location-map/${book.id}`, {
                state: { grid_row: location.grid_row, grid_col: location.grid_col, floor: location.floor, section: location.section }
              });
            }}
            style={{
              width: '100%', padding: '14px',
              backgroundColor: '#155E63', color: 'white',
              borderRadius: '12px', border: 'none',
              fontWeight: 500, fontSize: '15px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              fontFamily: 'Inter, sans-serif', transition: 'opacity 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
            </svg>
            Open Floor Map
          </button>
        </div>

        {/* Directions tip */}
        <div style={{ margin: '0 16px', padding: '14px', backgroundColor: '#ECFDF5', borderRadius: '12px', display: 'flex', gap: '10px' }}>
          <span style={{ display: 'flex', color: '#D99A5B' }}><Lightbulb size={20} strokeWidth={1.5} /></span>
          <p style={{ fontSize: '13px', color: '#047857', margin: 0, lineHeight: '1.6' }}>
            Ask a library staff member at the information desk on the ground floor if you need help locating this book.
          </p>
        </div>
      </main>

      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}
