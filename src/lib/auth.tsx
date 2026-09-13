/**
 * auth.tsx — Auth context with localStorage session persistence and DB-backed login
 */
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getUserByCredentials, getUserById } from './queries';
import type { User } from './queries';

const SESSION_KEY = 'opac_session_user';

interface AuthContextType {
  user: User | null;
  isGuest: boolean;
  isLoading: boolean;
  login: (instituteId: string, password: string) => Promise<boolean>;
  loginAsGuest: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(SESSION_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.type === 'guest') {
          setIsGuest(true);
        } else if (parsed.userId) {
          // Re-fetch user from DB to get latest data
          getUserById(parsed.userId).then(u => {
            if (u) setUser(u);
          });
        }
      } catch {
        localStorage.removeItem(SESSION_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (instituteId: string, password: string): Promise<boolean> => {
    // Try DB first
    const found = await getUserByCredentials(instituteId, password);
    if (found) {
      setUser(found);
      setIsGuest(false);
      localStorage.setItem(SESSION_KEY, JSON.stringify({ userId: found.id }));
      return true;
    }
    // Demo fallback: accept any ID
    const demoUser: User = {
      id: `demo_${instituteId}`,
      name: instituteId.startsWith('FAC') ? 'Faculty User' : 'Student User',
      institute_id: instituteId,
      role: instituteId.startsWith('FAC') ? 'faculty' : 'student',
      email: `${instituteId.toLowerCase()}@iiitdmj.ac.in`,
      avatar_url: '',
    };
    setUser(demoUser);
    setIsGuest(false);
    localStorage.setItem(SESSION_KEY, JSON.stringify({ userId: demoUser.id }));
    return true;
  };

  const loginAsGuest = () => {
    setUser(null);
    setIsGuest(true);
    localStorage.setItem(SESSION_KEY, JSON.stringify({ type: 'guest' }));
  };

  const logout = () => {
    setUser(null);
    setIsGuest(false);
    localStorage.removeItem(SESSION_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, isGuest, isLoading, login, loginAsGuest, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

// Re-export User type for convenience
export type { User };
