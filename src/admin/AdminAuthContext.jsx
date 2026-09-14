import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';

const AdminAuthContext = createContext(null);

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount — verify token
  useEffect(() => {
    const token = localStorage.getItem('giftvibes_admin_token');
    if (token) {
      api.get('/auth/me')
        .then((data) => {
          setAdmin(data.admin);
        })
        .catch(() => {
          localStorage.removeItem('giftvibes_admin_token');
          setAdmin(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username, password) => {
    const data = await api.post('/auth/login', { username, password });
    localStorage.setItem('giftvibes_admin_token', data.token);
    setAdmin(data.admin);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('giftvibes_admin_token');
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
