import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import { playTap, playError } from '../lib/sound';
import { searchBooks, getAllSubjects, type Book } from '../lib/queries';
import { Search as SearchIcon, Clock, ArrowUpRight, SlidersHorizontal, ChevronDown } from 'lucide-react';

const RECENT_KEY = 'opac_recent_searches';

function getRecent(): string[] {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'); }
  catch { return []; }
}

function saveRecent(q: string) {
  const prev = getRecent().filter(r => r !== q);
  localStorage.setItem(RECENT_KEY, JSON.stringify([q, ...prev].slice(0, 6)));
}

export default function Search() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Book[]>([]);
  const [recent, setRecent] = useState<string[]>(getRecent());
  const [subjects, setSubjects] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isAdvanced, setIsAdvanced] = useState(false);
  
  // Advanced search state
  const [advTitle, setAdvTitle] = useState('');
  const [advAuthor, setAdvAuthor] = useState('');
  const [advSubject, setAdvSubject] = useState('');
  const [advFormat, setAdvFormat] = useState('');
  const [advYearFrom, setAdvYearFrom] = useState('');
  const [advYearTo, setAdvYearTo] = useState('');

  useEffect(() => {
    getAllSubjects().then(setSubjects);
  }, []);

  useEffect(() => { if (!isAdvanced) inputRef.current?.focus(); }, [isAdvanced]);

  useEffect(() => {
    if (query.trim().length < 2 || isAdvanced) { setSuggestions([]); return; }
    searchBooks(query).then(res => setSuggestions(res.slice(0, 6)));
  }, [query, isAdvanced]);

  const doSearch = (q: string) => {
    if (!q.trim()) { playError(); return; }
    saveRecent(q.trim());
    setRecent(getRecent());
    playTap();
    navigate(`/results?q=${encodeURIComponent(q.trim())}`);
  };

  const doAdvancedSearch = (e: React.FormEvent) => {
    e.preventDefault();
    playTap();
    const params = new URLSearchParams();
    if (advTitle.trim()) params.set('title', advTitle.trim());
    if (advAuthor.trim()) params.set('author', advAuthor.trim());
    if (advSubject) params.set('subject', advSubject);
    if (advFormat) params.set('format', advFormat);
    if (advYearFrom) params.set('year_from', advYearFrom);
    if (advYearTo) params.set('year_to', advYearTo);
    
    // Fallback if empty
    if ([...params.entries()].length === 0) { playError(); return; }
    
    navigate(`/results?${params.toString()}`);
  };

  const clearRecent = () => {
    localStorage.removeItem(RECENT_KEY);
    setRecent([]);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F7F3E8', display: 'flex', flexDirection: 'column' }}>
      <TopBar title="Search" showBack showSearch={false} />
      
      <main style={{ padding: '56px 0 80px', flex: 1 }}>
        {/* Sticky Glass Search Header */}
        <div style={{
          padding: '16px 16px 20px',
          position: 'sticky', top: '56px', zIndex: 10,
          background: 'rgba(247, 243, 232, 0.7)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.3)',
          transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          boxShadow: isAdvanced ? '0 12px 32px rgba(21,94,99,0.05)' : 'none',
        }}>
          
          <form
            onSubmit={e => { e.preventDefault(); doSearch(query); }}
            style={{ position: 'relative', zIndex: 2 }}
          >
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <input
                  id="search-input"
                  ref={inputRef}
                  type="search"
                  placeholder="Title, author, keyword…"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  style={{
                    width: '100%', padding: '16px 48px 16px 20px',
                    borderRadius: '20px', border: '1.5px solid rgba(255,255,255,0.8)',
                    background: 'rgba(255,255,255,0.85)', fontSize: '16px', color: '#111',
                    fontFamily: 'Inter, sans-serif', outline: 'none',
                    boxSizing: 'border-box',
                    boxShadow: '0 8px 32px rgba(21, 94, 99, 0.08), inset 0 2px 4px rgba(255,255,255,0.5)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = '#155E63';
                    e.target.style.background = 'white';
                    e.target.style.boxShadow = '0 12px 48px rgba(21, 94, 99, 0.15), inset 0 2px 4px rgba(255,255,255,0.8)';
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = 'rgba(255,255,255,0.8)';
                    e.target.style.background = 'rgba(255,255,255,0.85)';
                    e.target.style.boxShadow = '0 8px 32px rgba(21, 94, 99, 0.08), inset 0 2px 4px rgba(255,255,255,0.5)';
                  }}
                />
                <div style={{ position: 'absolute', right: '18px', top: '50%', transform: 'translateY(-50%)', display: 'flex', color: '#155E63' }}>
                  <SearchIcon size={22} strokeWidth={2.5} />
                </div>
              </div>
            </div>
          </form>

          {/* Advanced Search Toggle & Panel */}
          <div style={{ marginTop: '16px' }}>
            <button 
               onClick={() => { playTap(); setIsAdvanced(!isAdvanced); }} 
               style={{ 
                 background: isAdvanced ? 'rgba(21,94,99,0.08)' : 'rgba(255,255,255,0.5)', border: isAdvanced ? '1px solid rgba(21,94,99,0.2)' : '1px solid rgba(255,255,255,0.5)',
                 display: 'flex', alignItems: 'center', gap: '8px', 
                 color: '#155E63', fontSize: '13px', fontWeight: 600, cursor: 'pointer', padding: '8px 14px',
                 borderRadius: '99px', transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                 boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
               }}
               onMouseEnter={e => !isAdvanced && (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.8)')}
               onMouseLeave={e => !isAdvanced && (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.5)')}
               onMouseDown={e => e.currentTarget.style.transform = 'scale(0.96)'}
               onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
            >
               <SlidersHorizontal size={14} strokeWidth={2.5} />
               Advanced Options
               <ChevronDown size={14} strokeWidth={2.5} style={{ transform: isAdvanced ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }} />
            </button>

            <div style={{
              overflow: 'hidden',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              maxHeight: isAdvanced ? '500px' : '0',
              opacity: isAdvanced ? 1 : 0,
              marginTop: isAdvanced ? '12px' : '0',
            }}>
              <form onSubmit={doAdvancedSearch} style={{
                backgroundColor: 'white', borderRadius: '16px', padding: '16px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                border: '1px solid #EDE9DD'
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#6B6B6B', marginBottom: '6px', letterSpacing: '0.05em' }}>TITLE</label>
                    <input type="text" value={advTitle} onChange={e => setAdvTitle(e.target.value)} className="adv-input" placeholder="Exact or partial" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#6B6B6B', marginBottom: '6px', letterSpacing: '0.05em' }}>AUTHOR</label>
                    <input type="text" value={advAuthor} onChange={e => setAdvAuthor(e.target.value)} className="adv-input" placeholder="Last name, First" />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#6B6B6B', marginBottom: '6px', letterSpacing: '0.05em' }}>SUBJECT</label>
                    <select value={advSubject} onChange={e => setAdvSubject(e.target.value)} className="adv-input">
                      <option value="">Any Subject</option>
                      {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#6B6B6B', marginBottom: '6px', letterSpacing: '0.05em' }}>FORMAT</label>
                    <select value={advFormat} onChange={e => setAdvFormat(e.target.value)} className="adv-input">
                      <option value="">Any Format</option>
                      <option value="physical">Physical Book</option>
                      <option value="ebook">E-Book</option>
                    </select>
                  </div>
                </div>
                <div style={{ marginBottom: '16px' }}>
                   <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#6B6B6B', marginBottom: '6px', letterSpacing: '0.05em' }}>PUBLICATION YEAR</label>
                   <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                     <input type="number" placeholder="From" value={advYearFrom} onChange={e => setAdvYearFrom(e.target.value)} className="adv-input" />
                     <span style={{ color: '#A3A3A3', fontSize: '12px', fontWeight: 500 }}>—</span>
                     <input type="number" placeholder="To" value={advYearTo} onChange={e => setAdvYearTo(e.target.value)} className="adv-input" />
                   </div>
                </div>
                <button
                  type="submit"
                  style={{
                    width: '100%', padding: '14px',
                    background: 'linear-gradient(135deg, #155E63 0%, #0F4347 100%)',
                    color: 'white', borderRadius: '12px', border: 'none',
                    fontWeight: 500, fontSize: '14px', cursor: 'pointer',
                    fontFamily: 'Inter, sans-serif',
                    boxShadow: '0 4px 12px rgba(21, 94, 99, 0.25)',
                    transition: 'transform 0.15s, box-shadow 0.15s',
                  }}
                  onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.98)'; e.currentTarget.style.boxShadow = '0 2px 6px rgba(21, 94, 99, 0.2)'; }}
                  onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(21, 94, 99, 0.25)'; }}
                >
                  Apply Filters
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Autocomplete suggestions */}
        {!isAdvanced && suggestions.length > 0 && (
          <div style={{ padding: '8px 16px', animation: 'fadeInUp 0.3s ease both' }}>
            {suggestions.map((book, i) => (
              <button
                key={book.id}
                onClick={() => doSearch(book.title)}
                className="suggestion-item"
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '14px 16px', backgroundColor: 'white', borderRadius: '12px',
                  border: 'none', cursor: 'pointer', textAlign: 'left',
                  marginBottom: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  animation: `fadeInUp 0.3s ease ${i * 0.05}s both`,
                }}
              >
                <div style={{ flexShrink: 0, color: '#155E63', display: 'flex' }}>
                   <SearchIcon size={18} strokeWidth={1.5} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '14px', fontWeight: 500, color: '#252525', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', marginBottom: '2px' }}>{book.title}</div>
                  <div style={{ fontSize: '12px', color: '#6B6B6B' }}>{book.subject}</div>
                </div>
                <div style={{ flexShrink: 0, color: '#A3A3A3', display: 'flex' }}>
                   <ArrowUpRight size={16} strokeWidth={1.5} />
                </div>
              </button>
            ))}
          </div>
        )}

        {/* No suggestions — show recent + subjects */}
        {!isAdvanced && suggestions.length === 0 && (
          <div style={{ animation: 'fadeInUp 0.4s ease 0.1s both' }}>
            {/* Recent searches */}
            {recent.length > 0 && (
              <section style={{ padding: '16px 20px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h2 style={{ fontSize: '12px', fontWeight: 600, color: '#6B6B6B', margin: 0, letterSpacing: '0.05em' }}>RECENT SEARCHES</h2>
                  <button onClick={clearRecent} style={{ background: 'none', border: 'none', color: '#155E63', fontSize: '12px', fontWeight: 500, cursor: 'pointer', padding: '4px' }}>
                    Clear
                  </button>
                </div>
                <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '8px', boxShadow: '0 2px 12px rgba(0,0,0,0.03)' }}>
                  {recent.map((r, i) => (
                    <button
                      key={r}
                      onClick={() => doSearch(r)}
                      className="recent-item"
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: '14px',
                        padding: '12px 12px', background: 'none', border: 'none', cursor: 'pointer',
                        textAlign: 'left', borderBottom: i < recent.length - 1 ? '1px solid #F7F3E8' : 'none',
                      }}
                    >
                      <div style={{ color: '#A3A3A3', display: 'flex' }}><Clock size={16} strokeWidth={1.5} /></div>
                      <span style={{ fontSize: '14px', color: '#252525', fontWeight: 400, flex: 1 }}>{r}</span>
                      <ArrowUpRight size={14} color="#D4D4D4" />
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Browse by subject chips */}
            <section style={{ padding: '28px 20px' }}>
              <h2 style={{ fontSize: '12px', fontWeight: 600, color: '#6B6B6B', margin: '0 0 16px', letterSpacing: '0.05em' }}>POPULAR SUBJECTS</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {subjects.map(s => (
                  <button
                    key={s}
                    onClick={() => { playTap(); navigate(`/results?subject=${encodeURIComponent(s)}`); }}
                    className="subject-chip"
                    style={{
                      padding: '10px 18px', borderRadius: '999px',
                      backgroundColor: 'white', border: '1.5px solid transparent',
                      color: '#252525', fontSize: '13px', cursor: 'pointer',
                      fontFamily: 'Inter, sans-serif', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </section>
          </div>
        )}
      </main>

      <BottomNav />

      <style>{`
        @keyframes fadeInUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        
        .adv-input {
          width: 100%;
          padding: 12px 14px;
          border-radius: 10px;
          border: 1.5px solid #E5E0D8;
          background-color: #FAFAFA;
          font-size: 13px;
          color: #252525;
          font-family: Inter, sans-serif;
          outline: none;
          transition: all 0.2s;
          appearance: auto;
          box-sizing: border-box;
        }
        .adv-input:focus {
          border-color: #155E63;
          background-color: white;
          box-shadow: 0 0 0 3px rgba(21, 94, 99, 0.1);
        }
        
        .suggestion-item {
          transition: transform 0.2s, background-color 0.2s !important;
        }
        .suggestion-item:hover {
          background-color: #F8FBFB !important;
          transform: translateX(4px) !important;
        }
        
        .recent-item {
          transition: background-color 0.2s, padding-left 0.2s !important;
          border-radius: 8px;
        }
        .recent-item:hover {
          background-color: #F8FBFB !important;
          padding-left: 16px !important;
        }
        
        .subject-chip:hover {
          border-color: #155E63 !important;
          color: #155E63 !important;
          background-color: #F8FBFB !important;
          transform: translateY(-2px) !important;
          box-shadow: 0 6px 12px rgba(21, 94, 99, 0.1) !important;
        }
      `}</style>
    </div>
  );
}
