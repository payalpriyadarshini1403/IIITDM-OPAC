import { useState } from 'react';
import { Book as BookIcon } from 'lucide-react';
import { type Book } from '../lib/queries';

interface BookCoverProps {
  book: Book;
  style?: React.CSSProperties;
}

export default function BookCover({ book, style }: BookCoverProps) {
  const [error, setError] = useState(false);

  // Map subjects to a specific tint color for the fallback
  const getSubjectColor = (subject: string) => {
    const s = subject.toLowerCase();
    if (s.includes('computer')) return '#3B82F6'; // Blue
    if (s.includes('design')) return '#10B981'; // Green
    if (s.includes('psychology')) return '#8B5CF6'; // Purple
    if (s.includes('self-development')) return '#F59E0B'; // Amber
    if (s.includes('engineering') || s.includes('materials')) return '#EF4444'; // Red
    if (s.includes('mathematics')) return '#06B6D4'; // Cyan
    if (s.includes('management')) return '#F97316'; // Orange
    return '#64748B'; // Default Slate
  };

  const bgColor = getSubjectColor(book.subject);
  const coverUrl = book.isbn ? `https://covers.openlibrary.org/b/isbn/${book.isbn}-M.jpg` : book.cover_url;

  if (error || !coverUrl) {
    return (
      <div style={{
        width: '100%', height: '100%',
        backgroundColor: `${bgColor}22`, // 22 is hex for ~13% opacity
        border: `1px solid ${bgColor}44`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...style
      }}>
        <BookIcon size={24} color={bgColor} strokeWidth={1.5} />
      </div>
    );
  }

  return (
    <img 
      src={coverUrl} 
      alt={book.title} 
      onError={() => setError(true)}
      style={{ width: '100%', height: '100%', objectFit: 'cover', ...style }} 
    />
  );
}
