import { useState, useEffect } from 'react';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import BookCard from '../components/BookCard';
import { getRecommendations, getBookById, getUserById, type Recommendation, type Book, type User } from '../lib/queries';

export default function PeerRecs() {
  const [peerRecs, setPeerRecs] = useState<Recommendation[]>([]);
  const [bookCache, setBookCache] = useState<Record<string, Book>>({});
  const [userCache, setUserCache] = useState<Record<string, User>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const allRecs = await getRecommendations();
      const pRecs = allRecs.filter(r => r.source_type === 'peer');
      setPeerRecs(pRecs);
      
      const bCache: Record<string, Book> = {};
      const uCache: Record<string, User> = {};
      
      for (const rec of pRecs) {
        if (!bCache[rec.book_id]) {
          const b = await getBookById(rec.book_id);
          if (b) bCache[rec.book_id] = b;
        }
        if (rec.source_user_id && !uCache[rec.source_user_id]) {
          const u = await getUserById(rec.source_user_id);
          if (u) uCache[rec.source_user_id] = u;
        }
      }
      setBookCache(bCache);
      setUserCache(uCache);
      setIsLoading(false);
    })();
  }, []);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F7F3E8' }}>
      <TopBar title="Peer Recommendations" showBack />
      <BottomNav />
      <main style={{ padding: '68px 16px 80px', animation: 'fadeIn 0.35s ease both' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 500, color: '#252525', margin: '4px 0 4px' }}>Peer Picks</h1>
        <p style={{ fontSize: '13px', color: '#6B6B6B', margin: '0 0 16px' }}>What your fellow students are recommending</p>
        
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <div style={{ width: '30px', height: '30px', border: '3px solid #EDE9DD', borderTopColor: '#155E63', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {peerRecs.map(rec => {
              const book = bookCache[rec.book_id];
              const peer = rec.source_user_id ? userCache[rec.source_user_id] : null;
              if (!book) return null;
              return (
                <div key={rec.id}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#155E63', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '12px', fontWeight: 500 }}>
                      {peer ? peer.name[0] : 'P'}
                    </div>
                    <div>
                      <span style={{ fontSize: '12px', fontWeight: 500, color: '#252525' }}>{peer?.name ?? 'Peer'}</span>
                      <span style={{ fontSize: '11px', color: '#6B6B6B' }}> · {rec.subject}</span>
                    </div>
                  </div>
                  <BookCard book={book} />
                  {rec.note && (
                    <div style={{ margin: '4px 0 0', padding: '10px 12px', backgroundColor: '#F7F3E8', borderRadius: '8px', borderLeft: '3px solid #155E63' }}>
                      <p style={{ fontSize: '12px', color: '#6B6B6B', margin: 0, fontStyle: 'italic', lineHeight: '1.6' }}>"{rec.note}"</p>
                    </div>
                  )}
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
