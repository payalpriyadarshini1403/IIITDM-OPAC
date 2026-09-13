import { useState, useEffect } from 'react';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import { playTap, playSuccess } from '../lib/sound';
import { useAuth } from '../lib/auth';
import { FolderOpen, Trash2, Globe, Lock, Plus, X } from 'lucide-react';
import {
  getCollectionsByUser, createCollection, deleteCollection,
  toggleCollectionVisibility, removeBookFromCollection, getBookById,
  type Collection, type Book,
} from '../lib/queries';
import { useNavigate } from 'react-router-dom';

export default function Collections() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [bookCache, setBookCache] = useState<Record<string, Book>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newVis, setNewVis] = useState<'private' | 'public'>('private');
  const [toast, setToast] = useState('');

  const loadData = async () => {
    if (!user) { setIsLoading(false); return; }
    const cols = await getCollectionsByUser(user.id);
    setCollections(cols);
    // Cache all referenced books
    const ids = [...new Set(cols.flatMap(c => c.book_ids))];
    const cache: Record<string, Book> = {};
    await Promise.all(ids.map(async id => {
      const b = await getBookById(id);
      if (b) cache[id] = b;
    }));
    setBookCache(cache);
    setIsLoading(false);
  };

  useEffect(() => { loadData(); }, [user]);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !user) return;
    playTap();
    await createCollection(user.id, newName.trim(), newVis);
    setNewName('');
    setNewVis('private');
    setShowForm(false);
    playSuccess();
    showToast(`✓ Collection "${newName.trim()}" created!`);
    await loadData();
  };

  const handleDelete = async (col: Collection) => {
    if (!confirm(`Delete "${col.name}"? This cannot be undone.`)) return;
    playTap();
    await deleteCollection(col.id);
    showToast(`"${col.name}" deleted.`);
    await loadData();
  };

  const handleToggleVis = async (col: Collection) => {
    playTap();
    await toggleCollectionVisibility(col.id, col.visibility);
    showToast(col.visibility === 'private' ? 'Collection made public!' : 'Collection set to private.');
    await loadData();
  };

  const handleRemoveBook = async (colId: string, bookId: string) => {
    playTap();
    await removeBookFromCollection(colId, bookId);
    await loadData();
  };

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#F7F3E8', paddingTop: '80px', textAlign: 'center' }}>
        <TopBar title="My Collections" showBack />
        <BottomNav />
        <p style={{ color: '#6B6B6B', padding: '24px' }}>Sign in to access your collections.</p>
        <button onClick={() => navigate('/login')} style={{ padding: '12px 24px', backgroundColor: '#155E63', color: 'white', borderRadius: '12px', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
          Sign in
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#F7F3E8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: '#6B6B6B' }}>
          <div style={{ width: '36px', height: '36px', border: '3px solid #EDE9DD', borderTopColor: '#155E63', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 10px' }} />
          Loading…
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F7F3E8' }}>
      <TopBar title="My Collections" showBack />
      <BottomNav />

      {toast && (
        <div style={{
          position: 'fixed', top: '72px', left: '50%', transform: 'translateX(-50%)',
          backgroundColor: '#155E63', color: 'white', padding: '10px 20px',
          borderRadius: '999px', zIndex: 200, fontSize: '13px', fontWeight: 500,
          whiteSpace: 'nowrap', boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
        }}>
          {toast}
        </div>
      )}

      <main style={{ padding: '68px 16px 80px', animation: 'fadeIn 0.35s ease both' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#252525', margin: 0 }}>
            My Boards ({collections.length})
          </h1>
          <button
            onClick={() => { playTap(); setShowForm(true); }}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '9px 14px', backgroundColor: '#155E63', color: 'white',
              borderRadius: '10px', border: 'none', fontSize: '13px', fontWeight: 500,
              cursor: 'pointer', fontFamily: 'Inter, sans-serif',
            }}
          >
            <Plus size={15} />
            New
          </button>
        </div>

        {/* Create Form */}
        {showForm && (
          <form onSubmit={handleCreate} style={{ marginBottom: '24px', backgroundColor: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#252525', margin: '0 0 16px' }}>Create new board</h3>
            <input
              type="text"
              placeholder="Collection name…"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              autoFocus
              style={{
                width: '100%', padding: '11px 12px', borderRadius: '10px',
                border: '1.5px solid #E5E0D8', fontSize: '14px',
                fontFamily: 'Inter, sans-serif', outline: 'none',
                boxSizing: 'border-box', marginBottom: '10px', color: '#252525',
              }}
              onFocus={e => e.target.style.borderColor = '#155E63'}
              onBlur={e => e.target.style.borderColor = '#E5E0D8'}
            />
            {/* Visibility toggle */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              {(['private', 'public'] as const).map(v => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setNewVis(v)}
                  style={{
                    flex: 1, padding: '9px', borderRadius: '10px', border: 'none',
                    backgroundColor: newVis === v ? '#155E63' : '#F7F3E8',
                    color: newVis === v ? 'white' : '#6B6B6B',
                    fontSize: '13px', fontWeight: 500, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    fontFamily: 'Inter, sans-serif',
                  }}
                >
                  {v === 'private' ? <Lock size={13} /> : <Globe size={13} />}
                  {v.charAt(0).toUpperCase() + v.slice(1)}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="submit" style={{ flex: 2, padding: '11px', backgroundColor: '#155E63', color: 'white', borderRadius: '10px', border: 'none', fontWeight: 500, fontSize: '13px', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                Create
              </button>
              <button type="button" onClick={() => setShowForm(false)} style={{ flex: 1, padding: '11px', backgroundColor: 'transparent', color: '#6B6B6B', borderRadius: '10px', border: '1.5px solid #E5E0D8', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Empty state */}
        {collections.length === 0 && !showForm && (
          <div style={{ textAlign: 'center', padding: '48px 24px', color: '#6B6B6B' }}>
            <div style={{ marginBottom: '12px', color: '#155E63' }}>
              <FolderOpen size={52} strokeWidth={1} style={{ margin: '0 auto' }} />
            </div>
            <p style={{ fontSize: '15px', fontWeight: 500, color: '#252525', margin: '0 0 6px' }}>No collections yet</p>
            <p style={{ fontSize: '13px', margin: 0 }}>Save books you love into organized collections.</p>
          </div>
        )}

        {/* Collections Grid (Pinterest Style) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '16px' }}>
          {collections.map(col => {
            const books = col.book_ids.map(id => bookCache[id]).filter(Boolean) as Book[];
            
            // Generate Collage
            const collageCovers = books.slice(0, 3).map(b => b.cover_url);
            
            return (
              <div key={col.id} style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '8px', cursor: 'pointer' }}>
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
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A0A0A0' }}>
                      <FolderOpen size={32} />
                    </div>
                  )}
                  {/* Overlay Actions */}
                  <div style={{ position: 'absolute', top: '8px', right: '8px', display: 'flex', gap: '4px' }}>
                    <button onClick={(e) => { e.stopPropagation(); handleToggleVis(col); }} style={{ padding: '6px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.9)', border: 'none', cursor: 'pointer', color: col.visibility === 'public' ? '#047857' : '#6B6B6B', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                      {col.visibility === 'public' ? <Globe size={14} /> : <Lock size={14} />}
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(col); }} style={{ padding: '6px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.9)', border: 'none', cursor: 'pointer', color: '#B91C1C', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
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
      </main>

      <style>{`
        @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>
    </div>
  );
}
