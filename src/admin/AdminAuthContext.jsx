import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { api } from '../api/client';

const AdminAuthContext = createContext(null);

const TOKEN_KEY = 'giftvibes_admin_token';
const SESSION_KEY = 'giftvibes_admin_session';
const SESSION_TTL_MS = 3 * 24 * 60 * 60 * 1000; // ৩ দিন = 3 days

// ─── Helpers ──────────────────────────────────────────────────────────────────

function loadCachedSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    if (!session || !session.admin || !session.expiresAt) return null;
    if (Date.now() > session.expiresAt) {
      localStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(TOKEN_KEY);
      return null;
    }
    return session.admin;
  } catch (_) {
    return null;
  }
}

function saveSession(admin) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify({
      admin,
      expiresAt: Date.now() + SESSION_TTL_MS,
    }));
  } catch (_) {}
}

function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(SESSION_KEY);
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export const AdminAuthProvider = ({ children }) => {
  const cachedAdmin = loadCachedSession();
  const hasToken = !!localStorage.getItem(TOKEN_KEY);

  const [admin, setAdmin] = useState(cachedAdmin);
  // Show loading spinner only when we have a token but NO valid cache (rare case)
  const [loading, setLoading] = useState(hasToken && !cachedAdmin);
  const verifiedRef = useRef(false);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    const cached = loadCachedSession();

    if (cached) {
      // ✅ Valid session in localStorage → skip server call entirely
      setAdmin(cached);
      setLoading(false);
      verifiedRef.current = true;
      return;
    }

    if (token && !verifiedRef.current) {
      verifiedRef.current = true;
      // Token exists but no cache (e.g. cache was cleared) → verify once with server
      api.get('/auth/me')
        .then((data) => {
          setAdmin(data.admin);
          saveSession(data.admin);
        })
        .catch(() => {
          clearSession();
          setAdmin(null);
        })
        .finally(() => setLoading(false));
    } else if (!token) {
      setLoading(false);
    }
  }, []);

  // Auto-logout on global 401 event (token expired mid-session)
  useEffect(() => {
    const handleUnauthorized = () => {
      clearSession();
      setAdmin(null);
    };
    window.addEventListener('giftvibes_auth_unauthorized', handleUnauthorized);
    return () => window.removeEventListener('giftvibes_auth_unauthorized', handleUnauthorized);
  }, []);

  const login = async (username, password) => {
    const data = await api.post('/auth/login', { username, password });
    localStorage.setItem(TOKEN_KEY, data.token);
    saveSession(data.admin);
    setAdmin(data.admin);
    return data;
  };

  const logout = () => {
    clearSession();
    setAdmin(null);
  };

  return (
    <AdminAuthContext.Provider value={{ admin, loading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
};
