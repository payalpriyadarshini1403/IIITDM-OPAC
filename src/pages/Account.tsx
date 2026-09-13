import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import SideMenu from '../components/SideMenu';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../lib/auth';
import { playTap, playSuccess } from '../lib/sound';
import {
  getLoansByUser, returnLoan, getOverdueFine,
  getHoldsByUser, cancelHold,
  getBookById,
  type Loan, type Hold, type Book,
} from '../lib/queries';

export default function Account() {
  const { user, isGuest, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const [loans, setLoans] = useState<Loan[]>([]);
  const [holds, setHolds] = useState<Hold[]>([]);
  const [bookCache, setBookCache] = useState<Record<string, Book>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (!user && !isGuest) { navigate('/login'); return; }
    if (!user) { setIsLoading(false); return; }

    (async () => {
      const [ls, hs] = await Promise.all([
        getLoansByUser(user.id),
        getHoldsByUser(user.id),
      ]);
      setLoans(ls);
      setHolds(hs);

      // Fetch all books referenced
      const ids = [...new Set([...ls.map(l => l.book_id), ...hs.map(h => h.book_id)])];
      const cache: Record<string, Book> = {};
      await Promise.all(ids.map(async id => {
        const b = await getBookById(id);
        if (b) cache[id] = b;
      }));
      setBookCache(cache);
      setIsLoading(false);
    })();
  }, [user, isGuest]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const handleReturn = async (loan: Loan) => {
    playTap();
    await returnLoan(loan.id);
    setLoans(prev => prev.map(l => l.id === loan.id ? { ...l, status: 'returned', returned_date: new Date().toISOString().split('T')[0] } : l));
    playSuccess();
    showToast('✓ Book returned successfully!');
  };

  const handleCancelHold = async (hold: Hold) => {
    playTap();
    await cancelHold(hold.id);
    setHolds(prev => prev.filter(h => h.id !== hold.id));
    showToast('Hold cancelled.');
  };

  const activeLoans = loans.filter(l => l.status === 'active' || l.status === 'overdue');
  const returnedLoans = loans.filter(l => l.status === 'returned');
  const totalFines = activeLoans.reduce((acc, l) => acc + getOverdueFine(l), 0);

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#F7F3E8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: '#6B6B6B' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid #EDE9DD', borderTopColor: '#155E63', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
          Loading account…
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F7F3E8' }}>
      <TopBar title="My Account" onMenuOpen={() => setMenuOpen(true)} />
      <SideMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
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

      <main style={{ padding: '68px 0 80px', animation: 'fadeIn 0.35s ease both' }}>

        {/* Profile card */}
        <div style={{ margin: '12px 16px', backgroundColor: '#155E63', borderRadius: '16px', padding: '20px', color: 'white', boxShadow: '0 2px 12px rgba(21,94,99,0.25)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: 500 }}>
              {user ? user.name[0] : 'G'}
            </div>
            <div>
              <div style={{ fontSize: '17px', fontWeight: 500 }}>{user ? user.name : 'Guest'}</div>
              <div style={{ fontSize: '13px', opacity: 0.75 }}>{user ? user.institute_id : 'Guest mode'}</div>
              <div style={{ fontSize: '11px', opacity: 0.6, textTransform: 'capitalize', marginTop: '2px' }}>{user?.role}</div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            {[
              { label: 'Active Loans', value: activeLoans.length },
              { label: 'On Hold', value: holds.length },
              { label: 'Dues (₹)', value: totalFines },
            ].map(stat => (
              <div key={stat.label} style={{ textAlign: 'center', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '10px', padding: '10px 4px' }}>
                <div style={{ fontSize: '22px', fontWeight: 500 }}>{stat.value}</div>
                <div style={{ fontSize: '11px', opacity: 0.75, marginTop: '2px' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Loans */}
        <section style={{ padding: '4px 16px 0' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 500, color: '#252525', margin: '16px 0 10px' }}>
            Current Loans ({activeLoans.length})
          </h2>
          {activeLoans.length === 0 && (
            <div style={{ textAlign: 'center', padding: '20px', color: '#6B6B6B', fontSize: '14px', backgroundColor: 'white', borderRadius: '12px' }}>
              No active loans
            </div>
          )}
          {activeLoans.map(loan => {
            const book = bookCache[loan.book_id];
            if (!book) return null;
            const fine = getOverdueFine(loan);
            const dueDate = new Date(loan.due_date);
            const daysLeft = Math.floor((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            return (
              <div key={loan.id} style={{
                backgroundColor: 'white', borderRadius: '12px', padding: '12px',
                marginBottom: '10px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                borderLeft: `3px solid ${loan.status === 'overdue' ? '#B91C1C' : '#155E63'}`,
              }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <button onClick={() => { playTap(); navigate(`/book/${book.id}`); }} style={{ display: 'flex', gap: '12px', alignItems: 'center', flex: 1, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0 }}>
                    <div style={{ width: '44px', height: '58px', borderRadius: '5px', overflow: 'hidden', backgroundColor: '#EDE9DD', flexShrink: 0 }}>
                      <img src={book.cover_url} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: 500, color: '#252525', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{book.title}</div>
                      <div style={{ fontSize: '12px', color: '#6B6B6B', marginBottom: '4px' }}>{book.authors[0]}</div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <StatusBadge status={loan.status === 'overdue' ? 'unavailable' : 'available'} />
                        <span style={{ fontSize: '11px', color: loan.status === 'overdue' ? '#B91C1C' : '#6B6B6B' }}>
                          {loan.status === 'overdue' ? `₹${fine} fine` : daysLeft >= 0 ? `Due in ${daysLeft}d` : 'Due today'}
                        </span>
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => handleReturn(loan)}
                    style={{
                      flexShrink: 0, padding: '7px 14px', borderRadius: '8px',
                      backgroundColor: '#155E63', color: 'white', border: 'none',
                      fontSize: '12px', fontWeight: 500, cursor: 'pointer',
                      fontFamily: 'Inter, sans-serif',
                    }}
                  >
                    Return
                  </button>
                </div>
              </div>
            );
          })}
        </section>

        {/* Holds */}
        <section style={{ padding: '0 16px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 500, color: '#252525', margin: '16px 0 10px' }}>
            Holds ({holds.length})
          </h2>
          {holds.length === 0 && (
            <div style={{ textAlign: 'center', padding: '20px', color: '#6B6B6B', fontSize: '14px', backgroundColor: 'white', borderRadius: '12px' }}>
              No books on hold
            </div>
          )}
          {holds.map(hold => {
            const book = bookCache[hold.book_id];
            if (!book) return null;
            return (
              <div key={hold.id} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '12px', marginBottom: '10px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ width: '44px', height: '58px', borderRadius: '5px', overflow: 'hidden', backgroundColor: '#EDE9DD', flexShrink: 0 }}>
                  <img src={book.cover_url} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: '#252525', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{book.title}</div>
                  <div style={{ fontSize: '12px', color: '#6B6B6B', marginBottom: '4px' }}>{book.authors[0]}</div>
                  <span style={{
                    fontSize: '11px', padding: '2px 8px', borderRadius: '999px', fontWeight: 500,
                    backgroundColor: hold.status === 'ready' ? '#ECFDF5' : '#FFFBEB',
                    color: hold.status === 'ready' ? '#047857' : '#B45309',
                  }}>
                    {hold.status === 'ready' ? '✓ Ready for pickup' : `Queue #${hold.queue_position}`}
                  </span>
                </div>
                <button
                  onClick={() => handleCancelHold(hold)}
                  style={{
                    flexShrink: 0, padding: '7px 12px', borderRadius: '8px',
                    backgroundColor: 'transparent', color: '#B91C1C',
                    border: '1.5px solid #B91C1C', fontSize: '12px', fontWeight: 500,
                    cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                  }}
                >
                  Cancel
                </button>
              </div>
            );
          })}
        </section>

        {/* Reading History */}
        {returnedLoans.length > 0 && (
          <section style={{ padding: '0 16px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 500, color: '#252525', margin: '16px 0 10px' }}>
              Reading History ({returnedLoans.length})
            </h2>
            {returnedLoans.map(loan => {
              const book = bookCache[loan.book_id];
              if (!book) return null;
              return (
                <div key={loan.id} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '12px', marginBottom: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', display: 'flex', gap: '12px', alignItems: 'center', opacity: 0.8 }}>
                  <div style={{ width: '36px', height: '48px', borderRadius: '4px', overflow: 'hidden', backgroundColor: '#EDE9DD', flexShrink: 0 }}>
                    <img src={book.cover_url} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 500, color: '#252525', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{book.title}</div>
                    <div style={{ fontSize: '11px', color: '#6B6B6B' }}>
                      Returned {loan.returned_date ? new Date(loan.returned_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : ''}
                    </div>
                  </div>
                  <button
                    onClick={() => { playTap(); navigate(`/book/${book.id}`); }}
                    style={{ background: 'none', border: 'none', color: '#155E63', fontSize: '12px', fontWeight: 500, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
                  >
                    View
                  </button>
                </div>
              );
            })}
          </section>
        )}

        {/* Logout */}
        {user && (
          <div style={{ padding: '16px 16px 0' }}>
            <button
              onClick={() => { logout(); navigate('/login'); }}
              style={{ width: '100%', padding: '13px', border: '1.5px solid #B91C1C', borderRadius: '12px', background: 'none', color: '#B91C1C', fontWeight: 500, fontSize: '14px', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
            >
              Log out
            </button>
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
