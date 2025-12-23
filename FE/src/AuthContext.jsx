import React, { createContext, useState, useEffect } from 'react';
import fetchModel from './lib/fetchModelData';

export const AuthContext = createContext({ user: null });

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // check current session
    fetchModel('/admin/whoami')
      .then(u => { setUser(u); })
      .catch(() => { setUser(null); })
      .finally(() => setChecked(true));
  }, []);

  const login = async (login_name, password) => {
    const base = process.env.REACT_APP_API_BASE || '';
    const res = await fetch(`${base}/admin/login`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login_name, password }),
    });
    if (!res.ok) {
      const t = await res.text();
      throw new Error(t || 'Login failed');
    }
    const data = await res.json();
    setUser(data);
    return data;
  };

  const logout = async () => {
    const base = process.env.REACT_APP_API_BASE || '';
    const res = await fetch(`${base}/admin/logout`, { method: 'POST', credentials: 'include' });
    if (!res.ok) {
      const t = await res.text();
      throw new Error(t || 'Logout failed');
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, checked, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
