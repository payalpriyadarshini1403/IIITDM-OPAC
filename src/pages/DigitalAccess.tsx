import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import { playTap } from '../lib/sound';
import { BookOpen, FileText, Smartphone } from 'lucide-react';
import { getBookById, type Book } from '../lib/queries';

export default function DigitalAccess() {
  const { id } = useParams<{ id: string }>();
  const [book, setBook] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) getBookById(id).then(b => { setBook(b || null); setIsLoading(false); });
    else setIsLoading(false);
  }, [id]);

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#F7F3E8', paddingTop: '80px', textAlign: 'center' }}>
        <TopBar title="Digital Access" showBack />
        <BottomNav />
      </div>
    );
  }

  if (!book || (book.format !== 'ebook' && book.format !== 'both')) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#F7F3E8', paddingTop: '80px', textAlign: 'center' }}>
        <TopBar title="Digital Access" showBack />
        <p style={{ color: '#6B6B6B' }}>No digital version available for this book.</p>
        <BottomNav />
      </div>
    );
  }

  const EBOOK_OPTIONS = [
    {
      id: 'read-online',
      label: 'Read Online',
      desc: 'Stream directly in your browser — no download needed.',
      icon: <BookOpen size={24} />,
      action: () => { playTap(); alert('Opening e-reader… (stub)'); },
      primary: true,
    },
    {
      id: 'download-pdf',
      label: 'Download PDF',
      desc: 'Save for offline reading. 14-day loan, auto-expires.',
      icon: <FileText size={24} />,
      action: () => { playTap(); alert('Starting PDF download… (stub)'); },
      primary: false,
    },
    {
      id: 'download-epub',
      label: 'Download ePub',
      desc: 'Best for e-readers and mobile apps.',
      icon: <Smartphone size={24} />,
      action: () => { playTap(); alert('Starting ePub download… (stub)'); },
      primary: false,
    },
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F7F3E8' }}>
      <TopBar title="Digital Access" showBack />
      <BottomNav />

      <main style={{ padding: '68px 16px 80px', animation: 'fadeIn 0.35s ease both' }}>
        {/* Book mini-card */}
        <div style={{
          backgroundColor: 'white', borderRadius: '12px', padding: '14px',
          display: 'flex', gap: '12px', alignItems: 'center',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: '20px',
        }}>
          <div style={{ width: '48px', height: '64px', borderRadius: '6px', overflow: 'hidden', backgroundColor: '#EDE9DD', flexShrink: 0 }}>
            <img src={book.cover_url} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 500, color: '#252525', marginBottom: '3px' }}>{book.title}</div>
            <div style={{ fontSize: '12px', color: '#6B6B6B' }}>{book.authors[0]}</div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '6px', padding: '2px 8px', borderRadius: '999px', backgroundColor: '#EEF2FF' }}>
              <span style={{ fontSize: '11px', color: '#4338CA', fontWeight: 500 }}>E-Book Available</span>
            </div>
          </div>
        </div>

        {/* Access options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {EBOOK_OPTIONS.map(opt => (
            <button
              key={opt.id}
              id={opt.id}
              onClick={opt.action}
              style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                padding: '16px',
                backgroundColor: opt.primary ? '#155E63' : 'white',
                borderRadius: '14px', border: opt.primary ? 'none' : '1.5px solid #E5E0D8',
                cursor: 'pointer', textAlign: 'left',
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                transition: 'transform 0.1s ease',
                fontFamily: 'Inter, sans-serif',
              }}
              onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.98)'; }}
              onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)'; }}
            >
              <span style={{ display: 'flex', color: opt.primary ? 'white' : '#155E63' }}>{opt.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: 500, color: opt.primary ? 'white' : '#252525', marginBottom: '3px' }}>
                  {opt.label}
                </div>
                <div style={{ fontSize: '12px', color: opt.primary ? 'rgba(255,255,255,0.75)' : '#6B6B6B' }}>
                  {opt.desc}
                </div>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={opt.primary ? 'rgba(255,255,255,0.8)' : '#6B6B6B'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          ))}
        </div>

        {/* Access note */}
        <div style={{ marginTop: '20px', padding: '14px', backgroundColor: '#FFFBEB', borderRadius: '12px' }}>
          <p style={{ fontSize: '13px', color: '#B45309', margin: 0, lineHeight: '1.6' }}>
            ⓘ Digital access is subject to the library's e-book licence. Downloads are limited to 1 concurrent loan per user and auto-expire after 14 days.
          </p>
        </div>
      </main>

      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}
