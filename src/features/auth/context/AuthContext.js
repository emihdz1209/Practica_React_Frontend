import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

const TOKEN_KEY = 'token';
const USER_KEY  = 'auth_user';

function readUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (_e) {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user,  setUser]  = useState(readUser);

  const login = (responseData) => {
    const { token: t, userId, email, rolId } = responseData;
    const userData = { userId, email, rolId };
    localStorage.setItem(TOKEN_KEY, t);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    setToken(t);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
