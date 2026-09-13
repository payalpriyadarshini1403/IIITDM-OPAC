import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { type Book, getAvailabilityStatus } from '../lib/queries';
import { playTap } from '../lib/sound';
import StatusBadge from './StatusBadge';

interface BookCardProps {
  book: Book;
  compact?: boolean;
}

export default function BookCard({ book, compact = false }: BookCardProps) {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'available' | 'limited' | 'unavailable'>('available');

  useEffect(() => {
    getAvailabilityStatus(book.id).then(setStatus);
  }, [book.id]);

  return (
    <button
      onClick={() => { playTap(); navigate(`/book/${book.id}`); }}
      style={{
        display: 'flex',
        gap: '12px',
        padding: compact ? '12px' : '14px',
        backgroundColor: 'white',
        borderRadius: '12px',
        border: 'none',
        cursor: 'pointer',
        textAlign: 'left',
        width: '100%',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
      }}
      onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.98)'; }}
      onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)'; }}
      onTouchStart={e => { e.currentTarget.style.transform = 'scale(0.98)'; }}
      onTouchEnd={e => { e.currentTarget.style.transform = 'scale(1)'; }}
    >
      {/* Cover */}
      <div style={{
        width: compact ? '44px' : '56px',
        height: compact ? '60px' : '76px',
        flexShrink: 0,
        borderRadius: '6px',
        overflow: 'hidden',
        backgroundColor: '#EDE9DD',
      }}>
        <img
          src={book.cover_url}
          alt={book.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={e => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: compact ? '13px' : '14px',
          fontWeight: 500,
          color: '#252525',
          lineHeight: '1.35',
          marginBottom: '4px',
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
        }}>
          {book.title}
        </div>
        <div style={{ fontSize: '12px', color: '#6B6B6B', marginBottom: '6px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
          {book.authors[0]}{book.authors.length > 1 ? ` +${book.authors.length - 1}` : ''}
        </div>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
          <StatusBadge status={status} />
          {book.format === 'ebook' || book.format === 'both' ? (
            <span style={{
              fontSize: '11px', padding: '2px 6px', borderRadius: '4px',
              backgroundColor: '#EEF2FF', color: '#4338CA', fontWeight: 500,
            }}>E-Book</span>
          ) : null}
          <span style={{ fontSize: '11px', color: '#6B6B6B' }}>{book.published_year}</span>
        </div>
      </div>

      {/* Chevron */}
      <div style={{ display: 'flex', alignItems: 'center', paddingLeft: '4px' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B6B6B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </div>
    </button>
  );
}
