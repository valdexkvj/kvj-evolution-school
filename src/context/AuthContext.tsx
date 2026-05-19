import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/services/api';
import { ROLES } from '@/utils/constants';

interface User { _id: string; name: string; email: string; role: string; niveau: string; }

interface AuthCtx {
  user: User | null; token: string | null; loading: boolean;
  login: (e: string, p: string) => Promise<void>;
  register: (d: any) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean; isAdmin: boolean;
}

const AuthContext = createContext<AuthCtx | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem('kvj_token');
    const u = localStorage.getItem('kvj_user');
    if (t && u) { setToken(t); setUser(JSON.parse(u)); }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const { token: t, user: u } = await api.login(email, password);
    setToken(t); setUser(u);
    localStorage.setItem('kvj_token', t);
    localStorage.setItem('kvj_user', JSON.stringify(u));
  };

  const register = async (data: any) => {
    const { token: t, user: u } = await api.register(data);
    setToken(t); setUser(u);
    localStorage.setItem('kvj_token', t);
    localStorage.setItem('kvj_user', JSON.stringify(u));
  };

  const logout = () => {
    setToken(null); setUser(null);
    localStorage.removeItem('kvj_token');
    localStorage.removeItem('kvj_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, isAuthenticated: !!token, isAdmin: user?.role === ROLES.ADMIN }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth requires AuthProvider');
  return ctx;
}
