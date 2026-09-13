import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import SideMenu from '../components/SideMenu';
import { playTap } from '../lib/sound';
import { getAllSubjects, getBooksBySubject } from '../lib/queries';

import { Code, Palette, Calculator, Building, Cog, Brain, Sprout, BarChart3, Library } from 'lucide-react';

const SUBJECT_ICONS: Record<string, React.ReactNode> = {
  'Computer Science': <Code size={24} strokeWidth={1.5} color="#155E63" />,
  'Design': <Palette size={24} strokeWidth={1.5} color="#155E63" />,
  'Mathematics': <Calculator size={24} strokeWidth={1.5} color="#155E63" />,
  'Civil Engineering': <Building size={24} strokeWidth={1.5} color="#155E63" />,
  'Materials Engineering': <Cog size={24} strokeWidth={1.5} color="#155E63" />,
  'Psychology': <Brain size={24} strokeWidth={1.5} color="#155E63" />,
  'Self-Development': <Sprout size={24} strokeWidth={1.5} color="#155E63" />,
  'Management': <BarChart3 size={24} strokeWidth={1.5} color="#155E63" />,
};

export default function Browse() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const [subjects, setSubjects] = useState<{name: string, count: number}[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const subs = await getAllSubjects();
      const withCounts = await Promise.all(subs.map(async s => {
        const books = await getBooksBySubject(s);
        return { name: s, count: books.length };
      }));
      setSubjects(withCounts);
      setIsLoading(false);
    })();
  }, []);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F7F3E8' }}>
      <TopBar title="Browse" onMenuOpen={() => setMenuOpen(true)} />
      <SideMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      <BottomNav />

      <main style={{ padding: '68px 0 80px' }}>
        <div style={{ padding: '16px 20px 8px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 500, color: '#252525', margin: '0 0 4px' }}>Browse by Subject</h1>
          <p style={{ fontSize: '14px', color: '#6B6B6B', margin: 0 }}>
            {subjects.length} subjects · Explore the collection
          </p>
        </div>

        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <div style={{ width: '30px', height: '30px', border: '3px solid #EDE9DD', borderTopColor: '#155E63', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '12px 20px', animation: 'fadeIn 0.35s ease both' }}>
            {subjects.map((subject, i) => (
              <button
                key={subject.name}
                onClick={() => { playTap(); navigate(`/results?subject=${encodeURIComponent(subject.name)}`); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '14px',
                  padding: '16px', backgroundColor: 'white',
                  borderRadius: '14px', border: 'none', cursor: 'pointer', textAlign: 'left',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                  animation: `fadeIn 0.35s ease ${i * 0.05}s both`,
                }}
                onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.98)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'; }}
                onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)'; }}
                onTouchStart={e => { e.currentTarget.style.transform = 'scale(0.98)'; }}
                onTouchEnd={e => { e.currentTarget.style.transform = 'scale(1)'; }}
              >
                <div style={{
                  width: '48px', height: '48px', borderRadius: '12px',
                  backgroundColor: '#F7F3E8',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  {SUBJECT_ICONS[subject.name] ?? <Library size={24} strokeWidth={1.5} color="#155E63" />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '15px', fontWeight: 500, color: '#252525', marginBottom: '3px' }}>{subject.name}</div>
                  <div style={{ fontSize: '12px', color: '#6B6B6B' }}>{subject.count} book{subject.count !== 1 ? 's' : ''}</div>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B6B6B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </button>
            ))}
          </div>
        )}
      </main>

      <style>{`
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>
    </div>
  );
}
