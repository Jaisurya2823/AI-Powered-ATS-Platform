import { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('ats_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const login = useCallback((token, userData) => {
    localStorage.setItem('ats_token', token);
    localStorage.setItem('ats_user', JSON.stringify(userData));
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('ats_token');
    localStorage.removeItem('ats_user');
    setUser(null);
  }, []);

  const isRecruiter = user?.role === 'recruiter';
  const isApplicant = user?.role === 'applicant';
  const isLoggedIn = !!user;

  return (
    <AuthContext.Provider value={{ user, login, logout, isRecruiter, isApplicant, isLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};