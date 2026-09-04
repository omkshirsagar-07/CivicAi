'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { fetchJson } from '@/utils/client';

const AuthContext = createContext(null);

/**
 * Lightweight client-side session mirror.
 *
 * The browser never receives tokens; it only knows whether a session exists
 * by asking /api/auth/session. All protected actions are enforced again
 * server-side.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState('loading'); // loading | ready

  const refresh = useCallback(async () => {
    try {
      const data = await fetchJson('/api/auth/session');
      setUser(data.user || null);
    } catch {
      setUser(null);
    } finally {
      setStatus('ready');
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(
    async (email, password) => {
      const data = await fetchJson('/api/auth/login', { method: 'POST', body: { email, password } });
      setUser(data.user);
      return data.user;
    },
    []
  );

  const register = useCallback(
    async (payload) => {
      const data = await fetchJson('/api/auth/register', {
        method: 'POST',
        body: payload,
      });
      setUser(data.user);
      return data.user;
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await fetchJson('/api/auth/logout', { method: 'POST' });
    } finally {
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, status, login, register, logout, refresh, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
