import { useState, useEffect } from 'react';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import BookCard from '../components/BookCard';
import { getRecommendations, getBookById, getUserById, type Recommendation, type Book, type User } from '../lib/queries';

export default function PersonalRecs() {
  const [recs, setRecs] = useState<Recommendation[]>([]);
  const [bookCache, setBookCache] = useState<Record<string, Book>>({});
  const [userCache, setUserCache] = useState<Record<string, User>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const allRecs = await getRecommendations();
      setRecs(allRecs);
      
      const bCache: Record<string, Book> = {};
      const uCache: Record<string, User> = {};
      
      for (const rec of allRecs) {
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
      <TopBar title="Recommendations" showBack />
      <BottomNav />
      <main style={{ padding: '68px 16px 80px', animation: 'fadeIn 0.35s ease both' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 500, color: '#252525', margin: '4px 0 4px' }}>For You</h1>
        <p style={{ fontSize: '13px', color: '#6B6B6B', margin: '0 0 16px' }}>Curated picks from faculty & peers</p>
        
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <div style={{ width: '30px', height: '30px', border: '3px solid #EDE9DD', borderTopColor: '#155E63', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {recs.map(rec => {
              const book = bookCache[rec.book_id];
              const source = rec.source_user_id ? userCache[rec.source_user_id] : null;
              if (!book) return null;
              
              return (
                <div key={rec.id}>
                  <div style={{ fontSize: '11px', color: '#6B6B6B', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{
                      padding: '2px 6px', borderRadius: '4px', fontWeight: 500,
                      backgroundColor: rec.source_type === 'faculty' ? '#EEF2FF' : '#F0FDF4',
                      color: rec.source_type === 'faculty' ? '#4338CA' : '#166534',
                    }}>
                      {rec.source_type === 'faculty' ? '🎓 Faculty' : '🤝 Peer'}
                    </span>
                    <span>{source?.name ?? 'Anonymous'} · {rec.subject}</span>
                  </div>
                  <BookCard book={book} />
                  {rec.note && (
                    <div style={{ margin: '4px 0 8px', padding: '10px 12px', backgroundColor: '#F7F3E8', borderRadius: '8px', borderLeft: '3px solid #D99A5B' }}>
                      <p style={{ fontSize: '12px', color: '#6B6B6B', margin: 0, fontStyle: 'italic', lineHeight: '1.6' }}>
                        "{rec.note}"
                      </p>
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
