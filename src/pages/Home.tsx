import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import SideMenu from '../components/SideMenu';
import { playTap } from '../lib/sound';
import { MessageSquare, Heart, Send, ExternalLink, X, Search, Bell, Bookmark, Clock, Zap, Smartphone, ChevronRight, Menu, ThumbsUp, Repeat, Share2, Plus, Users, Briefcase } from 'lucide-react';
import BookCover from '../components/BookCover';
import {
  getAllBooks, getRecommendations, getBookById, getAllSubjects,
  getFeedPosts, createPost, likePost, getComments, addComment,
  type Book, type Post, type Comment
} from '../lib/queries';

// ─── Design Tokens ────────────────────────────────────────────────────────────
const NAVY = '#1A1A3E';
const NAVY2 = '#252550';
const BG = '#F4F3FF';
const WHITE = '#FFFFFF';
const PURPLE = '#7C6EFA';
const TEAL = '#00C9A7';
const PINK = '#FF6B9D';
const AMBER = '#FFB347';
const GREEN = '#34D399';
const TEXT = '#1A1A3E';
const TEXT2 = '#6B6B8A';
const TEXT3 = '#9B9BB4';

const CARD: React.CSSProperties = {
  background: 'rgba(255, 255, 255, 0.65)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  borderRadius: '24px',
  boxShadow: '0 8px 32px rgba(31, 38, 135, 0.07)',
  border: '1px solid rgba(255, 255, 255, 0.4)',
};

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
    setTimeout(() => inputRef.current?.focus(), 300);
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

  const roleColor = (role?: string) => role === 'faculty' ? AMBER : PURPLE;

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 600, background: 'rgba(26,26,62,0.45)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '560px', background: WHITE, borderRadius: '28px 28px 0 0', maxHeight: '82vh', display: 'flex', flexDirection: 'column', boxShadow: '0 -8px 48px rgba(26,26,62,0.18)' }}>
        {/* Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '14px 0 0' }}>
          <div style={{ width: '40px', height: '4px', borderRadius: '99px', background: '#E0DFF8' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', padding: '14px 20px 16px', borderBottom: '1px solid #F0EFF8' }}>
          <span style={{ flex: 1, fontWeight: 700, fontSize: '17px', color: TEXT }}>Comments {comments.length > 0 && <span style={{ color: PURPLE }}>({comments.length})</span>}</span>
          <button onClick={onClose} style={{ background: '#F0EFF8', border: 'none', borderRadius: '50%', width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: TEXT2 }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '32px', color: TEXT3 }}>Loading…</div>
          ) : comments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 20px' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>💬</div>
              <div style={{ fontWeight: 700, fontSize: '16px', color: TEXT, marginBottom: '6px' }}>No comments yet</div>
              <div style={{ fontSize: '14px', color: TEXT3 }}>Start the conversation!</div>
            </div>
          ) : comments.map(c => (
            <div key={c.id} style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: roleColor(c.author_role), color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '15px', flexShrink: 0 }}>
                {c.author_name?.[0] || '?'}
              </div>
              <div style={{ flex: 1, background: BG, borderRadius: '0 16px 16px 16px', padding: '12px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '5px' }}>
                  <span style={{ fontWeight: 700, fontSize: '13px', color: TEXT }}>{c.author_name}</span>
                  {c.author_role === 'faculty' && (
                    <span style={{ padding: '2px 7px', background: '#FFF4E0', color: AMBER, borderRadius: '99px', fontSize: '9px', fontWeight: 800, textTransform: 'uppercase' as const }}>Faculty</span>
                  )}
                  <span style={{ fontSize: '11px', color: TEXT3, marginLeft: 'auto' }}>
                    {new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p style={{ fontSize: '14px', color: TEXT2, margin: 0, lineHeight: 1.55 }}>{c.content}</p>
              </div>
            </div>
          ))}
        </div>

        {user && (
          <form onSubmit={handleSubmit} style={{ padding: '12px 20px 24px', borderTop: '1px solid #F0EFF8', display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: PURPLE, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '15px', flexShrink: 0 }}>{user.name[0]}</div>
            <input ref={inputRef} value={text} onChange={e => setText(e.target.value)} placeholder="Add a comment…"
              style={{ flex: 1, padding: '11px 16px', borderRadius: '99px', border: '1.5px solid #E8E7F8', background: BG, fontSize: '14px', fontFamily: 'Inter,sans-serif', outline: 'none', color: TEXT, transition: 'border-color 0.2s' }}
              onFocus={e => e.target.style.borderColor = PURPLE}
              onBlur={e => e.target.style.borderColor = '#E8E7F8'}
            />
            <button type="submit" disabled={!text.trim()}
              style={{ width: '42px', height: '42px', borderRadius: '50%', background: text.trim() ? PURPLE : '#E8E7F8', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: text.trim() ? 'pointer' : 'not-allowed', flexShrink: 0, transition: 'all 0.2s', boxShadow: text.trim() ? `0 4px 14px ${PURPLE}44` : 'none' }}>
              <Send size={16} color={text.trim() ? 'white' : TEXT3} />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// ─── Post Card ─────────────────────────────────────────────────────────────────
function PostCard({ post, currentUser, onRefresh }: {
  post: Post; currentUser: { id: string; name: string } | null; onRefresh: () => void;
}) {
  const [liked, setLiked] = useState(false);
  const [localLikes, setLocalLikes] = useState(post.likes);
  const [showComments, setShowComments] = useState(false);
  const [heartBump, setHeartBump] = useState(false);

  const timeAgo = (d: string) => {
    const diff = Date.now() - new Date(d).getTime();
    const m = Math.floor(diff / 60000), h = Math.floor(m / 60), dy = Math.floor(h / 24);
    if (dy > 0) return `${dy}d`; if (h > 0) return `${h}h`; if (m > 0) return `${m}m`; return 'now';
  };

  const avatarBg = post.author_role === 'faculty'
    ? `linear-gradient(135deg, ${AMBER}, #E8960A)`
    : `linear-gradient(135deg, ${PURPLE}, #5B4FE8)`;

  const handleLike = async () => {
    if (liked) return;
    setLiked(true); setLocalLikes(l => l + 1); setHeartBump(true);
    setTimeout(() => setHeartBump(false), 500);
    await likePost(post.id); onRefresh();
  };

  return (
    <>
      <div style={{ ...CARD, overflow: 'hidden', transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(124,110,250,0.15)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 16px rgba(26,26,62,0.08)'; }}
      >
        <div style={{ padding: '18px 18px 0' }}>
          {/* Author row */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '14px' }}>
            <div style={{ position: 'relative' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: avatarBg, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 800, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                {post.author_name?.[0] || '?'}
              </div>
              <div style={{ position: 'absolute', bottom: '2px', right: '2px', width: '12px', height: '12px', background: GREEN, border: '2px solid white', borderRadius: '50%' }} />
            </div>
            <div style={{ flex: 1, paddingTop: '2px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 700, fontSize: '15px', color: TEXT, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {post.author_name}
                  {post.author_role === 'faculty' && <Briefcase size={12} color={AMBER} />}
                </span>
                {currentUser?.id !== post.author_id && (
                  <button onClick={() => { playTap(); alert('Followed! (stub)'); }} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', color: PURPLE, fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
                    <Plus size={14} /> Follow
                  </button>
                )}
              </div>
              <div style={{ fontSize: '12px', color: TEXT2, marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {post.author_role === 'faculty' ? 'Faculty Member • Information Technology' : 'B.Tech Student • Computer Science'}
              </div>
              <div style={{ fontSize: '11px', color: TEXT3, marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                {timeAgo(post.created_at)} ago • <Users size={10} />
              </div>
            </div>
          </div>

          {/* Content */}
          <p style={{ fontSize: '14px', color: TEXT2, lineHeight: 1.65, margin: '0 0 14px', whiteSpace: 'pre-wrap' }}>{post.content}</p>

          {/* Link card */}
          {post.link_url && (
            <a href={post.link_url} target="_blank" rel="noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', background: '#F0EFF8', borderRadius: '14px', marginBottom: '14px', textDecoration: 'none', transition: 'background 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#E6E4F5'}
              onMouseLeave={e => e.currentTarget.style.background = '#F0EFF8'}
            >
              <div style={{ width: '34px', height: '34px', background: PURPLE, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: `0 4px 10px ${PURPLE}44` }}>
                <ExternalLink size={15} color="white" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '10px', color: TEXT3, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: '2px' }}>External Link</div>
                <div style={{ fontSize: '13px', color: PURPLE, fontWeight: 600, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{post.link_url}</div>
              </div>
            </a>
          )}
        </div>

        {/* Action bar (LinkedIn style) */}
        <div style={{ display: 'flex', borderTop: '1px solid rgba(124,110,250,0.1)', padding: '4px 8px' }}>
          <button onClick={handleLike}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px 0', background: 'transparent', border: 'none', cursor: 'pointer', color: liked ? PURPLE : TEXT2, fontSize: '12px', fontWeight: 600, transition: 'all 0.2s', fontFamily: 'Inter,sans-serif', borderRadius: '8px' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(124,110,250,0.08)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'}
            onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <ThumbsUp size={18} fill={liked ? PURPLE : 'none'} color={liked ? PURPLE : TEXT2}
              style={{ transform: heartBump ? 'scale(1.45)' : 'scale(1)', transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1)' }} />
            {localLikes > 0 ? localLikes : 'Like'}
          </button>
          <button onClick={() => setShowComments(true)}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px 0', background: 'transparent', border: 'none', cursor: 'pointer', color: TEXT2, fontSize: '12px', fontWeight: 600, transition: 'all 0.2s', fontFamily: 'Inter,sans-serif', borderRadius: '8px' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(124,110,250,0.08)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <MessageSquare size={18} color={TEXT2} />
            {post.comment_count > 0 ? post.comment_count : 'Comment'}
          </button>
          <button onClick={() => { playTap(); alert('Reposting… (stub)'); }}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px 0', background: 'transparent', border: 'none', cursor: 'pointer', color: TEXT2, fontSize: '12px', fontWeight: 600, transition: 'all 0.2s', fontFamily: 'Inter,sans-serif', borderRadius: '8px' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(124,110,250,0.08)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <Repeat size={18} color={TEXT2} />
            Repost
          </button>
          <button onClick={() => { playTap(); alert('Sharing… (stub)'); }}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px 0', background: 'transparent', border: 'none', cursor: 'pointer', color: TEXT2, fontSize: '12px', fontWeight: 600, transition: 'all 0.2s', fontFamily: 'Inter,sans-serif', borderRadius: '8px' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(124,110,250,0.08)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <Share2 size={18} color={TEXT2} />
            Send
          </button>
        </div>
      </div>
      {showComments && <CommentSheet post={post} user={currentUser} onClose={() => setShowComments(false)} onRefresh={onRefresh} />}
    </>
  );
}

// ─── Book Row ─────────────────────────────────────────────────────────────────
function BookRow({ book }: { book: Book }) {
  const navigate = useNavigate();
  return (
    <button onClick={() => { playTap(); navigate(`/book/${book.id}`); }}
      style={{ ...CARD, width: '100%', display: 'flex', alignItems: 'center', gap: '14px', padding: '14px', border: 'none', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 24px rgba(124,110,250,0.14)'; e.currentTarget.style.transform = 'translateX(2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 16px rgba(26,26,62,0.08)'; e.currentTarget.style.transform = 'translateX(0)'; }}
    >
      <div style={{ width: '52px', height: '68px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0, boxShadow: '0 4px 12px rgba(0,0,0,0.12)' }}>
        <BookCover book={book} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '14px', fontWeight: 700, color: TEXT, marginBottom: '4px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const, lineHeight: 1.3 }}>{book.title}</div>
        <div style={{ fontSize: '12px', color: TEXT3, fontWeight: 500 }}>{book.authors[0]}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
          <span style={{ padding: '2px 8px', borderRadius: '99px', background: '#EEF0FF', color: PURPLE, fontSize: '10px', fontWeight: 700 }}>{book.subject}</span>
          <span style={{ padding: '2px 8px', borderRadius: '99px', background: '#E6F9F5', color: TEAL, fontSize: '10px', fontWeight: 700 }}>{book.format === 'both' ? 'Physical + E-Book' : book.format}</span>
        </div>
      </div>
      <div style={{ color: TEXT3, flexShrink: 0 }}>
        <ChevronRight size={16} strokeWidth={2.5} />
      </div>
    </button>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
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
  const [activeTab, setActiveTab] = useState<'feed' | 'books'>('feed');

  const loadData = async () => {
    const [allB, recs, subs, p] = await Promise.all([getAllBooks(), getRecommendations(), getAllSubjects(), getFeedPosts()]);
    setRecentBooks(allB.slice(0, 5));
    const recBooks = await Promise.all(recs.slice(0, 4).map(r => getBookById(r.book_id)));
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
    <div style={{ minHeight: '100vh', background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '48px', height: '48px', border: `3px solid #E8E7F8`, borderTopColor: PURPLE, borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
        <div style={{ fontSize: '14px', color: TEXT3, fontWeight: 600 }}>Loading your library…</div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const firstName = user ? user.name.split(' ')[0] : 'Guest';

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f6f6f9',
      backgroundImage: `
        radial-gradient(at 0% 0%, rgba(124, 110, 250, 0.15) 0px, transparent 50%),
        radial-gradient(at 100% 0%, rgba(0, 201, 167, 0.15) 0px, transparent 50%),
        radial-gradient(at 100% 100%, rgba(255, 107, 157, 0.1) 0px, transparent 50%)
      `,
      backgroundAttachment: 'fixed',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>

      {/* ── Dark Navy Header ─────────────────────────────────────────────────── */}
      <div style={{ background: 'rgba(26, 26, 62, 0.85)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', paddingTop: '0', paddingBottom: '28px', position: 'relative', overflow: 'hidden', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        {/* Subtle blobs */}
        <div style={{ position: 'absolute', top: '-60px', right: '-40px', width: '300px', height: '300px', borderRadius: '50%', background: `radial-gradient(circle, ${PURPLE}55 0%, transparent 70%)`, filter: 'blur(40px)' }} />
        <div style={{ position: 'absolute', bottom: '-40px', left: '-30px', width: '250px', height: '250px', borderRadius: '50%', background: `radial-gradient(circle, ${TEAL}44 0%, transparent 70%)`, filter: 'blur(40px)' }} />

        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '56px 20px 24px', position: 'relative', zIndex: 1 }}>
          <button onClick={() => setMenuOpen(true)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '12px', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}>
            <Menu size={18} color="white" strokeWidth={2.5} />
          </button>
          <span style={{ fontSize: '17px', fontWeight: 700, color: 'white', letterSpacing: '-0.01em' }}>IIITDM Library</span>
          <div style={{ position: 'relative' }}>
            <button onClick={() => {}} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '12px', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}>
              <Bell size={18} color="white" />
            </button>
            <div style={{ position: 'absolute', top: '8px', right: '8px', width: '8px', height: '8px', background: PINK, borderRadius: '50%', border: '2px solid #1A1A3E' }} />
          </div>
        </div>

        {/* Greeting & Search */}
        <div style={{ padding: '0 20px', position: 'relative', zIndex: 1 }}>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)', margin: '0 0 4px', fontWeight: 500, letterSpacing: '0.03em' }}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'white', margin: '0 0 20px', letterSpacing: '-0.02em' }}>
            Hello, {firstName} 👋
          </h1>
          {/* Search */}
          <div onClick={() => navigate('/search')}
            style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 18px', background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderRadius: '16px', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.15)', transition: 'background 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.18)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
          >
            <Search size={18} color="rgba(255,255,255,0.6)" />
            <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>Search books, authors, subjects…</span>
          </div>
        </div>

        {/* Quick stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', padding: '20px 20px 0', position: 'relative', zIndex: 1 }}>
          {[
            { icon: Zap, label: 'New', color: AMBER, action: () => navigate('/browse') },
            { icon: Smartphone, label: 'E-Books', color: TEAL, action: () => navigate('/results?format=ebook') },
            { icon: Clock, label: 'Due', color: PINK, action: () => navigate('/account') },
            { icon: Bookmark, label: 'Holds', color: PURPLE, action: () => navigate('/account') },
          ].map(({ icon: Icon, label, color, action }) => (
            <button key={label} onClick={() => { playTap(); action(); }}
              style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '16px', padding: '14px 6px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '7px', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseDown={e => e.currentTarget.style.transform = 'scale(0.93)'}
              onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
              onTouchStart={e => e.currentTarget.style.transform = 'scale(0.93)'}
              onTouchEnd={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 10px ${color}66` }}>
                <Icon size={16} color="white" />
              </div>
              <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.75)', fontWeight: 700, textAlign: 'center' as const }}>{label}</span>
            </button>
          ))}
        </div>
      </div>

      <SideMenu open={menuOpen} onClose={() => setMenuOpen(false)} />

      {/* ── Tab Switcher ─────────────────────────────────────────────────────── */}
      <div style={{ padding: '20px 20px 0', position: 'sticky', top: '0', zIndex: 40, backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', background: 'rgba(246, 246, 249, 0.6)' }}>
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderRadius: '16px', padding: '5px', boxShadow: '0 4px 12px rgba(26,26,62,0.05)', border: '1px solid rgba(255,255,255,0.5)' }}>
          {(['feed', 'books'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{ flex: 1, padding: '11px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '14px', fontFamily: 'Inter,sans-serif', transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)', background: activeTab === tab ? PURPLE : 'transparent', color: activeTab === tab ? 'white' : TEXT3, boxShadow: activeTab === tab ? `0 4px 14px ${PURPLE}44` : 'none' }}>
              {tab === 'feed' ? '📣 Campus Feed' : '📚 Books'}
            </button>
          ))}
        </div>
      </div>

      {/* ── Main Content ──────────────────────────────────────────────────────── */}
      <main style={{ padding: '20px 16px 96px' }}>

        {/* FEED TAB */}
        {activeTab === 'feed' && (
          <div style={{ animation: 'fadeUp 0.35s ease both' }}>
            {/* Composer */}
            {!isGuest && (
              <form onSubmit={handleCreatePost} style={{ ...CARD, padding: '16px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: `linear-gradient(135deg,${PURPLE},#5B4FE8)`, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 800, flexShrink: 0, boxShadow: `0 4px 12px ${PURPLE}44` }}>
                    {user?.name[0]}
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <textarea value={newPostContent} onChange={e => setNewPostContent(e.target.value)} onFocus={() => setPostFocused(true)}
                      placeholder="Share a recommendation, thought, or update…"
                      style={{ width: '100%', border: 'none', outline: 'none', resize: 'none', minHeight: postFocused ? '80px' : '44px', fontFamily: 'Inter,sans-serif', fontSize: '14px', backgroundColor: 'transparent', color: TEXT, transition: 'min-height 0.3s ease', lineHeight: 1.6, boxSizing: 'border-box' }}
                    />
                    {postFocused && (
                      <>
                        {showPostLink && (
                          <input value={newPostLink} onChange={e => setNewPostLink(e.target.value)} placeholder="https://…"
                            style={{ padding: '10px 14px', borderRadius: '12px', border: `1.5px solid #E8E7F8`, background: BG, fontSize: '13px', fontFamily: 'Inter,sans-serif', outline: 'none', color: TEXT, transition: 'border-color 0.2s' }}
                            onFocus={e => e.target.style.borderColor = PURPLE}
                            onBlur={e => e.target.style.borderColor = '#E8E7F8'}
                          />
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <button type="button" onClick={() => setShowPostLink(v => !v)}
                            style={{ padding: '6px 12px', background: showPostLink ? '#EEF0FF' : BG, border: `1px solid #E8E7F8`, borderRadius: '99px', fontSize: '12px', fontWeight: 700, color: PURPLE, cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>🔗 Link</button>
                          <div style={{ flex: 1 }} />
                          <button type="button" onClick={() => { setPostFocused(false); setNewPostContent(''); setNewPostLink(''); setShowPostLink(false); }}
                            style={{ padding: '8px 14px', background: 'transparent', border: 'none', borderRadius: '99px', color: TEXT3, cursor: 'pointer', fontFamily: 'Inter,sans-serif', fontSize: '13px', fontWeight: 600 }}>Cancel</button>
                          <button type="submit" disabled={!newPostContent.trim()}
                            style={{ padding: '8px 20px', background: newPostContent.trim() ? PURPLE : '#E8E7F8', border: 'none', borderRadius: '99px', color: newPostContent.trim() ? 'white' : TEXT3, cursor: newPostContent.trim() ? 'pointer' : 'not-allowed', fontFamily: 'Inter,sans-serif', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', boxShadow: newPostContent.trim() ? `0 4px 12px ${PURPLE}44` : 'none', transition: 'all 0.2s' }}>
                            <Send size={13} /> Post
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </form>
            )}

            {/* Posts */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {posts.map((post, i) => (
                <div key={post.id} style={{ animation: `fadeUp 0.4s ease ${i * 0.07}s both` }}>
                  <PostCard post={post} currentUser={user ? { id: user.id, name: user.name } : null} onRefresh={async () => { const p = await getFeedPosts(); setPosts(p); }} />
                </div>
              ))}
              {posts.length === 0 && (
                <div style={{ textAlign: 'center', padding: '48px 20px', color: TEXT3 }}>
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>📭</div>
                  <div style={{ fontWeight: 700, color: TEXT2, marginBottom: '4px' }}>No posts yet</div>
                  <div style={{ fontSize: '13px' }}>Be the first to share something!</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* BOOKS TAB */}
        {activeTab === 'books' && (
          <div style={{ animation: 'fadeUp 0.35s ease both' }}>
            {/* Subjects */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h2 style={{ fontSize: '16px', fontWeight: 700, color: TEXT, margin: 0 }}>Browse by Subject</h2>
                <button onClick={() => navigate('/browse')} style={{ background: 'none', border: 'none', color: PURPLE, fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>See all</button>
              </div>
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: '4px' }}>
                {subjects.slice(0, 6).map((s, i) => {
                  const colors = [PURPLE, TEAL, PINK, AMBER, GREEN, '#8B5CF6'];
                  const c = colors[i % colors.length];
                  return (
                    <button key={s} onClick={() => { playTap(); navigate(`/browse?subject=${encodeURIComponent(s)}`); }}
                      style={{ flexShrink: 0, padding: '9px 16px', borderRadius: '99px', background: `${c}18`, border: `1.5px solid ${c}33`, color: c, fontSize: '12px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s', fontFamily: 'Inter,sans-serif' }}
                      onMouseEnter={e => { e.currentTarget.style.background = `${c}28`; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = `${c}18`; e.currentTarget.style.transform = 'translateY(0)'; }}
                    >{s}</button>
                  );
                })}
              </div>
            </div>

            {/* Recommended horizontal scroll */}
            {!isGuest && recommendedBooks.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h2 style={{ fontSize: '16px', fontWeight: 700, color: TEXT, margin: 0 }}>Recommended</h2>
                  <button onClick={() => navigate('/personal-recs')} style={{ background: 'none', border: 'none', color: PURPLE, fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>See all</button>
                </div>
                <div style={{ display: 'flex', gap: '14px', overflowX: 'auto', scrollbarWidth: 'none' }}>
                  {recommendedBooks.map(book => (
                    <button key={book.id} onClick={() => { playTap(); navigate(`/book/${book.id}`); }}
                      style={{ flexShrink: 0, width: '120px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0, transition: 'transform 0.25s cubic-bezier(0.34,1.56,0.64,1)', fontFamily: 'Inter,sans-serif' }}
                      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                      <div style={{ width: '120px', height: '162px', borderRadius: '14px', overflow: 'hidden', marginBottom: '9px', boxShadow: '0 8px 24px rgba(26,26,62,0.15)' }}>
                        <BookCover book={book} />
                      </div>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: TEXT, lineHeight: 1.35, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>{book.title}</div>
                      <div style={{ fontSize: '11px', color: TEXT3, marginTop: '3px', fontWeight: 500 }}>{book.authors[0]?.split(' ').pop()}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Recently Added */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h2 style={{ fontSize: '16px', fontWeight: 700, color: TEXT, margin: 0 }}>Recently Added</h2>
                <button onClick={() => navigate('/results?q=')} style={{ background: 'none', border: 'none', color: PURPLE, fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>See all</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {recentBooks.map(book => <BookRow key={book.id} book={book} />)}
              </div>
            </div>
          </div>
        )}
      </main>

      <BottomNav />

      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        ::-webkit-scrollbar { display:none; }
        * { -webkit-tap-highlight-color: transparent; }
      `}</style>
    </div>
  );
}
