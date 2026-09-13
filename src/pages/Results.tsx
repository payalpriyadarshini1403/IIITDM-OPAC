import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import BookCard from '../components/BookCard';
import { playError } from '../lib/sound';
import { searchBooks, getBooksBySubject, type Book } from '../lib/queries';
import { SearchX } from 'lucide-react';

type FormatFilter = 'all' | 'physical' | 'ebook' | 'both';
type AvailFilter = 'all' | 'available';

export default function Results() {
  const [params] = useSearchParams();
  const q = params.get('q') || '';
  const subjectParam = params.get('subject') || '';
  const formatParam = params.get('format') || '';
  
  const advTitle = params.get('title') || '';
  const advAuthor = params.get('author') || '';
  const advYearFrom = params.get('year_from') || '';
  const advYearTo = params.get('year_to') || '';

  const [format, setFormat] = useState<FormatFilter>((formatParam as FormatFilter) || 'all');
  const [avail, setAvail] = useState<AvailFilter>('all');
  const [sortBy, setSortBy] = useState<'relevance' | 'year'>('relevance');

  const [rawResults, setRawResults] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      let list: Book[] = [];
      
      if (q) {
        list = await searchBooks(q);
      } else if (subjectParam) {
        list = await getBooksBySubject(subjectParam);
      } else if (advTitle || advAuthor || advYearFrom || advYearTo) {
        // Advanced search mapping to searchBooks filters
        list = await searchBooks('', {
          title: advTitle,
          author: advAuthor,
          subject: subjectParam,
          format: formatParam,
          yearFrom: advYearFrom ? parseInt(advYearFrom, 10) : undefined,
          yearTo: advYearTo ? parseInt(advYearTo, 10) : undefined,
        });
      }

      // Client-side fallback filtering if advanced search didn't fully apply
      if (advTitle) list = list.filter(b => b.title.toLowerCase().includes(advTitle.toLowerCase()));
      if (advAuthor) list = list.filter(b => b.authors.some(a => a.toLowerCase().includes(advAuthor.toLowerCase())));
      if (advYearFrom) list = list.filter(b => b.published_year >= parseInt(advYearFrom, 10));
      if (advYearTo) list = list.filter(b => b.published_year <= parseInt(advYearTo, 10));

      setRawResults(list);
      setIsLoading(false);
    })();
  }, [q, subjectParam, advTitle, advAuthor, advYearFrom, advYearTo, formatParam]);

  const filtered = useMemo(() => {
    let list = rawResults;
    if (format !== 'all') list = list.filter(b => b.format === format || (format === 'ebook' && b.format === 'both') || (format === 'physical' && b.format === 'both'));
    
    if (avail === 'available') {
      // Mock: pretend items with id ending in '1' are checked out.
      list = list.filter(b => !b.id.endsWith('1')); 
    }
    
    if (sortBy === 'year') list = [...list].sort((a, b) => b.published_year - a.published_year);
    return list;
  }, [rawResults, format, avail, sortBy]);

  const pageTitle = subjectParam ? subjectParam : q ? `"${q}"` : advTitle || advAuthor ? 'Advanced Search' : 'All Books';

  const FILTER_CHIPS: { label: string; value: FormatFilter }[] = [
    { label: 'All', value: 'all' },
    { label: 'Physical', value: 'physical' },
    { label: 'E-Book', value: 'ebook' },
  ];

  const [didYouMean, setDidYouMean] = useState<Book[]>([]);
  useEffect(() => {
    if (q && filtered.length === 0 && !isLoading) {
       searchBooks(q.split('').slice(0, -1).join('')).then(setDidYouMean);
       playError();
    }
  }, [q, filtered.length, isLoading]);


  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F7F3E8' }}>
      <TopBar title={pageTitle} showBack />
      <BottomNav />

      <main style={{ padding: '68px 0 80px' }}>
        
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <div style={{ width: '30px', height: '30px', border: '3px solid #EDE9DD', borderTopColor: '#155E63', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          </div>
        ) : (
          <>
            {/* Results count + sort */}
            <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', color: '#6B6B6B' }}>
                {filtered.length} result{filtered.length !== 1 ? 's' : ''}
              </span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as typeof sortBy)}
                style={{
                  fontSize: '13px', color: '#252525', border: '1px solid #E5E0D8',
                  borderRadius: '8px', padding: '4px 8px', backgroundColor: 'white',
                  fontFamily: 'Inter, sans-serif', cursor: 'pointer', outline: 'none',
                }}
              >
                <option value="relevance">Relevance</option>
                <option value="year">Newest first</option>
              </select>
            </div>

            {/* Filter chips */}
            <div style={{ display: 'flex', gap: '8px', padding: '0 16px 12px', overflowX: 'auto', scrollbarWidth: 'none' }}>
              {FILTER_CHIPS.map(chip => (
                <button
                  key={chip.value}
                  onClick={() => setFormat(chip.value)}
                  style={{
                    flexShrink: 0, padding: '7px 14px', borderRadius: '999px',
                    border: `1.5px solid ${format === chip.value ? '#155E63' : '#E5E0D8'}`,
                    backgroundColor: format === chip.value ? '#155E63' : 'white',
                    color: format === chip.value ? 'white' : '#252525',
                    fontSize: '13px', fontWeight: format === chip.value ? 500 : 400,
                    cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'Inter, sans-serif',
                  }}
                >
                  {chip.label}
                </button>
              ))}
              <button
                onClick={() => setAvail(avail === 'all' ? 'available' : 'all')}
                style={{
                  flexShrink: 0, padding: '7px 14px', borderRadius: '999px',
                  border: `1.5px solid ${avail === 'available' ? '#047857' : '#E5E0D8'}`,
                  backgroundColor: avail === 'available' ? '#ECFDF5' : 'white',
                  color: avail === 'available' ? '#047857' : '#252525',
                  fontSize: '13px', fontWeight: avail === 'available' ? 500 : 400,
                  cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'Inter, sans-serif',
                }}
              >
                Available only
              </button>
            </div>

            {/* Zero state */}
            {filtered.length === 0 && (
              <div style={{ padding: '40px 24px', textAlign: 'center', animation: 'fadeIn 0.3s ease both' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px', color: '#B91C1C' }}>
                  <SearchX size={48} strokeWidth={1.5} />
                </div>
                <h2 style={{ fontSize: '17px', fontWeight: 500, color: '#252525', marginBottom: '8px' }}>
                  No results found
                </h2>
                <p style={{ fontSize: '14px', color: '#6B6B6B', lineHeight: '1.6' }}>
                  We couldn't find anything matching your search.<br/>
                  Try checking your spelling or use fewer keywords.
                </p>
                {didYouMean.length > 0 && (
                  <div style={{ marginTop: '16px', padding: '14px', backgroundColor: 'white', borderRadius: '12px', textAlign: 'left' }}>
                    <p style={{ fontSize: '13px', color: '#6B6B6B', margin: '0 0 8px' }}>Did you mean:</p>
                    {didYouMean.slice(0, 3).map(b => (
                      <div key={b.id} style={{ fontSize: '14px', color: '#155E63', fontWeight: 500, padding: '4px 0', cursor: 'pointer' }}>
                        {b.title}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Results list */}
            {filtered.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '0 16px', animation: 'fadeIn 0.3s ease both' }}>
                {filtered.map(book => <BookCard key={book.id} book={book} />)}
              </div>
            )}
          </>
        )}
      </main>

      <style>{`
        @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>
    </div>
  );
}
