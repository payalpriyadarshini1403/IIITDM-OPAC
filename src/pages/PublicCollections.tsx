import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import { playTap, playSuccess } from '../lib/sound';
import { getAllCollections, getBookById, getUserById, type Collection, type Book, type User } from '../lib/queries';
import BookCover from '../components/BookCover';

export default function PublicCollections() {
  const navigate = useNavigate();
  
  const [publicCols, setPublicCols] = useState<Collection[]>([]);
  const [bookCache, setBookCache] = useState<Record<string, Book>>({});
  const [userCache, setUserCache] = useState<Record<string, User>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const cols = await getAllCollections();
      const pCols = cols.filter(c => c.visibility === 'public');
      setPublicCols(pCols);
      
      const bCache: Record<string, Book> = {};
      const uCache: Record<string, User> = {};
      
      for (const col of pCols) {
        if (!uCache[col.owner_id]) {
          const u = await getUserById(col.owner_id);
          if (u) uCache[col.owner_id] = u;
        }
        for (const bid of col.book_ids) {
          if (!bCache[bid]) {
            const b = await getBookById(bid);
            if (b) bCache[bid] = b;
          }
        }
      }
      setBookCache(bCache);
      setUserCache(uCache);
      setIsLoading(false);
    })();
  }, []);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F7F3E8' }}>
      <TopBar title="Public Collections" showBack />
      <BottomNav />
      <main style={{ padding: '68px 16px 80px', animation: 'fadeIn 0.35s ease both' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 500, color: '#252525', margin: '4px 0 4px' }}>Community Collections</h1>
        <p style={{ fontSize: '13px', color: '#6B6B6B', margin: '0 0 16px' }}>Reading lists shared by the IIITDM community</p>
        
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <div style={{ width: '30px', height: '30px', border: '3px solid #EDE9DD', borderTopColor: '#155E63', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {publicCols.map(col => {
              const owner = userCache[col.owner_id];
              const books = col.book_ids.map(id => bookCache[id]).filter(Boolean);
              return (
                <div key={col.id} style={{ backgroundColor: 'white', borderRadius: '14px', padding: '14px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 500, color: '#252525', marginBottom: '3px' }}>{col.name}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#155E63', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '10px', fontWeight: 500 }}>
                          {owner ? owner.name[0] : '?'}
                        </div>
                        <span style={{ fontSize: '12px', color: '#6B6B6B' }}>{owner?.name ?? 'Unknown'}</span>
                        {owner?.role === 'faculty' && (
                          <span style={{ padding: '1px 5px', borderRadius: '4px', backgroundColor: '#EEF2FF', color: '#4338CA', fontSize: '10px', fontWeight: 500 }}>Faculty</span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => { playTap(); playSuccess(); alert('Following this collection! (stub)'); }}
                      style={{
                        padding: '6px 12px', borderRadius: '8px',
                        border: '1.5px solid #155E63', backgroundColor: 'transparent',
                        color: '#155E63', fontSize: '12px', fontWeight: 500,
                        cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                      }}
                    >
                      + Follow
                    </button>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', scrollbarWidth: 'none' }}>
                    {books.slice(0, 5).map(b => (
                      <button
                        key={b.id}
                        onClick={() => { playTap(); navigate(`/book/${b.id}`); }}
                        style={{ flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                      >
                        <div style={{ width: '52px', height: '70px', borderRadius: '6px', overflow: 'hidden', backgroundColor: '#EDE9DD' }}>
                          <BookCover book={b} />
                        </div>
                      </button>
                    ))}
                    {books.length > 5 && (
                      <div style={{ flexShrink: 0, width: '52px', height: '70px', borderRadius: '6px', backgroundColor: '#F7F3E8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: '#6B6B6B' }}>
                        {books.length}+
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
      <style>{`
        @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>
    </div>
  );
}
