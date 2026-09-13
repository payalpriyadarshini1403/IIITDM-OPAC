import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import StatusBadge from '../components/StatusBadge';
import { playTap, playSuccess } from '../lib/sound';
import { useAuth } from '../lib/auth';
import {
  getBookById, getRelatedBooks, getLocationByBookId, getAvailabilityStatus,
  createLoan, createHold, hasActiveLoan, hasActiveHold,
  getCollectionsByUser, addBookToCollection, removeBookFromCollection, isBookInCollection,
  getReviews, addReview, getUserReview, getAverageRating,
  logReading,
  type Book, type Review, type Collection,
} from '../lib/queries';
import { Star, BookmarkPlus, BookmarkCheck, BookOpen, Clock, Sparkles } from 'lucide-react';

export default function BookDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [book, setBook] = useState<Book | undefined>();
  const [related, setRelated] = useState<Book[]>([]);
  const [location, setLocation] = useState<Awaited<ReturnType<typeof getLocationByBookId>>>();
  const [status, setStatus] = useState<'available' | 'limited' | 'unavailable'>('available');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState({ avg: 0, count: 0 });
  const [userReview, setUserReview] = useState<Review | undefined>();
  const [collections, setCollections] = useState<Collection[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [alreadyLoaned, setAlreadyLoaned] = useState(false);
  const [alreadyOnHold, setAlreadyOnHold] = useState(false);
  const [actionMsg, setActionMsg] = useState('');
  const [actionOk, setActionOk] = useState(true);

  // Review form
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [hoverStar, setHoverStar] = useState(0);

  // Collection dropdown
  const [showColDrop, setShowColDrop] = useState(false);
  const [colStatus, setColStatus] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!id) return;
    (async () => {
      const [bk, rel, loc, av, rvs, rat] = await Promise.all([
        getBookById(id),
        getRelatedBooks(id),
        getLocationByBookId(id),
        getAvailabilityStatus(id),
        getReviews(id),
        getAverageRating(id),
      ]);
      setBook(bk);
      setRelated(rel);
      setLocation(loc);
      setStatus(av);
      setReviews(rvs);
      setAvgRating(rat);

      if (user) {
        const [loan, hold, cols, ur] = await Promise.all([
          hasActiveLoan(user.id, id),
          hasActiveHold(user.id, id),
          getCollectionsByUser(user.id),
          getUserReview(user.id, id),
        ]);
        setAlreadyLoaned(loan);
        setAlreadyOnHold(hold);
        setCollections(cols);
        if (ur) { setUserReview(ur); setReviewRating(ur.rating); setReviewText(ur.review_text); }
        // Check collection membership
        const statusMap: Record<string, boolean> = {};
        await Promise.all(cols.map(async c => {
          statusMap[c.id] = await isBookInCollection(c.id, id);
        }));
        setColStatus(statusMap);
        // Log reading
        logReading(user.id, id);
      }
      setIsLoading(false);
    })();
  }, [id, user]);

  const showMsg = (msg: string, ok = true) => {
    setActionMsg(msg); setActionOk(ok);
    setTimeout(() => setActionMsg(''), 3000);
  };

  const handleBorrow = async () => {
    if (!user) { navigate('/login'); return; }
    if (!id) return;
    if (alreadyLoaned) { showMsg('You already have this book borrowed.', false); return; }
    if (status === 'unavailable') { showMsg('Book is not available. Place a hold instead.', false); return; }
    playTap();
    await createLoan(user.id, id);
    setAlreadyLoaned(true);
    setStatus('limited');
    playSuccess();
    showMsg('✓ Book borrowed successfully! Return within 30 days.');
  };

  const handleHold = async () => {
    if (!user) { navigate('/login'); return; }
    if (!id) return;
    if (alreadyOnHold) { showMsg('You already have a hold on this book.', false); return; }
    playTap();
    await createHold(user.id, id);
    setAlreadyOnHold(true);
    playSuccess();
    showMsg('✓ Hold placed! You\'ll be notified when available.');
  };

  const handleCollectionToggle = async (col: Collection) => {
    if (!id) return;
    playTap();
    const inCol = colStatus[col.id];
    if (inCol) {
      await removeBookFromCollection(col.id, id);
      setColStatus(prev => ({ ...prev, [col.id]: false }));
      showMsg(`Removed from "${col.name}"`);
    } else {
      await addBookToCollection(col.id, id);
      setColStatus(prev => ({ ...prev, [col.id]: true }));
      showMsg(`Added to "${col.name}"!`);
    }
  };

  const handleSubmitReview = async () => {
    if (!user || !id) return;
    if (!reviewText.trim()) { showMsg('Please write a review before submitting.', false); return; }
    playTap();
    await addReview(user.id, id, reviewRating, reviewText);
    const [rvs, rat] = await Promise.all([getReviews(id), getAverageRating(id)]);
    setReviews(rvs);
    setAvgRating(rat);
    setShowReviewForm(false);
    playSuccess();
    showMsg('✓ Review submitted!');
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#F7F3E8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: '#6B6B6B' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid #EDE9DD', borderTopColor: '#155E63', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
          Loading…
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#F7F3E8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#6B6B6B' }}>Book not found.</p>
      </div>
    );
  }

  const inAnyCollection = Object.values(colStatus).some(Boolean);
  const anyColAvailable = collections.length > 0;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F7F3E8' }}>
      <TopBar title={book.title.length > 22 ? book.title.slice(0, 22) + '…' : book.title} showBack />
      <BottomNav />

      {/* Toast message */}
      {actionMsg && (
        <div style={{
          position: 'fixed', top: '72px', left: '50%', transform: 'translateX(-50%)',
          backgroundColor: actionOk ? '#155E63' : '#B91C1C',
          color: 'white', padding: '10px 20px', borderRadius: '999px', zIndex: 200,
          fontSize: '13px', fontWeight: 500, whiteSpace: 'nowrap',
          boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
          animation: 'slideDown 0.3s ease',
        }}>
          {actionMsg}
        </div>
      )}

      <main style={{ padding: '68px 0 80px', animation: 'fadeIn 0.35s ease both' }}>

        {/* Hero */}
        <div style={{ backgroundColor: '#155E63', padding: '24px 20px 32px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
          <div style={{ width: '88px', height: '120px', flexShrink: 0, borderRadius: '8px', overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.15)', boxShadow: '0 4px 16px rgba(0,0,0,0.25)' }}>
            <img src={book.cover_url} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div style={{ flex: 1, paddingTop: '4px' }}>
            <h1 style={{ color: 'white', fontSize: '18px', fontWeight: 500, margin: '0 0 6px', lineHeight: '1.35' }}>{book.title}</h1>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '13px', margin: '0 0 8px' }}>{book.authors.join(', ')}</p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              <StatusBadge status={status} />
              {avgRating.count > 0 && (
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <Star size={12} fill="currentColor" />
                  {avgRating.avg} ({avgRating.count})
                </span>
              )}
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>{book.published_year}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px', padding: '16px 20px', borderBottom: '1px solid #EDE9DD', flexWrap: 'wrap' }}>

          {/* Borrow */}
          {(book.format === 'physical' || book.format === 'both') && location && (
            <button
              onClick={handleBorrow}
              disabled={alreadyLoaned}
              style={{
                flex: 1, minWidth: '100px', padding: '12px', borderRadius: '12px',
                backgroundColor: alreadyLoaned ? '#6B6B6B' : '#155E63',
                color: 'white', border: 'none', fontWeight: 500, fontSize: '13px', cursor: alreadyLoaned ? 'default' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                fontFamily: 'Inter, sans-serif', transition: 'all 0.2s',
              }}
            >
              <BookOpen size={15} />
              {alreadyLoaned ? 'Borrowed' : 'Borrow'}
            </button>
          )}

          {/* Find on Shelf */}
          {location && (
            <button
              onClick={() => { playTap(); navigate(`/availability/${book.id}`); }}
              style={{
                flex: 1, minWidth: '100px', padding: '12px', borderRadius: '12px',
                backgroundColor: 'white', color: '#155E63', border: '1.5px solid #155E63',
                fontWeight: 500, fontSize: '13px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#155E63" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
              Find Shelf
            </button>
          )}

          {/* Read Online */}
          {(book.format === 'ebook' || book.format === 'both') && (
            <button
              onClick={() => { playTap(); navigate(`/digital/${book.id}`); }}
              style={{
                flex: 1, minWidth: '100px', padding: '12px', borderRadius: '12px',
                backgroundColor: '#D99A5B', color: 'white', border: 'none',
                fontWeight: 500, fontSize: '13px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>
              Read Online
            </button>
          )}
        </div>

        {/* Secondary Actions Row */}
        <div style={{ display: 'flex', gap: '10px', padding: '12px 20px', borderBottom: '1px solid #EDE9DD' }}>

          {/* Place Hold */}
          <button
            onClick={handleHold}
            disabled={alreadyOnHold || alreadyLoaned}
            style={{
              flex: 1, padding: '10px', borderRadius: '10px',
              backgroundColor: alreadyOnHold ? '#F7F3E8' : 'white',
              color: alreadyOnHold ? '#6B6B6B' : '#252525',
              border: `1.5px solid ${alreadyOnHold ? '#D4D4D4' : '#E5E0D8'}`,
              fontSize: '12px', fontWeight: 500, cursor: alreadyOnHold ? 'default' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            <Clock size={14} />
            {alreadyOnHold ? 'On Hold' : 'Place Hold'}
          </button>

          {/* Save to Collection */}
          {user && (
            <div style={{ position: 'relative', flex: 1 }}>
              <button
                onClick={() => { playTap(); setShowColDrop(!showColDrop); }}
                style={{
                  width: '100%', padding: '10px', borderRadius: '10px',
                  backgroundColor: inAnyCollection ? '#ECFDF5' : 'white',
                  color: inAnyCollection ? '#047857' : '#252525',
                  border: `1.5px solid ${inAnyCollection ? '#A7F3D0' : '#E5E0D8'}`,
                  fontSize: '12px', fontWeight: 500, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                {inAnyCollection ? <BookmarkCheck size={14} /> : <BookmarkPlus size={14} />}
                {inAnyCollection ? 'Saved' : 'Save'}
              </button>

              {showColDrop && (
                <div style={{
                  position: 'absolute', top: '100%', right: 0, zIndex: 50,
                  backgroundColor: 'white', borderRadius: '12px', padding: '8px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)', minWidth: '200px',
                  border: '1px solid #EDE9DD', marginTop: '4px',
                }}>
                  {!anyColAvailable ? (
                    <div style={{ padding: '12px', textAlign: 'center', color: '#6B6B6B', fontSize: '13px' }}>
                      No collections yet.{' '}
                      <button onClick={() => navigate('/collections')} style={{ background: 'none', border: 'none', color: '#155E63', fontWeight: 500, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Create one</button>
                    </div>
                  ) : collections.map(col => (
                    <button
                      key={col.id}
                      onClick={() => handleCollectionToggle(col)}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '10px 12px', background: 'none', border: 'none', cursor: 'pointer',
                        borderRadius: '8px', textAlign: 'left',
                        backgroundColor: colStatus[col.id] ? '#F0FDF4' : 'transparent',
                      }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = colStatus[col.id] ? '#DCFCE7' : '#F7F3E8'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = colStatus[col.id] ? '#F0FDF4' : 'transparent'}
                    >
                      {colStatus[col.id]
                        ? <BookmarkCheck size={14} color="#047857" />
                        : <BookmarkPlus size={14} color="#6B6B6B" />}
                      <span style={{ fontSize: '13px', color: '#252525' }}>{col.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Write Review */}
          <button
            onClick={() => { playTap(); setShowReviewForm(!showReviewForm); }}
            style={{
              flex: 1, padding: '10px', borderRadius: '10px',
              backgroundColor: userReview ? '#FFFBEB' : 'white',
              color: userReview ? '#B45309' : '#252525',
              border: `1.5px solid ${userReview ? '#FDE68A' : '#E5E0D8'}`,
              fontSize: '12px', fontWeight: 500, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            <Sparkles size={14} />
            {userReview ? 'Edit Review' : 'Review'}
          </button>
        </div>

        {/* Review Form */}
        {showReviewForm && user && (
          <div style={{ margin: '12px 16px', backgroundColor: 'white', borderRadius: '14px', padding: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#252525', margin: '0 0 12px' }}>Your Review</h3>
            {/* Star selector */}
            <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
              {[1, 2, 3, 4, 5].map(s => (
                <button
                  key={s}
                  onMouseEnter={() => setHoverStar(s)}
                  onMouseLeave={() => setHoverStar(0)}
                  onClick={() => setReviewRating(s)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                >
                  <Star size={24} fill={(hoverStar || reviewRating) >= s ? '#D99A5B' : 'none'} color={(hoverStar || reviewRating) >= s ? '#D99A5B' : '#D4D4D4'} />
                </button>
              ))}
              <span style={{ fontSize: '13px', color: '#6B6B6B', alignSelf: 'center', marginLeft: '6px' }}>
                {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][hoverStar || reviewRating]}
              </span>
            </div>
            <textarea
              value={reviewText}
              onChange={e => setReviewText(e.target.value)}
              placeholder="Share your thoughts about this book…"
              rows={3}
              style={{
                width: '100%', padding: '12px', borderRadius: '10px', border: '1.5px solid #E5E0D8',
                fontSize: '14px', fontFamily: 'Inter, sans-serif', resize: 'none', outline: 'none',
                boxSizing: 'border-box', color: '#252525', lineHeight: '1.5',
              }}
              onFocus={e => e.target.style.borderColor = '#155E63'}
              onBlur={e => e.target.style.borderColor = '#E5E0D8'}
            />
            <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
              <button
                onClick={handleSubmitReview}
                style={{ flex: 1, padding: '11px', backgroundColor: '#155E63', color: 'white', borderRadius: '10px', border: 'none', fontWeight: 500, fontSize: '13px', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
              >
                Submit Review
              </button>
              <button
                onClick={() => setShowReviewForm(false)}
                style={{ flex: 1, padding: '11px', backgroundColor: 'transparent', color: '#6B6B6B', borderRadius: '10px', border: '1.5px solid #E5E0D8', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Metadata */}
        <div style={{ padding: '16px 20px', backgroundColor: 'white', margin: '12px 16px', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 500, color: '#252525', margin: '0 0 12px' }}>Details</h2>
          {[
            { label: 'Subject', value: book.subject },
            { label: 'Call Number', value: book.call_number },
            { label: 'Format', value: book.format === 'both' ? 'Physical + E-Book' : book.format === 'ebook' ? 'E-Book only' : 'Physical' },
            { label: 'Published', value: String(book.published_year) },
            ...(location ? [{ label: 'Location', value: `${location.floor} · ${location.section} · Row ${location.shelf_row}, Bay ${location.bay}` }] : []),
          ].map(row => (
            <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F7F3E8' }}>
              <span style={{ fontSize: '13px', color: '#6B6B6B' }}>{row.label}</span>
              <span style={{ fontSize: '13px', color: '#252525', fontWeight: 500, textAlign: 'right', maxWidth: '60%' }}>{row.value}</span>
            </div>
          ))}
        </div>

        {/* About */}
        <div style={{ padding: '0 20px 16px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 500, color: '#252525', margin: '0 0 8px' }}>About this book</h2>
          <p style={{ fontSize: '14px', color: '#6B6B6B', lineHeight: '1.65', margin: 0 }}>{book.description}</p>
        </div>

        {/* Reviews Section */}
        <section style={{ padding: '0 16px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 500, color: '#252525', margin: 0 }}>
              Reviews {avgRating.count > 0 && `(${avgRating.count})`}
            </h2>
            {avgRating.count > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {[1,2,3,4,5].map(s => (
                  <Star key={s} size={12} fill={avgRating.avg >= s ? '#D99A5B' : 'none'} color={avgRating.avg >= s ? '#D99A5B' : '#D4D4D4'} />
                ))}
                <span style={{ fontSize: '12px', color: '#6B6B6B', marginLeft: '4px' }}>{avgRating.avg}/5</span>
              </div>
            )}
          </div>
          {reviews.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px', color: '#6B6B6B', fontSize: '13px', backgroundColor: 'white', borderRadius: '12px' }}>
              No reviews yet. Be the first to review!
            </div>
          ) : reviews.map(r => (
            <div key={r.id} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '12px', marginBottom: '10px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#155E63', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '12px', fontWeight: 600 }}>
                    {(r.user_name || 'U')[0]}
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 500, color: '#252525' }}>{r.user_name || 'User'}</span>
                </div>
                <div style={{ display: 'flex', gap: '2px' }}>
                  {[1,2,3,4,5].map(s => <Star key={s} size={11} fill={r.rating >= s ? '#D99A5B' : 'none'} color={r.rating >= s ? '#D99A5B' : '#D4D4D4'} />)}
                </div>
              </div>
              {r.review_text && <p style={{ fontSize: '13px', color: '#6B6B6B', margin: 0, lineHeight: '1.5' }}>{r.review_text}</p>}
            </div>
          ))}
        </section>

        {/* Related */}
        {related.length > 0 && (
          <section style={{ padding: '0 0 16px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 500, color: '#252525', margin: '0 0 12px', padding: '0 20px' }}>
              Related in {book.subject}
            </h2>
            <div style={{ display: 'flex', gap: '12px', padding: '0 20px', overflowX: 'auto', scrollbarWidth: 'none' }}>
              {related.map(rel => (
                <button key={rel.id} onClick={() => { playTap(); navigate(`/book/${rel.id}`); }} style={{ flexShrink: 0, width: '100px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0 }}>
                  <div style={{ width: '100px', height: '136px', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#EDE9DD', marginBottom: '6px' }}>
                    <img src={rel.cover_url} alt={rel.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ fontSize: '11px', fontWeight: 500, color: '#252525', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', lineHeight: '1.35' }}>
                    {rel.title}
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}
      </main>

      <style>{`
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes slideDown{from{opacity:0;transform:translateX(-50%) translateY(-8px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>
    </div>
  );
}
