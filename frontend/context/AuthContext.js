'use client';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    try {
      if (!localStorage.getItem('gc_token')) return setUser(null);
      const res = await api('/auth/me');
      setUser(res.data.user);
    } catch {
      localStorage.removeItem('gc_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadUser(); }, [loadUser]);

  const login = async (email, password) => {
    const res = await api('/auth/login', { method: 'POST', body: { email, password } });
    localStorage.setItem('gc_token', res.token);
    setUser(res.data.user);
    return res.data.user;
  };

  const register = async (payload) => {
    const res = await api('/auth/register', { method: 'POST', body: payload });
    localStorage.setItem('gc_token', res.token);
    setUser(res.data.user);
    return res.data.user;
  };

  const logout = async () => {
    try { await api('/auth/logout', { method: 'POST' }); } catch {}
    localStorage.removeItem('gc_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, register, logout, refresh: loadUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
