import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import SideMenu from '../components/SideMenu';
import BookCard from '../components/BookCard';
import { playTap } from '../lib/sound';
import { MessageSquare, Heart, Send, ExternalLink, X } from 'lucide-react';
import {
  getAllBooks, getRecommendations, getBookById, getAllSubjects,
  getFeedPosts, createPost, likePost, getComments, addComment,
  type Book, type Post, type Comment
} from '../lib/queries';

// ─── Background with Blobs (REQUIRED for glassmorphism to be visible) ─────────
function GlassBG() {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {/* Rich gradient base */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #1a4a6b 0%, #155E63 30%, #0f4d4d 55%, #1a3a5c 80%, #2a1a4e 100%)' }} />
      {/* Glowing color blobs */}
      <div style={{ position: 'absolute', top: '-120px', left: '-80px', width: '420px', height: '420px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(21,200,180,0.55) 0%, transparent 70%)', filter: 'blur(40px)', animation: 'blobFloat 8s ease-in-out infinite' }} />
      <div style={{ position: 'absolute', top: '30%', right: '-100px', width: '380px', height: '380px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.5) 0%, transparent 70%)', filter: 'blur(40px)', animation: 'blobFloat 10s ease-in-out infinite reverse' }} />
      <div style={{ position: 'absolute', bottom: '20%', left: '-60px', width: '320px', height: '320px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(244,114,182,0.4) 0%, transparent 70%)', filter: 'blur(40px)', animation: 'blobFloat 7s ease-in-out infinite 2s' }} />
      <div style={{ position: 'absolute', bottom: '-80px', right: '20%', width: '350px', height: '350px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(234,179,8,0.35) 0%, transparent 70%)', filter: 'blur(50px)', animation: 'blobFloat 9s ease-in-out infinite 1s' }} />
      <div style={{ position: 'absolute', top: '55%', left: '30%', width: '250px', height: '250px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.35) 0%, transparent 70%)', filter: 'blur(30px)', animation: 'blobFloat 11s ease-in-out infinite 3s' }} />
      {/* Noise texture overlay */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.03, backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")' }} />
    </div>
  );
}

// ─── Glass Panel style ─────────────────────────────────────────────────────────
const GLASS: React.CSSProperties = {
  background: 'rgba(255,255,255,0.12)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  border: '1px solid rgba(255,255,255,0.22)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.3)',
};

const GLASS_CARD: React.CSSProperties = {
  background: 'rgba(255,255,255,0.1)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.18)',
  boxShadow: '0 4px 24px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.25)',
};

const TEXT_PRIMARY = '#ffffff';
const TEXT_SECONDARY = 'rgba(255,255,255,0.7)';
const TEXT_MUTED = 'rgba(255,255,255,0.45)';

