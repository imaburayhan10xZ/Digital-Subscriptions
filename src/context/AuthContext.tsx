import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, SiteSettings, Announcement } from '../types/index.js';
import { api } from '../services/api.js';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  settings: SiteSettings | null;
  announcements: Announcement[];
  login: (token: string, user: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
  refreshSettings: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('apexboost_token'));
  const [loading, setLoading] = useState<boolean>(true);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  const refreshSettings = async () => {
    try {
      const s = await api.getSettings();
      setSettings(s);
      const a = await api.getAnnouncements();
      setAnnouncements(a);
    } catch (e) {
      console.error('Failed to load initial site settings:', e);
    }
  };

  const refreshUser = async () => {
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const res = await api.getMe();
      setUser(res.user);
    } catch (e) {
      console.error('Session expired or invalid token:', e);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshSettings();
    refreshUser();
  }, []);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('apexboost_token', newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('apexboost_token');
    setToken(null);
    setUser(null);
  };

  const isAdmin = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        settings,
        announcements,
        login,
        logout,
        refreshUser,
        refreshSettings,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
