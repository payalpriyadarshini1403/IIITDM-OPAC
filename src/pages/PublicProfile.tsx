import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import { playTap } from '../lib/sound';
import { getAllCollections, getUserById, getBookById, type User, type Collection, type Book } from '../lib/queries';

export default function PublicProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [publicCols, setPublicCols] = useState<Collection[]>([]);
  const [bookCache, setBookCache] = useState<Record<string, Book>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      // In a real app we'd need a fallback ID if 'id' is undefined, or just handle not found.
      // Assuming 'id' is always provided for this route.
      if (!id) {
        setIsLoading(false);
        return;
      }
      
      const user = await getUserById(id);
      if (user) {
        setProfileUser(user);
        const cols = await getAllCollections();
        const pCols = cols.filter(c => c.owner_id === user.id && c.visibility === 'public');
        setPublicCols(pCols);
        
        const bCache: Record<string, Book> = {};
        for (const col of pCols) {
          for (const bid of col.book_ids) {
            if (!bCache[bid]) {
              const b = await getBookById(bid);
              if (b) bCache[bid] = b;
            }
          }
        }
        setBookCache(bCache);
      }
      setIsLoading(false);
    })();
  }, [id]);

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#F7F3E8', paddingTop: '80px', textAlign: 'center' }}>
        <TopBar title="Public Profile" showBack />
        <BottomNav />
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#F7F3E8', paddingTop: '80px', textAlign: 'center' }}>
        <TopBar title="Profile Not Found" showBack />
        <p style={{ color: '#6B6B6B' }}>User profile not found.</p>
        <BottomNav />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F7F3E8' }}>
      <TopBar title="Public Profile" showBack />
      <BottomNav />
      <main style={{ padding: '68px 16px 80px', animation: 'fadeIn 0.35s ease both' }}>
        
        {/* Profile Header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px', backgroundColor: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%',
            backgroundColor: '#155E63', color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '32px', fontWeight: 500, marginBottom: '16px'
          }}>
            {profileUser.name[0]}
          </div>
          <h1 style={{ fontSize: '20px', fontWeight: 500, color: '#252525', margin: '0 0 4px' }}>
            {profileUser.name}
          </h1>
          <div style={{ fontSize: '14px', color: '#6B6B6B', textTransform: 'capitalize' }}>
            {profileUser.role}
          </div>
          {profileUser.role === 'faculty' && (
             <span style={{ marginTop: '8px', padding: '4px 10px', borderRadius: '6px', backgroundColor: '#EEF2FF', color: '#4338CA', fontSize: '12px', fontWeight: 500 }}>
               Faculty Member
             </span>
          )}
        </div>

        <h2 style={{ fontSize: '16px', fontWeight: 500, color: '#252525', margin: '0 0 12px' }}>
          Public Collections ({publicCols.length})
        </h2>
        
        {publicCols.length === 0 ? (
           <p style={{ color: '#6B6B6B', fontSize: '14px', textAlign: 'center', padding: '20px 0', backgroundColor: 'white', borderRadius: '12px' }}>
             This user hasn't shared any public collections yet.
           </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {publicCols.map(col => {
              const books = col.book_ids.map(bid => bookCache[bid]).filter(Boolean);
              return (
                <div key={col.id} style={{ backgroundColor: 'white', borderRadius: '14px', padding: '14px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                  <div style={{ fontSize: '15px', fontWeight: 500, color: '#252525', marginBottom: '10px' }}>{col.name}</div>
                  <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', scrollbarWidth: 'none' }}>
                    {books.slice(0, 5).map(b => (
                      <button
                        key={b.id}
                        onClick={() => { playTap(); navigate(`/book/${b.id}`); }}
                        style={{ flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                      >
                        <div style={{ width: '52px', height: '70px', borderRadius: '6px', overflow: 'hidden', backgroundColor: '#EDE9DD' }}>
                          <img src={b.cover_url} alt={b.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      </button>
                    ))}
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
