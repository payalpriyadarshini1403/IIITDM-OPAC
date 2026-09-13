import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/auth';

// Pages
import Splash from './pages/Splash';
import Login from './pages/Login';
import Home from './pages/Home';
import Search from './pages/Search';
import Results from './pages/Results';
import BookDetail from './pages/BookDetail';
import Availability from './pages/Availability';
import LocationMatrix from './pages/LocationMatrix';
import DigitalAccess from './pages/DigitalAccess';
import Browse from './pages/Browse';
import Account from './pages/Account';
import Collections from './pages/Collections';
import Growth from './pages/Growth';
import PersonalRecs from './pages/PersonalRecs';
import PublicProfile from './pages/PublicProfile';
import PeerRecs from './pages/PeerRecs';
import FacultyRecs from './pages/FacultyRecs';
import PublicCollections from './pages/PublicCollections';

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Splash />} />
      <Route path="/login" element={<Login />} />
      <Route path="/home" element={<Home />} />
      <Route path="/search" element={<Search />} />
      <Route path="/results" element={<Results />} />
      <Route path="/book/:id" element={<BookDetail />} />
      <Route path="/availability/:id" element={<Availability />} />
      <Route path="/location-map/:id" element={<LocationMatrix />} />
      <Route path="/digital/:id" element={<DigitalAccess />} />
      <Route path="/browse" element={<Browse />} />
      
      {/* Protected Routes */}
      <Route path="/account" element={<Account />} />
      <Route path="/collections" element={<Collections />} />
      <Route path="/growth" element={<Growth />} />
      <Route path="/personal-recs" element={<RequireAuth><PersonalRecs /></RequireAuth>} />
      <Route path="/peer-recs" element={<RequireAuth><PeerRecs /></RequireAuth>} />
      <Route path="/faculty-recs" element={<RequireAuth><FacultyRecs /></RequireAuth>} />
      <Route path="/public-collections" element={<RequireAuth><PublicCollections /></RequireAuth>} />
      <Route path="/profile/:id" element={<RequireAuth><PublicProfile /></RequireAuth>} />
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </AuthProvider>
  );
}
