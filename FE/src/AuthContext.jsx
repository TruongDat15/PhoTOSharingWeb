// import React, { createContext, useState, useEffect } from 'react';
// import fetchModel from './lib/fetchModelData';
// import API_BASE from './config';
//
// export const AuthContext = createContext({ user: null });
//
// export function AuthProvider({ children }) {
//   const [user, setUser] = useState(null);
//   const [checked, setChecked] = useState(false);
//
//   useEffect(() => {
//     // check current session
//     fetchModel('/admin/whoami')
//       .then(u => { setUser(u); })
//       .catch(() => { setUser(null); })
//       .finally(() => setChecked(true));
//   }, []);
//
//   const login = async (login_name, password) => {
//     const res = await fetch(`${API_BASE}/admin/login`, {
//       method: 'POST',
//       credentials: 'include',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ login_name, password }),
//     });
//     if (!res.ok) {
//       const text = await res.text();
//       throw new Error(text || 'Login failed');
//     }
//     const data = await res.json();
//     setUser(data);
//     return data;
//   };
//
//   const logout = async () => {
//     const res = await fetch(`${API_BASE}/admin/logout`, {
//       method: 'POST',
//       credentials: 'include',
//     });
//     if (!res.ok) {
//       const text = await res.text();
//       throw new Error(text || 'Logout failed');
//     }
//     setUser(null);
//   };
//
//   return (
//     <AuthContext.Provider value={{ user, checked, login, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// }

import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext({ user: null });

export function AuthProvider({ children }) {
    // Fake user tạm thời
    const [user, setUser] = useState({
        _id: "fake-id",
        first_name: "Demo",
        login_name: "demo",
    });
    const [checked, setChecked] = useState(true); // đã "check session"

    const login = async (login_name, password) => {
        // fake login, luôn thành công
        const fakeUser = { _id: "fake-id", first_name: login_name, login_name };
        setUser(fakeUser);
        return fakeUser;
    };

    const logout = async () => {
        // fake logout
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, checked, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}
