import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import SideMenu from '../components/SideMenu';
import BookCard from '../components/BookCard';
import { playTap } from '../lib/sound';
import { Sparkles, Tablet, Clock, Bookmark, Search as SearchIcon, MessageSquare, Heart, Send, ChevronDown, ExternalLink, X } from 'lucide-react';
import { getAllBooks, getRecommendations, getBookById, getAllSubjects, getFeedPosts, createPost, likePost, getComments, addComment, type Book, type Post, type Comment } from '../lib/queries';

// ─── Styles ───────────────────────────────────────────────────────────────────

const glass = {
  background: 'rgba(255,255,255,0.65)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.8)',
  boxShadow: '0 8px 32px rgba(21,94,99,0.08), inset 0 1px 0 rgba(255,255,255,0.9)',
} as const;

const glassDark = {
  background: 'rgba(21,94,99,0.85)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.12)',
  boxShadow: '0 8px 32px rgba(21,94,99,0.3)',
} as const;

const BG = 'linear-gradient(145deg, #f0ece3 0%, #e8e2d7 40%, #f2ede4 100%)';

const QUICK_ACTIONS = [
  { label: 'New Arrivals', emoji: '✨', path: '/browse' },
  { label: 'E-Books', emoji: '📱', filter: 'ebook' },
  { label: 'Due Today', emoji: '⏰', path: '/account' },
  { label: 'My Holds', emoji: '🔖', path: '/account' },
];

