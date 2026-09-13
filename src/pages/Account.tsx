import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, BookOpen, Clock, AlertCircle, X, Check, Pencil } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { loans, bookCache, holds, cancelHold } from '../lib/db';
import { updateUserProfile } from '../lib/queries';
import { TopBar } from '../components/TopBar';
import { BottomNav } from '../components/BottomNav';
import type { Loan, Hold } from '../lib/db';

const StatusBadge = ({ status }: { status: 'available' | 'unavailable' | 'reserved' }) => {
  const colors = {
    available: { bg: '#ECFDF5', text: '#047857', icon: <Check size={10} /> },
    unavailable: { bg: '#FEF2F2', text: '#B91C1C', icon: <AlertCircle size={10} /> },
    reserved: { bg: '#FFFBEB', text: '#B45309', icon: <Clock size={10} /> }
  };
  const config = colors[status];
  
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      padding: '2px 6px', borderRadius: '4px',
      backgroundColor: config.bg, color: config.text,
      fontSize: '11px', fontWeight: 600,
    }}>
      {config.icon}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

export function Account() {
  const navigate = useNavigate();
  const { user, logout, isLoading } = useAuth();
  
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'library' | 'profile'>('library');
  const [toast, setToast] = useState('');
  
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({
    bio: user?.bio || '',
    department: user?.department || '',
    skills: user?.skills?.join(', ') || '',
    interests: user?.interests?.join(', ') || ''
  });

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const getOverdueFine = (loan: Loan) => {
    if (loan.status !== 'overdue') return 0;
    const due = new Date(loan.due_date);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays * 5 : 0;
  };

  const playTap = () => {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');
    audio.volume = 0.2;
    audio.play().catch(() => {});
  };

  const handleReturn = (loan: Loan) => {
    playTap();
    loan.status = 'returned';
    loan.returned_date = new Date().toISOString();
    showToast('Book returned successfully!');
  };

  const handleCancelHold = async (hold: Hold) => {
    playTap();
    await cancelHold(hold.id);
    showToast('Hold cancelled.');
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    playTap();
    
    const skills = editForm.skills.split(',').map(s => s.trim()).filter(Boolean);
    const interests = editForm.interests.split(',').map(s => s.trim()).filter(Boolean);
    
    await updateUserProfile(user.id, {
      bio: editForm.bio,
      department: editForm.department,
      skills,
      interests
    });
    
    setIsEditingProfile(false);
    showToast('Profile updated!');
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

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #E5E0D8', margin: '0 16px 16px' }}>
          <button onClick={() => setActiveTab('library')} style={{ flex: 1, padding: '12px', background: 'none', border: 'none', borderBottom: `2px solid ${activeTab === 'library' ? '#155E63' : 'transparent'}`, color: activeTab === 'library' ? '#155E63' : '#6B6B6B', fontWeight: activeTab === 'library' ? 600 : 500, fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s' }}>
            Library Activity
          </button>
          <button onClick={() => setActiveTab('profile')} style={{ flex: 1, padding: '12px', background: 'none', border: 'none', borderBottom: `2px solid ${activeTab === 'profile' ? '#155E63' : 'transparent'}`, color: activeTab === 'profile' ? '#155E63' : '#6B6B6B', fontWeight: activeTab === 'profile' ? 600 : 500, fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s' }}>
            Public Profile
          </button>
        </div>

        {activeTab === 'profile' && (
          <section style={{ padding: '0 16px', animation: 'fadeIn 0.3s ease both' }}>
            {isEditingProfile ? (
              <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: '#6B6B6B', marginBottom: '6px', fontWeight: 500 }}>Bio</label>
                  <textarea value={editForm.bio} onChange={e => setEditForm(prev => ({...prev, bio: e.target.value}))} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #E5E0D8', fontFamily: 'Inter', fontSize: '14px', minHeight: '80px', resize: 'vertical' }} placeholder="A short bio about yourself..." />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: '#6B6B6B', marginBottom: '6px', fontWeight: 500 }}>Department</label>
                  <input type="text" value={editForm.department} onChange={e => setEditForm(prev => ({...prev, department: e.target.value}))} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #E5E0D8', fontFamily: 'Inter', fontSize: '14px' }} placeholder="e.g. Computer Science" />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: '#6B6B6B', marginBottom: '6px', fontWeight: 500 }}>Skills (comma separated)</label>
                  <input type="text" value={editForm.skills} onChange={e => setEditForm(prev => ({...prev, skills: e.target.value}))} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #E5E0D8', fontFamily: 'Inter', fontSize: '14px' }} placeholder="e.g. React, Python, UI Design" />
                </div>
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: '#6B6B6B', marginBottom: '6px', fontWeight: 500 }}>Interests (comma separated)</label>
                  <input type="text" value={editForm.interests} onChange={e => setEditForm(prev => ({...prev, interests: e.target.value}))} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #E5E0D8', fontFamily: 'Inter', fontSize: '14px' }} placeholder="e.g. History, Machine Learning" />
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button onClick={() => setIsEditingProfile(false)} style={{ flex: 1, padding: '12px', backgroundColor: '#F0F0F0', color: '#252525', border: 'none', borderRadius: '8px', fontWeight: 500, fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <X size={16} /> Cancel
                  </button>
                  <button onClick={handleSaveProfile} style={{ flex: 1, padding: '12px', backgroundColor: '#155E63', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 500, fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <Check size={16} /> Save Profile
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', position: 'relative' }}>
                <button onClick={() => setIsEditingProfile(true)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: '#155E63', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>
                  <Pencil size={14} /> Edit
                </button>
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ fontSize: '12px', color: '#6B6B6B', fontWeight: 500, marginBottom: '4px' }}>Bio</div>
                  <div style={{ fontSize: '14px', color: '#252525', lineHeight: 1.5 }}>{user?.bio || 'No bio provided yet.'}</div>
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ fontSize: '12px', color: '#6B6B6B', fontWeight: 500, marginBottom: '4px' }}>Department</div>
                  <div style={{ fontSize: '14px', color: '#252525' }}>{user?.department || 'Not specified'}</div>
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ fontSize: '12px', color: '#6B6B6B', fontWeight: 500, marginBottom: '8px' }}>Skills</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {user?.skills?.length ? user.skills.map(skill => (
                      <span key={skill} style={{ padding: '6px 12px', backgroundColor: '#F0F5F5', color: '#155E63', borderRadius: '99px', fontSize: '12px', fontWeight: 500 }}>{skill}</span>
                    )) : <span style={{ fontSize: '13px', color: '#6B6B6B' }}>None added</span>}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#6B6B6B', fontWeight: 500, marginBottom: '8px' }}>Interests</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {user?.interests?.length ? user.interests.map(interest => (
                      <span key={interest} style={{ padding: '6px 12px', backgroundColor: '#F7F3E8', color: '#D4A373', borderRadius: '99px', fontSize: '12px', fontWeight: 500 }}>{interest}</span>
                    )) : <span style={{ fontSize: '13px', color: '#6B6B6B' }}>None added</span>}
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {/* Active Loans */}
        {activeTab === 'library' && (
        <>
          <section style={{ padding: '4px 16px 0', animation: 'fadeIn 0.3s ease both' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 500, color: '#252525', margin: '0 0 10px' }}>
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
        </>
        )}
      </main>

      <style>{`
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>
    </div>
  );
}
