import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import { useAuth } from '../lib/auth';
import { getReadingStats } from '../lib/queries';
import { BookOpen, Trophy, Flame } from 'lucide-react';

export default function Growth() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState<Awaited<ReturnType<typeof getReadingStats>> | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) { setIsLoading(false); return; }
    (async () => {
      const s = await getReadingStats(user.id);
      setStats(s);

      setIsLoading(false);
    })();
  }, [user]);

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#F7F3E8', paddingTop: '80px', textAlign: 'center' }}>
        <TopBar title="Reading Growth" showBack />
        <p style={{ color: '#6B6B6B', padding: '24px' }}>Sign in to see your reading journey.</p>
        <button onClick={() => navigate('/login')} style={{ padding: '12px 24px', backgroundColor: '#155E63', color: 'white', borderRadius: '12px', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Sign in</button>
        <BottomNav />
      </div>
    );
  }

  if (isLoading || !stats) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#F7F3E8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: '#6B6B6B' }}>
          <div style={{ width: '36px', height: '36px', border: '3px solid #EDE9DD', borderTopColor: '#155E63', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 10px' }} />
          Loading…
        </div>
      </div>
    );
  }

  const { totalBooks, subjectBreakdown, monthlyActivity, streak } = stats;
  const maxMonthly = Math.max(...monthlyActivity.map(m => m.count), 1);
  const maxSubject = Math.max(...subjectBreakdown.map(s => s.count), 1);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F7F3E8' }}>
      <TopBar title="Reading Growth" showBack />
      <BottomNav />

      <main style={{ padding: '68px 16px 80px', animation: 'fadeIn 0.35s ease both' }}>
        
        {/* Header Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '16px' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#155E63', marginBottom: '8px' }}>
              <BookOpen size={20} />
            </div>
            <div style={{ fontSize: '24px', fontWeight: 600, color: '#252525' }}>{totalBooks}</div>
            <div style={{ fontSize: '12px', color: '#6B6B6B', fontWeight: 500 }}>Total Books</div>
          </div>
          
          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
             <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#FFFBEB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D99A5B', marginBottom: '8px' }}>
              <Flame size={20} />
            </div>
            <div style={{ fontSize: '24px', fontWeight: 600, color: '#252525' }}>{streak}</div>
            <div style={{ fontSize: '12px', color: '#6B6B6B', fontWeight: 500 }}>Day Streak</div>
          </div>
        </div>

        {/* Milestone Card */}
        <div style={{ backgroundColor: '#155E63', borderRadius: '16px', padding: '16px', color: 'white', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 4px 12px rgba(21,94,99,0.2)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Trophy size={24} color="#FDE68A" />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '15px', fontWeight: 600, margin: '0 0 4px' }}>Scholar Badge</h3>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', margin: 0, lineHeight: '1.4' }}>
              You've read {totalBooks} books this semester. Next milestone: {Math.ceil((totalBooks + 1) / 5) * 5} books.
            </p>
          </div>
        </div>

        {/* Monthly Activity Chart */}
        <section style={{ backgroundColor: 'white', borderRadius: '16px', padding: '16px', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 600, color: '#252525', margin: '0 0 16px' }}>Monthly Activity</h2>
          {monthlyActivity.length === 0 ? (
            <p style={{ fontSize: '13px', color: '#6B6B6B', textAlign: 'center', padding: '20px 0' }}>No reading history yet.</p>
          ) : (
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '140px', gap: '8px', paddingTop: '10px' }}>
              {monthlyActivity.map(m => (
                <div key={m.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                  <div style={{ fontSize: '11px', color: '#6B6B6B', fontWeight: 500 }}>{m.count > 0 ? m.count : ''}</div>
                  <div style={{ 
                    width: '100%', maxWidth: '32px', 
                    height: m.count > 0 ? `${(m.count / maxMonthly) * 100}px` : '4px',
                    backgroundColor: m.count > 0 ? '#155E63' : '#F7F3E8',
                    borderRadius: '6px', transition: 'height 0.5s ease'
                  }} />
                  <div style={{ fontSize: '10px', color: '#A3A3A3', fontWeight: 500 }}>{new Date(m.month + '-01').toLocaleDateString('en-US', { month: 'short' })}</div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Subject Breakdown */}
        <section style={{ backgroundColor: 'white', borderRadius: '16px', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 600, color: '#252525', margin: '0 0 16px' }}>Favorite Subjects</h2>
          {subjectBreakdown.length === 0 ? (
            <p style={{ fontSize: '13px', color: '#6B6B6B', textAlign: 'center', padding: '20px 0' }}>Read books to see your favorite subjects.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {subjectBreakdown.map(s => (
                <div key={s.subject}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                    <span style={{ color: '#252525', fontWeight: 500 }}>{s.subject}</span>
                    <span style={{ color: '#6B6B6B' }}>{s.count} books</span>
                  </div>
                  <div style={{ height: '8px', backgroundColor: '#F7F3E8', borderRadius: '999px', overflow: 'hidden' }}>
                    <div style={{ 
                      height: '100%', width: `${(s.count / maxSubject) * 100}%`, 
                      backgroundColor: '#D99A5B', borderRadius: '999px',
                      transition: 'width 0.5s ease'
                    }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </main>

      <style>{`
        @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>
    </div>
  );
}