// ─── Comment Sheet Component ──────────────────────────────────────────────────
function CommentSheet({ post, user, onClose, onRefresh }: {
  post: Post;
  user: { id: string; name: string } | null;
  onClose: () => void;
  onRefresh: () => void;
}) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getComments(post.id).then(c => { setComments(c); setLoading(false); });
    setTimeout(() => inputRef.current?.focus(), 400);
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
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 500, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', display: 'flex', alignItems: 'flex-end' }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ width: '100%', maxWidth: '600px', margin: '0 auto', background: 'rgba(248,245,240,0.98)', backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)', borderRadius: '24px 24px 0 0', padding: '0 0 env(safe-area-inset-bottom, 0)', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}
      >
        {/* Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 0' }}>
          <div style={{ width: '36px', height: '4px', borderRadius: '999px', background: 'rgba(0,0,0,0.15)' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px 16px' }}>
          <span style={{ fontWeight: 700, fontSize: '16px', color: '#111' }}>
            {comments.length} Comment{comments.length !== 1 ? 's' : ''}
          </span>
          <button onClick={onClose} style={{ background: 'rgba(0,0,0,0.07)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <X size={16} />
          </button>
        </div>

        {/* Comments list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 16px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '32px', color: '#999' }}>Loading…</div>
          ) : comments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px', color: '#999' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>💬</div>
              <div style={{ fontWeight: 600, marginBottom: '4px' }}>No comments yet</div>
              <div style={{ fontSize: '13px' }}>Be the first to share your thoughts!</div>
            </div>
          ) : comments.map(c => (
            <div key={c.id} style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: c.author_role === 'faculty' ? 'linear-gradient(135deg, #D4A373, #A0785A)' : 'linear-gradient(135deg, #155E63, #0F4347)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '14px', flexShrink: 0 }}>
                {c.author_name?.[0] || '?'}
              </div>
              <div style={{ flex: 1, ...glass, borderRadius: '14px', padding: '12px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 600, fontSize: '13px', color: '#111' }}>{c.author_name}</span>
                  {c.author_role === 'faculty' && <span style={{ padding: '1px 6px', background: '#FFFBEB', color: '#B45309', border: '1px solid #FEF3C7', borderRadius: '4px', fontSize: '9px', fontWeight: 700, textTransform: 'uppercase' as const }}>Faculty</span>}
                  <span style={{ fontSize: '11px', color: '#999', marginLeft: 'auto' }}>{new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p style={{ fontSize: '14px', color: '#333', margin: 0, lineHeight: 1.5 }}>{c.content}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        {user && (
          <form onSubmit={handleSubmit} style={{ padding: '12px 16px 20px', borderTop: '1px solid rgba(0,0,0,0.06)', display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #155E63, #0F4347)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '14px', flexShrink: 0 }}>
              {user.name[0]}
            </div>
            <input
              ref={inputRef}
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Add a comment…"
              style={{ flex: 1, padding: '12px 16px', borderRadius: '99px', border: '1.5px solid rgba(21,94,99,0.2)', background: 'rgba(255,255,255,0.8)', fontSize: '14px', fontFamily: 'Inter, sans-serif', outline: 'none', transition: 'border-color 0.2s' }}
              onFocus={e => e.target.style.borderColor = '#155E63'}
              onBlur={e => e.target.style.borderColor = 'rgba(21,94,99,0.2)'}
            />
            <button
              type="submit"
              disabled={!text.trim()}
              style={{ width: '40px', height: '40px', borderRadius: '50%', background: text.trim() ? 'linear-gradient(135deg, #155E63, #0F4347)' : 'rgba(0,0,0,0.08)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: text.trim() ? 'pointer' : 'not-allowed', transition: 'all 0.2s', flexShrink: 0 }}
            >
              <Send size={16} color={text.trim() ? 'white' : '#999'} />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// ─── Post Card Component ──────────────────────────────────────────────────────
function PostCard({ post, currentUser, onRefresh }: {
  post: Post;
  currentUser: { id: string; name: string } | null;
  onRefresh: () => void;
}) {
  const [liked, setLiked] = useState(false);
  const [localLikes, setLocalLikes] = useState(post.likes);
  const [showComments, setShowComments] = useState(false);
  const [heartAnim, setHeartAnim] = useState(false);

  const handleLike = async () => {
    if (liked) return;
    setLiked(true);
    setLocalLikes(l => l + 1);
    setHeartAnim(true);
    setTimeout(() => setHeartAnim(false), 600);
    await likePost(post.id);
    onRefresh();
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(diff / 60000);
    const h = Math.floor(m / 60);
    const d = Math.floor(h / 24);
    if (d > 0) return `${d}d ago`;
    if (h > 0) return `${h}h ago`;
    if (m > 0) return `${m}m ago`;
    return 'just now';
  };

  return (
    <>
      <div
        style={{
          ...glass,
          borderRadius: '20px',
          overflow: 'hidden',
          transition: 'transform 0.2s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s ease',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 16px 48px rgba(21,94,99,0.12)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(21,94,99,0.08)'; }}
      >
        <div style={{ padding: '20px 20px 0' }}>
          {/* Author */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: post.author_role === 'faculty' ? 'linear-gradient(135deg, #D4A373 0%, #A0785A 100%)' : 'linear-gradient(135deg, #155E63 0%, #0F4347 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 700, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                {post.author_name?.[0] || '?'}
              </div>
              <div style={{ position: 'absolute', bottom: '1px', right: '1px', width: '12px', height: '12px', background: '#34D399', borderRadius: '50%', border: '2px solid white' }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' as const }}>
                <span style={{ fontWeight: 700, fontSize: '15px', color: '#111' }}>{post.author_name}</span>
                {post.author_role === 'faculty' && (
                  <span style={{ padding: '2px 8px', background: 'linear-gradient(135deg, #FFFBEB, #FEF3C7)', color: '#B45309', border: '1px solid #FDE68A', borderRadius: '99px', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase' as const, letterSpacing: '0.04em' }}>Faculty</span>
                )}
              </div>
              <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>{timeAgo(post.created_at)}</div>
            </div>
          </div>

          {/* Content */}
          <p style={{ fontSize: '15px', color: '#222', lineHeight: 1.65, margin: '0 0 16px', whiteSpace: 'pre-wrap' }}>
            {post.content}
          </p>

          {/* Link preview */}
          {post.link_url && (
            <a
              href={post.link_url}
              target="_blank"
              rel="noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', background: 'rgba(21,94,99,0.04)', borderRadius: '14px', textDecoration: 'none', marginBottom: '16px', border: '1px solid rgba(21,94,99,0.1)', transition: 'background 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(21,94,99,0.08)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(21,94,99,0.04)'}
            >
              <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #155E63, #0F4347)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <ExternalLink size={16} color="white" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '12px', color: '#888', marginBottom: '2px' }}>External Link</div>
                <div style={{ fontSize: '13px', color: '#155E63', fontWeight: 600, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{post.link_url}</div>
              </div>
            </a>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
          <button
            onClick={handleLike}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px 0', background: liked ? 'rgba(239,68,68,0.06)' : 'transparent', border: 'none', cursor: 'pointer', color: liked ? '#EF4444' : '#666', fontSize: '14px', fontWeight: 600, transition: 'all 0.2s', borderRight: '1px solid rgba(0,0,0,0.05)' }}
            onMouseDown={e => e.currentTarget.style.transform = 'scale(0.96)'}
            onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <Heart
              size={20}
              fill={liked ? '#EF4444' : 'none'}
              color={liked ? '#EF4444' : 'currentColor'}
              style={{ transform: heartAnim ? 'scale(1.4)' : 'scale(1)', transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1)' }}
            />
            <span>{localLikes > 0 ? localLikes : 'Like'}</span>
          </button>
          <button
            onClick={() => setShowComments(true)}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px 0', background: 'transparent', border: 'none', cursor: 'pointer', color: '#666', fontSize: '14px', fontWeight: 600, transition: 'all 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.03)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            onMouseDown={e => e.currentTarget.style.transform = 'scale(0.96)'}
            onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <MessageSquare size={20} />
            <span>{post.comment_count ? post.comment_count : 'Comment'}</span>
          </button>
        </div>
      </div>

      {showComments && (
        <CommentSheet
          post={post}
          user={currentUser}
          onClose={() => setShowComments(false)}
          onRefresh={onRefresh}
        />
      )}
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Home() {
  const navigate = useNavigate();
  const { user, isGuest } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState('');

  const greeting = user ? `Hello, ${user.name.split(' ')[0]} 👋` : 'Hello, Guest 👋';

  const [recentBooks, setRecentBooks] = useState<Book[]>([]);
  const [recommendedBooks, setRecommendedBooks] = useState<Book[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostLink, setNewPostLink] = useState('');
  const [showPostLink, setShowPostLink] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [postFocused, setPostFocused] = useState(false);

  const loadData = async () => {
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
  };

  useEffect(() => { loadData(); }, []);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim() || !user) return;
    playTap();
    await createPost(user.id, newPostContent.trim(), newPostLink.trim() || undefined);
    setNewPostContent('');
    setNewPostLink('');
    setShowPostLink(false);
    setPostFocused(false);
    await loadData();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) navigate(`/results?q=${encodeURIComponent(query.trim())}`);
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', border: '3px solid rgba(21,94,99,0.15)', borderTopColor: '#155E63', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          <div style={{ fontSize: '15px', color: '#666', fontWeight: 500 }}>Loading your library…</div>
        </div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: BG }}>
      <TopBar title="Library" onMenuOpen={() => setMenuOpen(true)} />
      <SideMenu open={menuOpen} onClose={() => setMenuOpen(false)} />

      <main style={{ padding: '72px 0 88px' }}>
        {/* ── Hero ── */}
        <div style={{ padding: '24px 20px 0', animation: 'fadeUp 0.5s ease both' }}>
          <p style={{ fontSize: '13px', color: '#888', margin: '0 0 4px', fontWeight: 500 }}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#111', margin: '0 0 20px', letterSpacing: '-0.02em' }}>
            {greeting}
          </h1>

          {/* Search Bar */}
          <form onSubmit={handleSearch}>
            <div
              onClick={() => navigate('/search')}
              style={{ ...glass, display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', borderRadius: '18px', cursor: 'pointer', transition: 'all 0.25s ease' }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 12px 40px rgba(21,94,99,0.15)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 8px 32px rgba(21,94,99,0.08)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <SearchIcon size={18} color="#155E63" strokeWidth={2.5} />
              <span style={{ fontSize: '15px', color: '#888', flex: 1 }}>Search books, authors, subjects…</span>
            </div>
          </form>
        </div>

        {/* ── Quick Actions ── */}
        <div style={{ padding: '20px 20px 0', animation: 'fadeUp 0.5s ease 0.07s both' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
            {QUICK_ACTIONS.map(action => (
              <button
                key={action.label}
                onClick={() => { playTap(); if ((action as any).path) navigate((action as any).path); else navigate(`/results?format=${(action as any).filter}`); }}
                style={{ ...glass, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '14px 8px', borderRadius: '18px', border: 'none', cursor: 'pointer', transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)' }}
                onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.92)'; }}
                onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                onTouchStart={e => { e.currentTarget.style.transform = 'scale(0.92)'; }}
                onTouchEnd={e => { e.currentTarget.style.transform = 'scale(1)'; }}
              >
                <span style={{ fontSize: '24px' }}>{action.emoji}</span>
                <span style={{ fontSize: '11px', color: '#444', fontWeight: 600, textAlign: 'center', lineHeight: 1.3 }}>{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Campus Social Feed ── */}
        <section style={{ marginTop: '28px', padding: '0 16px', animation: 'fadeUp 0.5s ease 0.14s both' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#111', margin: 0, letterSpacing: '-0.01em' }}>Campus Feed</h2>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444', boxShadow: '0 0 0 0 rgba(239,68,68,0.4)', animation: 'pingDot 2s infinite' }} />
            <span style={{ fontSize: '12px', color: '#888', marginLeft: 'auto' }}>Live</span>
          </div>

          {/* Post Composer */}
          {!isGuest && (
            <form onSubmit={handleCreatePost} style={{ ...glass, borderRadius: '20px', padding: '16px', marginBottom: '20px', transition: 'all 0.3s ease' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg, #155E63, #0F4347)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 700, flexShrink: 0, boxShadow: '0 4px 12px rgba(21,94,99,0.3)' }}>
                  {user?.name[0]}
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <textarea
                    value={newPostContent}
                    onChange={e => setNewPostContent(e.target.value)}
                    onFocus={() => setPostFocused(true)}
                    placeholder="Share a thought, book recommendation, or update…"
                    style={{ width: '100%', border: 'none', outline: 'none', resize: 'none', minHeight: postFocused ? '80px' : '44px', fontFamily: 'Inter, sans-serif', fontSize: '15px', backgroundColor: 'transparent', color: '#111', transition: 'min-height 0.3s ease', lineHeight: 1.5 }}
                  />
                  {postFocused && (
                    <>
                      {showPostLink && (
                        <input
                          value={newPostLink}
                          onChange={e => setNewPostLink(e.target.value)}
                          placeholder="https://… (optional link)"
                          style={{ padding: '10px 14px', borderRadius: '12px', border: '1.5px solid rgba(21,94,99,0.2)', fontFamily: 'Inter, sans-serif', fontSize: '13px', outline: 'none', background: 'rgba(255,255,255,0.6)', color: '#333', transition: 'border-color 0.2s' }}
                          onFocus={e => e.target.style.borderColor = '#155E63'}
                          onBlur={e => e.target.style.borderColor = 'rgba(21,94,99,0.2)'}
                        />
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          type="button"
                          onClick={() => setShowPostLink(v => !v)}
                          style={{ padding: '6px 12px', background: showPostLink ? 'rgba(21,94,99,0.1)' : 'rgba(0,0,0,0.05)', border: 'none', borderRadius: '99px', fontSize: '12px', fontWeight: 600, color: '#155E63', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          🔗 Link
                        </button>
                        <div style={{ flex: 1 }} />
                        <button
                          type="button"
                          onClick={() => { setPostFocused(false); setNewPostContent(''); setNewPostLink(''); setShowPostLink(false); }}
                          style={{ padding: '8px 14px', background: 'transparent', border: 'none', borderRadius: '99px', fontSize: '13px', fontWeight: 600, color: '#888', cursor: 'pointer' }}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={!newPostContent.trim()}
                          style={{ padding: '8px 18px', background: newPostContent.trim() ? 'linear-gradient(135deg, #155E63, #0F4347)' : 'rgba(0,0,0,0.08)', border: 'none', borderRadius: '99px', fontSize: '13px', fontWeight: 700, color: newPostContent.trim() ? 'white' : '#aaa', cursor: newPostContent.trim() ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: newPostContent.trim() ? '0 4px 12px rgba(21,94,99,0.3)' : 'none', transition: 'all 0.2s' }}
                          onMouseDown={e => newPostContent.trim() && (e.currentTarget.style.transform = 'scale(0.95)')}
                          onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                        >
                          <Send size={14} /> Post
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </form>
          )}

          {/* Feed Posts */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {posts.map((post, i) => (
              <div key={post.id} style={{ animation: `fadeUp 0.5s ease ${0.1 + i * 0.08}s both` }}>
                <PostCard
                  post={post}
                  currentUser={user ? { id: user.id, name: user.name } : null}
                  onRefresh={async () => { const p = await getFeedPosts(); setPosts(p); }}
                />
              </div>
            ))}
          </div>
        </section>

        {/* ── Browse by Subject ── */}
        <section style={{ marginTop: '28px', animation: 'fadeUp 0.5s ease 0.21s both' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px 14px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#111', margin: 0, letterSpacing: '-0.01em' }}>Browse by Subject</h2>
            <button onClick={() => { playTap(); navigate('/browse'); }} style={{ background: 'none', border: 'none', color: '#155E63', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>See all</button>
          </div>
          <div style={{ display: 'flex', gap: '10px', padding: '0 20px', overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: '4px' }}>
            {subjects.slice(0, 6).map(subject => (
              <button
                key={subject}
                onClick={() => { playTap(); navigate(`/browse?subject=${encodeURIComponent(subject)}`); }}
                style={{ flexShrink: 0, padding: '10px 18px', borderRadius: '999px', ...glass, border: '1.5px solid rgba(21,94,99,0.12)', color: '#333', fontSize: '13px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#155E63'; e.currentTarget.style.color = '#155E63'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(21,94,99,0.12)'; e.currentTarget.style.color = '#333'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                {subject}
              </button>
            ))}
          </div>
        </section>

        {/* ── Recently Added ── */}
        <section style={{ marginTop: '28px', animation: 'fadeUp 0.5s ease 0.25s both' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px 14px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#111', margin: 0, letterSpacing: '-0.01em' }}>Recently Added</h2>
            <button onClick={() => { playTap(); navigate('/results?q='); }} style={{ background: 'none', border: 'none', color: '#155E63', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>See all</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '0 20px' }}>
            {recentBooks.map(book => <BookCard key={book.id} book={book} />)}
          </div>
        </section>

        {/* ── Recommended ── */}
        {!isGuest && recommendedBooks.length > 0 && (
          <section style={{ marginTop: '28px', marginBottom: '8px', animation: 'fadeUp 0.5s ease 0.3s both' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px 14px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#111', margin: 0, letterSpacing: '-0.01em' }}>Recommended for You</h2>
              <button onClick={() => { playTap(); navigate('/personal-recs'); }} style={{ background: 'none', border: 'none', color: '#155E63', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>See all</button>
            </div>
            <div style={{ display: 'flex', gap: '14px', padding: '0 20px', overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: '4px' }}>
              {recommendedBooks.map(book => (
                <button
                  key={book.id}
                  onClick={() => { playTap(); navigate(`/book/${book.id}`); }}
                  style={{ flexShrink: 0, width: '130px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0, transition: 'transform 0.25s cubic-bezier(0.34,1.56,0.64,1)' }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <div style={{ width: '130px', height: '175px', borderRadius: '14px', overflow: 'hidden', backgroundColor: '#EDE9DD', marginBottom: '10px', boxShadow: '0 8px 20px rgba(0,0,0,0.12)' }}>
                    <img src={book.cover_url} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#111', lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>{book.title}</div>
                  <div style={{ fontSize: '11px', color: '#888', marginTop: '3px', fontWeight: 500 }}>{book.authors[0]?.split(' ').pop()}</div>
                </button>
              ))}
            </div>
          </section>
        )}
      </main>

      <BottomNav />

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pingDot {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.4); }
          50% { box-shadow: 0 0 0 8px rgba(239,68,68,0); }
        }
      `}</style>
    </div>
  );
}
