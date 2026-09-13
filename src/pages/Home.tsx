import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import SideMenu from '../components/SideMenu';
import BookCard from '../components/BookCard';
import { playTap } from '../lib/sound';
import { Sparkles, Tablet, Clock, Bookmark, Search as SearchIcon, MessageSquare, Heart, Send } from 'lucide-react';
import { getAllBooks, getRecommendations, getBookById, getAllSubjects, getFeedPosts, createPost, likePost, type Book, type Post } from '../lib/queries';

const QUICK_ACTIONS = [
  { label: 'New Arrivals', icon: <Sparkles size={24} strokeWidth={1.5} />, subject: '' },
  { label: 'E-Books',      icon: <Tablet size={24} strokeWidth={1.5} />, filter: 'ebook' },
  { label: 'Due Today',    icon: <Clock size={24} strokeWidth={1.5} />, path: '/account' },
  { label: 'My Holds',     icon: <Bookmark size={24} strokeWidth={1.5} />, path: '/account' },
];

export default function Home() {
  const navigate = useNavigate();
  const { user, isGuest } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState('');

  const greeting = user ? `Hello, ${user.name.split(' ')[0]}` : 'Hello, Guest';

  const [recentBooks, setRecentBooks] = useState<Book[]>([]);
  const [recommendedBooks, setRecommendedBooks] = useState<Book[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const allB = await getAllBooks();
      setRecentBooks(allB.slice(0, 4));

      const recs = await getRecommendations();
      const recBooks = await Promise.all(recs.slice(0, 3).map(r => getBookById(r.book_id)));
      setRecommendedBooks(recBooks.filter(Boolean) as Book[]);

      const subs = await getAllSubjects();
      setSubjects(subs);
      
      const p = await getFeedPosts();
      setPosts(p);

      setIsLoading(false);
    })();
  }, []);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim() || !user) return;
    playTap();
    await createPost(user.id, newPostContent.trim());
    setNewPostContent('');
    const p = await getFeedPosts();
    setPosts(p);
  };

  const handleLikePost = async (postId: string) => {
    playTap();
    await likePost(postId);
    const p = await getFeedPosts();
    setPosts(p);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) navigate(`/results?q=${encodeURIComponent(query.trim())}`);
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#F7F3E8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: '#6B6B6B' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid #EDE9DD', borderTopColor: '#155E63', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F7F3E8' }}>
      <TopBar title="Library" onMenuOpen={() => setMenuOpen(true)} />
      <SideMenu open={menuOpen} onClose={() => setMenuOpen(false)} />

      <main style={{ padding: '72px 0 80px' }}>
        {/* Hero greeting */}
        <div style={{ padding: '20px 20px 0', animation: 'fadeIn 0.4s ease both' }}>
          <p style={{ fontSize: '13px', color: '#6B6B6B', margin: '0 0 2px' }}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <h1 style={{ fontSize: '22px', fontWeight: 500, color: '#252525', margin: '0 0 20px' }}>
            {greeting}
          </h1>

          {/* Main search bar */}
          <form onSubmit={handleSearch} style={{ position: 'relative', marginBottom: '20px' }}>
            <input
              id="home-search"
              type="search"
              placeholder="Search books, authors, subjects…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onClick={() => navigate('/search')}
              readOnly
              style={{
                width: '100%', padding: '14px 48px 14px 16px',
                borderRadius: '14px', border: 'none',
                backgroundColor: 'white', fontSize: '14px', color: '#252525',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                fontFamily: 'Inter, sans-serif', cursor: 'pointer',
                boxSizing: 'border-box',
              }}
            />
            <div style={{
              position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
              color: '#155E63', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <SearchIcon size={20} strokeWidth={2.2} />
            </div>
          </form>
        </div>

        {/* Quick actions */}
        <div style={{ padding: '0 20px 20px', animation: 'fadeIn 0.4s ease 0.1s both' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
            {QUICK_ACTIONS.map(action => (
              <button
                key={action.label}
                onClick={() => {
                  playTap();
                  if (action.path) navigate(action.path);
                  else if (action.filter) navigate(`/results?format=${action.filter}`);
                  else navigate('/browse');
                }}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                  padding: '12px 8px', backgroundColor: 'white', borderRadius: '12px',
                  border: 'none', cursor: 'pointer',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                  transition: 'transform 0.15s ease',
                }}
                onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.94)'; }}
                onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                onTouchStart={e => { e.currentTarget.style.transform = 'scale(0.94)'; }}
                onTouchEnd={e => { e.currentTarget.style.transform = 'scale(1)'; }}
              >
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '32px', color: '#155E63' }}>
                  {action.icon}
                </span>
                <span style={{ fontSize: '11px', color: '#252525', fontWeight: 500, textAlign: 'center', lineHeight: '1.3' }}>
                  {action.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Campus Updates / Social Feed */}
        <section style={{ marginBottom: '24px', animation: 'fadeIn 0.4s ease 0.15s both', padding: '0 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 500, color: '#252525', margin: 0 }}>Campus Updates</h2>
          </div>

          {!isGuest && (
            <form onSubmit={handleCreatePost} style={{ display: 'flex', gap: '12px', marginBottom: '16px', backgroundColor: 'white', padding: '16px', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#155E63', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 500, flexShrink: 0 }}>
                {user?.name.charAt(0)}
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <textarea 
                  value={newPostContent}
                  onChange={e => setNewPostContent(e.target.value)}
                  placeholder="Share an update or recommendation..."
                  style={{ width: '100%', border: 'none', outline: 'none', resize: 'none', minHeight: '40px', fontFamily: 'Inter, sans-serif', fontSize: '14px', backgroundColor: 'transparent' }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="submit" disabled={!newPostContent.trim()} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', backgroundColor: newPostContent.trim() ? '#155E63' : '#E5E0D8', color: newPostContent.trim() ? 'white' : '#A0A0A0', border: 'none', borderRadius: '99px', fontWeight: 500, fontSize: '13px', cursor: newPostContent.trim() ? 'pointer' : 'not-allowed', transition: 'background-color 0.2s' }}>
                    <Send size={14} /> Post
                  </button>
                </div>
              </div>
            </form>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {posts.map(post => (
              <div key={post.id} style={{ backgroundColor: 'white', borderRadius: '16px', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                {/* Author Info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: post.author_role === 'faculty' ? '#D4A373' : '#155E63', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 500 }}>
                    {post.author_name?.charAt(0) || '?'}
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#252525' }}>{post.author_name}</div>
                    <div style={{ fontSize: '12px', color: '#6B6B6B' }}>{post.author_role} • {new Date(post.created_at).toLocaleDateString()}</div>
                  </div>
                </div>
                {/* Content */}
                <p style={{ fontSize: '14px', color: '#404040', lineHeight: 1.5, margin: '0 0 12px', whiteSpace: 'pre-wrap' }}>
                  {post.content}
                </p>
                {post.link_url && (
                  <a href={post.link_url} target="_blank" rel="noreferrer" style={{ display: 'block', fontSize: '13px', color: '#155E63', textDecoration: 'none', marginBottom: '12px', padding: '12px', backgroundColor: '#F7F3E8', borderRadius: '8px', wordBreak: 'break-all' }}>
                    🔗 {post.link_url}
                  </a>
                )}
                {/* Actions */}
                <div style={{ display: 'flex', gap: '20px', borderTop: '1px solid #F0F0F0', paddingTop: '12px' }}>
                  <button onClick={() => handleLikePost(post.id)} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#6B6B6B', fontSize: '13px', fontWeight: 500, cursor: 'pointer', padding: 0 }}>
                    <Heart size={18} color={post.likes > 0 ? '#E63946' : 'currentColor'} fill={post.likes > 0 ? '#E63946' : 'none'} /> {post.likes}
                  </button>
                  <button style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#6B6B6B', fontSize: '13px', fontWeight: 500, cursor: 'pointer', padding: 0 }}>
                    <MessageSquare size={18} /> Comment
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Browse by Subject */}
        <section style={{ marginBottom: '24px', animation: 'fadeIn 0.4s ease 0.15s both' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px 12px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 500, color: '#252525', margin: 0 }}>Browse by Subject</h2>
            <button onClick={() => { playTap(); navigate('/browse'); }} style={{ background: 'none', border: 'none', color: '#155E63', fontSize: '13px', fontWeight: 500, cursor: 'pointer', padding: '4px' }}>
              See all
            </button>
          </div>
          <div style={{ display: 'flex', gap: '10px', padding: '0 20px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }}>
            {subjects.slice(0, 6).map(subject => (
              <button
                key={subject}
                onClick={() => { playTap(); navigate(`/browse?subject=${encodeURIComponent(subject)}`); }}
                style={{
                  flexShrink: 0, padding: '8px 16px', borderRadius: '999px',
                  backgroundColor: 'white', border: '1.5px solid #E5E0D8',
                  color: '#252525', fontSize: '13px', fontWeight: 500, cursor: 'pointer',
                  transition: 'border-color 0.15s, background-color 0.15s',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#155E63'; e.currentTarget.style.backgroundColor = 'rgba(21,94,99,0.05)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E0D8'; e.currentTarget.style.backgroundColor = 'white'; }}
              >
                {subject}
              </button>
            ))}
          </div>
        </section>

        {/* Recently Added */}
        <section style={{ marginBottom: '24px', animation: 'fadeIn 0.4s ease 0.2s both' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px 12px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 500, color: '#252525', margin: 0 }}>Recently Added</h2>
            <button onClick={() => { playTap(); navigate('/results?q='); }} style={{ background: 'none', border: 'none', color: '#155E63', fontSize: '13px', fontWeight: 500, cursor: 'pointer', padding: '4px' }}>
              See all
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '0 20px' }}>
            {recentBooks.map(book => <BookCard key={book.id} book={book} />)}
          </div>
        </section>

        {/* Recommended for you */}
        {!isGuest && (
          <section style={{ marginBottom: '8px', animation: 'fadeIn 0.4s ease 0.25s both' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px 12px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 500, color: '#252525', margin: 0 }}>Recommended for you</h2>
              <button onClick={() => { playTap(); navigate('/personal-recs'); }} style={{ background: 'none', border: 'none', color: '#155E63', fontSize: '13px', fontWeight: 500, cursor: 'pointer', padding: '4px' }}>
                See all
              </button>
            </div>
            <div style={{ display: 'flex', gap: '12px', padding: '0 20px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }}>
              {recommendedBooks.map(book => (
                <button
                  key={book.id}
                  onClick={() => { playTap(); navigate(`/book/${book.id}`); }}
                  style={{
                    flexShrink: 0, width: '120px', background: 'none', border: 'none',
                    cursor: 'pointer', textAlign: 'left', padding: 0,
                  }}
                >
                  <div style={{ width: '120px', height: '160px', borderRadius: '10px', overflow: 'hidden', backgroundColor: '#EDE9DD', marginBottom: '8px' }}>
                    <img src={book.cover_url} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 500, color: '#252525', lineHeight: '1.35', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {book.title}
                  </div>
                  <div style={{ fontSize: '11px', color: '#6B6B6B', marginTop: '2px' }}>
                    {book.authors[0].split(' ').slice(-1)[0]}
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}
      </main>

      <BottomNav />
      <style>{`
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>
    </div>
  );
}
