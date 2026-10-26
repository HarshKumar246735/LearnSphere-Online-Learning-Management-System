import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as authService from '../services/authService.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // The session lives in an HTTP-only cookie, so the only way to know who is signed in is to ask the server.
  useEffect(() => {
    let active = true;
    authService.me()
      .then((res) => active && setUser(res.data.data.user))
      .catch(() => active && setUser(null))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  const login = useCallback(async (values) => {
    const res = await authService.login(values);
    setUser(res.data.data.user);
    return res.data.data.user;
  }, []);

  // The role is never sent from the client; the server always creates students.
  const register = useCallback(async ({ name, email, password, confirmPassword }) => {
    const res = await authService.register({ name, email, password, confirmPassword });
    setUser(res.data.data.user);
    return res.data.data.user;
  }, []);

  const logout = useCallback(async () => {
    try { await authService.logout(); } finally { setUser(null); }
  }, []);

  const value = useMemo(() => ({ user, loading, login, register, logout, setUser }), [user, loading, login, register, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