// ─── Comment Sheet ─────────────────────────────────────────────────────────────
function CommentSheet({ post, user, onClose, onRefresh }: {
  post: Post; user: { id: string; name: string } | null;
  onClose: () => void; onRefresh: () => void;
}) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getComments(post.id).then(c => { setComments(c); setLoading(false); });
    setTimeout(() => inputRef.current?.focus(), 350);
  }, [post.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !user) return;
    await addComment(post.id, user.id, text.trim());
    setText('');
    const updated = await getComments(post.id);
    setComments(updated);
    onRefresh();
  };

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 600, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '540px', background: 'rgba(15,40,60,0.9)', backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)', border: '1px solid rgba(255,255,255,0.15)', borderBottom: 'none', borderRadius: '28px 28px 0 0', maxHeight: '80vh', display: 'flex', flexDirection: 'column', boxShadow: '0 -20px 60px rgba(0,0,0,0.5)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '14px 0 0' }}>
          <div style={{ width: '40px', height: '4px', borderRadius: '99px', background: 'rgba(255,255,255,0.25)' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', padding: '12px 20px 16px' }}>
          <span style={{ flex: 1, fontWeight: 700, fontSize: '17px', color: '#fff' }}>💬 Comments {comments.length > 0 && `(${comments.length})`}</span>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 16px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '32px', color: TEXT_MUTED }}>Loading…</div>
          ) : comments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: TEXT_SECONDARY }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>💬</div>
              <div style={{ fontWeight: 600, fontSize: '16px', color: '#fff' }}>No comments yet</div>
              <div style={{ fontSize: '13px', marginTop: '6px' }}>Be the first to comment!</div>
            </div>
          ) : comments.map(c => (
            <div key={c.id} style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: c.author_role === 'faculty' ? 'linear-gradient(135deg,#f59e0b,#d97706)' : 'linear-gradient(135deg,#06b6d4,#0891b2)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '14px', flexShrink: 0 }}>
                {c.author_name?.[0] || '?'}
              </div>
              <div style={{ flex: 1, ...GLASS_CARD, borderRadius: '16px', padding: '10px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '5px' }}>
                  <span style={{ fontWeight: 600, fontSize: '13px', color: '#fff' }}>{c.author_name}</span>
                  {c.author_role === 'faculty' && <span style={{ padding: '1px 6px', background: 'rgba(245,158,11,0.2)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '4px', fontSize: '9px', fontWeight: 800, textTransform: 'uppercase' as const }}>Faculty</span>}
                  <span style={{ fontSize: '11px', color: TEXT_MUTED, marginLeft: 'auto' }}>{new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p style={{ fontSize: '14px', color: TEXT_SECONDARY, margin: 0, lineHeight: 1.5 }}>{c.content}</p>
              </div>
            </div>
          ))}
        </div>

        {user && (
          <form onSubmit={handleSubmit} style={{ padding: '12px 16px 24px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg,#06b6d4,#0891b2)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '14px', flexShrink: 0 }}>{user.name[0]}</div>
            <input ref={inputRef} value={text} onChange={e => setText(e.target.value)} placeholder="Write a comment…"
              style={{ flex: 1, padding: '11px 16px', borderRadius: '99px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.1)', fontSize: '14px', fontFamily: 'Inter,sans-serif', outline: 'none', color: 'white', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}
              onFocus={e => e.target.style.borderColor = 'rgba(255,255,255,0.5)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.2)'}
            />
            <button type="submit" disabled={!text.trim()} style={{ width: '42px', height: '42px', borderRadius: '50%', background: text.trim() ? 'linear-gradient(135deg,#06b6d4,#0891b2)' : 'rgba(255,255,255,0.1)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: text.trim() ? 'pointer' : 'not-allowed', flexShrink: 0, transition: 'all 0.2s' }}>
              <Send size={16} color="white" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// ─── Post Card ─────────────────────────────────────────────────────────────────
function PostCard({ post, currentUser, onRefresh }: { post: Post; currentUser: { id: string; name: string } | null; onRefresh: () => void }) {
  const [liked, setLiked] = useState(false);
  const [localLikes, setLocalLikes] = useState(post.likes);
  const [showComments, setShowComments] = useState(false);
  const [heartBump, setHeartBump] = useState(false);

  const timeAgo = (d: string) => {
    const diff = Date.now() - new Date(d).getTime();
    const m = Math.floor(diff / 60000), h = Math.floor(m / 60), dy = Math.floor(h / 24);
    if (dy > 0) return `${dy}d ago`; if (h > 0) return `${h}h ago`; if (m > 0) return `${m}m ago`; return 'just now';
  };

  const handleLike = async () => {
    if (liked) return;
    setLiked(true); setLocalLikes(l => l + 1); setHeartBump(true);
    setTimeout(() => setHeartBump(false), 500);
    await likePost(post.id); onRefresh();
  };

  return (
    <>
      <div style={{ ...GLASS, borderRadius: '24px', overflow: 'hidden', transition: 'transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s ease' }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 20px 60px rgba(0,0,0,0.35)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.25)'; }}
      >
        <div style={{ padding: '20px 20px 0' }}>
          {/* Author */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: post.author_role === 'faculty' ? 'linear-gradient(135deg,#f59e0b,#d97706)' : 'linear-gradient(135deg,#06b6d4,#0284c7)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 800, boxShadow: '0 4px 16px rgba(0,0,0,0.3)' }}>
                {post.author_name?.[0] || '?'}
              </div>
              <div style={{ position: 'absolute', bottom: 0, right: 0, width: '13px', height: '13px', background: '#34d399', border: '2.5px solid rgba(255,255,255,0.3)', borderRadius: '50%' }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' as const }}>
                <span style={{ fontWeight: 700, fontSize: '15px', color: '#fff' }}>{post.author_name}</span>
                {post.author_role === 'faculty' && <span style={{ padding: '2px 8px', background: 'rgba(245,158,11,0.2)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '99px', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase' as const }}>Faculty</span>}
              </div>
              <div style={{ fontSize: '12px', color: TEXT_MUTED, marginTop: '2px' }}>{timeAgo(post.created_at)}</div>
            </div>
          </div>

          {/* Content */}
          <p style={{ fontSize: '15px', color: TEXT_SECONDARY, lineHeight: 1.7, margin: '0 0 16px', whiteSpace: 'pre-wrap' }}>{post.content}</p>

          {/* Link card */}
          {post.link_url && (
            <a href={post.link_url} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.25)', borderRadius: '16px', marginBottom: '16px', textDecoration: 'none', transition: 'background 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(6,182,212,0.18)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(6,182,212,0.1)'}
            >
              <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg,#06b6d4,#0284c7)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <ExternalLink size={16} color="white" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '11px', color: TEXT_MUTED, marginBottom: '2px', textTransform: 'uppercase' as const, fontWeight: 600, letterSpacing: '0.05em' }}>Link</div>
                <div style={{ fontSize: '13px', color: '#67e8f9', fontWeight: 600, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{post.link_url}</div>
              </div>
            </a>
          )}
        </div>

        {/* Actions bar */}
        <div style={{ display: 'flex', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <button onClick={handleLike}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px', background: liked ? 'rgba(239,68,68,0.12)' : 'transparent', border: 'none', cursor: 'pointer', color: liked ? '#f87171' : TEXT_SECONDARY, fontSize: '14px', fontWeight: 600, transition: 'all 0.2s', borderRight: '1px solid rgba(255,255,255,0.08)', fontFamily: 'Inter,sans-serif' }}
            onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'}
            onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <Heart size={20} fill={liked ? '#f87171' : 'none'} color={liked ? '#f87171' : 'currentColor'}
              style={{ transform: heartBump ? 'scale(1.5)' : 'scale(1)', transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1)' }} />
            {localLikes > 0 ? localLikes : 'Like'}
          </button>
          <button onClick={() => setShowComments(true)}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px', background: 'transparent', border: 'none', cursor: 'pointer', color: TEXT_SECONDARY, fontSize: '14px', fontWeight: 600, fontFamily: 'Inter,sans-serif', transition: 'all 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'}
            onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <MessageSquare size={20} />
            {post.comment_count ? post.comment_count : 'Comment'}
          </button>
        </div>
      </div>
      {showComments && <CommentSheet post={post} user={currentUser} onClose={() => setShowComments(false)} onRefresh={onRefresh} />}
    </>
  );
}

// ─── Home Page ─────────────────────────────────────────────────────────────────
export default function Home() {
  const navigate = useNavigate();
  const { user, isGuest } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const [recentBooks, setRecentBooks] = useState<Book[]>([]);
  const [recommendedBooks, setRecommendedBooks] = useState<Book[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostLink, setNewPostLink] = useState('');
  const [showPostLink, setShowPostLink] = useState(false);
  const [postFocused, setPostFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    const [allB, recs, subs, p] = await Promise.all([getAllBooks(), getRecommendations(), getAllSubjects(), getFeedPosts()]);
    setRecentBooks(allB.slice(0, 4));
    const recBooks = await Promise.all(recs.slice(0, 3).map(r => getBookById(r.book_id)));
    setRecommendedBooks(recBooks.filter(Boolean) as Book[]);
    setSubjects(subs);
    setPosts(p);
    setIsLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim() || !user) return;
    playTap();
    await createPost(user.id, newPostContent.trim(), newPostLink.trim() || undefined);
    setNewPostContent(''); setNewPostLink(''); setShowPostLink(false); setPostFocused(false);
    const p = await getFeedPosts(); setPosts(p);
  };

  if (isLoading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
      <GlassBG />
      <div style={{ ...GLASS, borderRadius: '24px', padding: '40px 48px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <div style={{ width: '48px', height: '48px', border: '3px solid rgba(255,255,255,0.15)', borderTopColor: '#06b6d4', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
        <div style={{ fontSize: '15px', color: TEXT_SECONDARY, fontWeight: 500 }}>Loading your library…</div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const greeting = user ? `Hello, ${user.name.split(' ')[0]} 👋` : 'Hello, Guest 👋';

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      <GlassBG />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <TopBar title="Library" onMenuOpen={() => setMenuOpen(true)} />
        <SideMenu open={menuOpen} onClose={() => setMenuOpen(false)} />

        <main style={{ padding: '72px 0 96px' }}>

          {/* ── Hero ── */}
          <div style={{ padding: '28px 20px 0', animation: 'fadeUp 0.5s ease both' }}>
            <p style={{ fontSize: '13px', color: TEXT_MUTED, margin: '0 0 4px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
            <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#fff', margin: '0 0 24px', letterSpacing: '-0.02em' }}>{greeting}</h1>

            {/* Search bar */}
            <div onClick={() => navigate('/search')}
              style={{ ...GLASS, display: 'flex', alignItems: 'center', gap: '12px', padding: '15px 18px', borderRadius: '18px', cursor: 'pointer', transition: 'all 0.25s ease' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.18)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <span style={{ fontSize: '15px', color: TEXT_MUTED }}>Search books, authors, subjects…</span>
            </div>
          </div>

          {/* ── Quick Actions ── */}
          <div style={{ padding: '20px 20px 0', animation: 'fadeUp 0.5s ease 0.07s both' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
              {[
                { label: 'New Arrivals', emoji: '✨', action: () => navigate('/browse') },
                { label: 'E-Books', emoji: '📱', action: () => navigate('/results?format=ebook') },
                { label: 'Due Today', emoji: '⏰', action: () => navigate('/account') },
                { label: 'My Holds', emoji: '🔖', action: () => navigate('/account') },
              ].map(a => (
                <button key={a.label} onClick={() => { playTap(); a.action(); }}
                  style={{ ...GLASS_CARD, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '16px 6px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.18)', cursor: 'pointer', transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)' }}
                  onMouseDown={e => e.currentTarget.style.transform = 'scale(0.9)'}
                  onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                  onTouchStart={e => e.currentTarget.style.transform = 'scale(0.9)'}
                  onTouchEnd={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <span style={{ fontSize: '26px' }}>{a.emoji}</span>
                  <span style={{ fontSize: '11px', color: TEXT_SECONDARY, fontWeight: 600, textAlign: 'center', lineHeight: 1.3 }}>{a.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ── Campus Feed ── */}
          <section style={{ padding: '28px 16px 0', animation: 'fadeUp 0.5s ease 0.14s both' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-0.02em' }}>Campus Feed</h2>
              <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 0 0 rgba(239,68,68,0.5)', animation: 'pingDot 2s infinite' }} />
              <span style={{ fontSize: '12px', color: TEXT_MUTED, marginLeft: 'auto', fontWeight: 600 }}>LIVE</span>
            </div>

            {/* Post composer */}
            {!isGuest && (
              <form onSubmit={handleCreatePost} style={{ ...GLASS, borderRadius: '24px', padding: '18px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ width: '46px', height: '46px', borderRadius: '50%', background: 'linear-gradient(135deg,#06b6d4,#0284c7)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 800, flexShrink: 0, boxShadow: '0 4px 12px rgba(6,182,212,0.4)' }}>
                    {user?.name[0]}
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <textarea value={newPostContent} onChange={e => setNewPostContent(e.target.value)} onFocus={() => setPostFocused(true)}
                      placeholder="Share a recommendation, thought, or update…"
                      style={{ width: '100%', border: 'none', outline: 'none', resize: 'none', minHeight: postFocused ? '80px' : '44px', fontFamily: 'Inter,sans-serif', fontSize: '15px', backgroundColor: 'transparent', color: '#fff', transition: 'min-height 0.3s ease', lineHeight: 1.6, boxSizing: 'border-box' }}
                    />
                    {postFocused && (
                      <>
                        {showPostLink && (
                          <input value={newPostLink} onChange={e => setNewPostLink(e.target.value)} placeholder="https://…"
                            style={{ padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.08)', fontSize: '13px', fontFamily: 'Inter,sans-serif', outline: 'none', color: 'white', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}
                          />
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <button type="button" onClick={() => setShowPostLink(v => !v)}
                            style={{ padding: '6px 12px', background: 'rgba(6,182,212,0.15)', border: '1px solid rgba(6,182,212,0.3)', borderRadius: '99px', fontSize: '12px', fontWeight: 600, color: '#67e8f9', cursor: 'pointer' }}>
                            🔗 Link
                          </button>
                          <div style={{ flex: 1 }} />
                          <button type="button" onClick={() => { setPostFocused(false); setNewPostContent(''); setNewPostLink(''); setShowPostLink(false); }}
                            style={{ padding: '8px 14px', background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '99px', color: TEXT_SECONDARY, cursor: 'pointer', fontFamily: 'Inter,sans-serif', fontSize: '13px', fontWeight: 600 }}>
                            Cancel
                          </button>
                          <button type="submit" disabled={!newPostContent.trim()}
                            style={{ padding: '8px 20px', background: newPostContent.trim() ? 'linear-gradient(135deg,#06b6d4,#0284c7)' : 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '99px', color: 'white', cursor: newPostContent.trim() ? 'pointer' : 'not-allowed', fontFamily: 'Inter,sans-serif', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', boxShadow: newPostContent.trim() ? '0 4px 12px rgba(6,182,212,0.4)' : 'none', transition: 'all 0.2s' }}>
                            <Send size={14} /> Post
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </form>
            )}

            {/* Feed */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {posts.map((post, i) => (
                <div key={post.id} style={{ animation: `fadeUp 0.5s ease ${0.1 + i * 0.08}s both` }}>
                  <PostCard post={post} currentUser={user ? { id: user.id, name: user.name } : null} onRefresh={async () => { const p = await getFeedPosts(); setPosts(p); }} />
                </div>
              ))}
            </div>
          </section>

          {/* ── Browse by Subject ── */}
          <section style={{ marginTop: '32px', animation: 'fadeUp 0.5s ease 0.2s both' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px 14px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-0.02em' }}>Browse by Subject</h2>
              <button onClick={() => { playTap(); navigate('/browse'); }} style={{ background: 'rgba(6,182,212,0.15)', border: '1px solid rgba(6,182,212,0.3)', borderRadius: '99px', color: '#67e8f9', fontSize: '12px', fontWeight: 700, cursor: 'pointer', padding: '6px 14px' }}>See all</button>
            </div>
            <div style={{ display: 'flex', gap: '10px', padding: '0 20px', overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: '4px' }}>
              {subjects.slice(0, 7).map(subject => (
                <button key={subject} onClick={() => { playTap(); navigate(`/browse?subject=${encodeURIComponent(subject)}`); }}
                  style={{ ...GLASS_CARD, flexShrink: 0, padding: '10px 18px', borderRadius: '999px', border: '1px solid rgba(255,255,255,0.15)', color: TEXT_SECONDARY, fontSize: '13px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(6,182,212,0.2)'; e.currentTarget.style.color = '#67e8f9'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                  {subject}
                </button>
              ))}
            </div>
          </section>

          {/* ── Recently Added ── */}
          <section style={{ marginTop: '32px', animation: 'fadeUp 0.5s ease 0.25s both', padding: '0 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-0.02em' }}>Recently Added</h2>
              <button onClick={() => { playTap(); navigate('/results?q='); }} style={{ background: 'rgba(6,182,212,0.15)', border: '1px solid rgba(6,182,212,0.3)', borderRadius: '99px', color: '#67e8f9', fontSize: '12px', fontWeight: 700, cursor: 'pointer', padding: '6px 14px' }}>See all</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {recentBooks.map(book => <BookCard key={book.id} book={book} />)}
            </div>
          </section>

          {/* ── Recommended ── */}
          {!isGuest && recommendedBooks.length > 0 && (
            <section style={{ marginTop: '32px', paddingBottom: '8px', animation: 'fadeUp 0.5s ease 0.3s both' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px 14px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-0.02em' }}>Recommended</h2>
                <button onClick={() => { playTap(); navigate('/personal-recs'); }} style={{ background: 'rgba(6,182,212,0.15)', border: '1px solid rgba(6,182,212,0.3)', borderRadius: '99px', color: '#67e8f9', fontSize: '12px', fontWeight: 700, cursor: 'pointer', padding: '6px 14px' }}>See all</button>
              </div>
              <div style={{ display: 'flex', gap: '14px', padding: '0 20px', overflowX: 'auto', scrollbarWidth: 'none' }}>
                {recommendedBooks.map(book => (
                  <button key={book.id} onClick={() => { playTap(); navigate(`/book/${book.id}`); }}
                    style={{ flexShrink: 0, width: '130px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0, transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1)' }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-6px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <div style={{ width: '130px', height: '175px', borderRadius: '16px', overflow: 'hidden', marginBottom: '10px', boxShadow: '0 12px 32px rgba(0,0,0,0.4)' }}>
                      <img src={book.cover_url} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: TEXT_SECONDARY, lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>{book.title}</div>
                    <div style={{ fontSize: '11px', color: TEXT_MUTED, marginTop: '3px' }}>{book.authors[0]?.split(' ').pop()}</div>
                  </button>
                ))}
              </div>
            </section>
          )}
        </main>

        <BottomNav />
      </div>

      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes blobFloat { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(20px,-15px) scale(1.05)} 66%{transform:translate(-10px,10px) scale(0.97)} }
        @keyframes pingDot { 0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,0.5)} 50%{box-shadow:0 0 0 10px rgba(239,68,68,0)} }
        ::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
