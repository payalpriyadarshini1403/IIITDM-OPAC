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
        
        {/* Profile Header (Pinterest/Premium Style) */}
        <div className="glass hover-lift" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px', padding: '32px 24px', borderRadius: '24px', position: 'relative', overflow: 'hidden' }}>
          {/* Subtle background gradient blob */}
          <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '150px', height: '150px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(21,94,99,0.15) 0%, rgba(255,255,255,0) 70%)', zIndex: 0 }} />
          <div style={{ position: 'absolute', bottom: '-40px', left: '-40px', width: '120px', height: '120px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,163,115,0.15) 0%, rgba(255,255,255,0) 70%)', zIndex: 0 }} />
          
          <div style={{
            position: 'relative', zIndex: 1,
            width: '100px', height: '100px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #155E63 0%, #0F4347 100%)', color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '36px', fontWeight: 600, marginBottom: '20px',
            boxShadow: '0 8px 24px rgba(21,94,99,0.3), inset 0 -4px 8px rgba(0,0,0,0.15)'
          }}>
            {profileUser.name[0]}
          </div>
          <h1 style={{ position: 'relative', zIndex: 1, fontSize: '24px', fontWeight: 700, color: '#155E63', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
            {profileUser.name}
          </h1>
          <div style={{ position: 'relative', zIndex: 1, fontSize: '15px', color: '#6B6B6B', textTransform: 'capitalize', fontWeight: 500 }}>
            {profileUser.role}
          </div>
          {profileUser.role === 'faculty' && (
             <span style={{ position: 'relative', zIndex: 1, marginTop: '12px', padding: '6px 14px', borderRadius: '99px', backgroundColor: '#FFFBEB', color: '#B45309', border: '1px solid #FEF3C7', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
               Faculty Member
             </span>
          )}
        </div>
        
        {/* Profile Info Details */}
        <div style={{ marginBottom: '24px', backgroundColor: 'white', padding: '20px', borderRadius: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '12px', color: '#6B6B6B', fontWeight: 500, marginBottom: '4px' }}>Bio</div>
            <div style={{ fontSize: '14px', color: '#252525', lineHeight: 1.5 }}>{profileUser.bio || 'No bio provided.'}</div>
          </div>
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '12px', color: '#6B6B6B', fontWeight: 500, marginBottom: '4px' }}>Department</div>
            <div style={{ fontSize: '14px', color: '#252525' }}>{profileUser.department || 'Not specified'}</div>
          </div>
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '12px', color: '#6B6B6B', fontWeight: 500, marginBottom: '8px' }}>Skills</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {profileUser.skills?.length ? profileUser.skills.map(skill => (
                <span key={skill} style={{ padding: '6px 12px', backgroundColor: '#F0F5F5', color: '#155E63', borderRadius: '99px', fontSize: '12px', fontWeight: 500 }}>{skill}</span>
              )) : <span style={{ fontSize: '13px', color: '#6B6B6B' }}>None</span>}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#6B6B6B', fontWeight: 500, marginBottom: '8px' }}>Interests</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {profileUser.interests?.length ? profileUser.interests.map(interest => (
                <span key={interest} style={{ padding: '6px 12px', backgroundColor: '#F7F3E8', color: '#D4A373', borderRadius: '99px', fontSize: '12px', fontWeight: 500 }}>{interest}</span>
              )) : <span style={{ fontSize: '13px', color: '#6B6B6B' }}>None</span>}
            </div>
          </div>
        </div>

        <h2 style={{ fontSize: '16px', fontWeight: 500, color: '#252525', margin: '0 0 12px' }}>
          Public Collections ({publicCols.length})
        </h2>
        
        {/* Collections Grid (Pinterest Style) */}
        {publicCols.length === 0 ? (
           <p style={{ color: '#6B6B6B', fontSize: '14px', textAlign: 'center', padding: '20px 0', backgroundColor: 'white', borderRadius: '12px' }}>
             This user hasn't shared any public collections yet.
           </p>
        ) : (
          <div className="masonry-grid">
            {publicCols.map((col, index) => {
              const books = col.book_ids.map(bid => bookCache[bid]).filter(Boolean);
              
              // Generate Collage
              const collageCovers = books.slice(0, 3).map(b => b.cover_url);
              
              return (
                <div key={col.id} className="masonry-item hover-lift animate-stagger-up" onClick={() => { playTap(); /* Navigate later */ }} style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '8px', cursor: 'pointer', animationDelay: `${index * 0.05}s` }}>
                  <div style={{ position: 'relative', width: '100%', aspectRatio: '4/5', borderRadius: '16px', overflow: 'hidden', backgroundColor: '#E0E0E0', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                    {collageCovers.length > 0 ? (
                      collageCovers.length === 1 ? (
                        <img src={collageCovers[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : collageCovers.length === 2 ? (
                        <div style={{ display: 'flex', height: '100%' }}>
                          <img src={collageCovers[0]} alt="" style={{ width: '50%', height: '100%', objectFit: 'cover', borderRight: '1px solid white' }} />
                          <img src={collageCovers[1]} alt="" style={{ width: '50%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      ) : (
                        <div style={{ display: 'flex', height: '100%' }}>
                          <img src={collageCovers[0]} alt="" style={{ width: '60%', height: '100%', objectFit: 'cover', borderRight: '1px solid white' }} />
                          <div style={{ width: '40%', display: 'flex', flexDirection: 'column' }}>
                            <img src={collageCovers[1]} alt="" style={{ width: '100%', height: '50%', objectFit: 'cover', borderBottom: '1px solid white' }} />
                            <img src={collageCovers[2]} alt="" style={{ width: '100%', height: '50%', objectFit: 'cover' }} />
                          </div>
                        </div>
                      )
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A0A0A0', backgroundColor: '#EDE9DD' }}>
                        No Pins
                      </div>
                    )}
                  </div>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 600, color: '#252525' }}>{col.name}</div>
                    <div style={{ fontSize: '12px', color: '#6B6B6B' }}>
                      {books.length} pin{books.length !== 1 ? 's' : ''}
                    </div>
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
