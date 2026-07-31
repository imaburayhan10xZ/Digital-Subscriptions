import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, SiteSettings, Announcement } from '../types/index.js';
import { api } from '../services/api.js';
import { auth } from '../lib/firebase.js';
import { onAuthStateChanged, signOut } from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  settings: SiteSettings | null;
  announcements: Announcement[];
  logout: () => void;
  refreshUser: () => Promise<void>;
  refreshSettings: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
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

  const refreshUser = async (firebaseUser: any) => {
    if (!firebaseUser) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      // In a real app, you might fetch additional profile data from Firestore here
      // Based on previous authMiddleware logic, we trust the ID token's claims
      setUser({
        id: firebaseUser.uid,
        email: firebaseUser.email || '',
        name: firebaseUser.displayName || '',
        role: firebaseUser.email === 'aburayhan10x@gmail.com' ? 'ADMIN' : 'CUSTOMER',
        avatarUrl: firebaseUser.photoURL || '',
      } as User);
    } catch (e) {
      console.error('Failed to refresh user:', e);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshSettings();
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      refreshUser(firebaseUser);
    });
    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await signOut(auth);
  };

  const isAdmin = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        settings,
        announcements,
        logout,
        refreshUser: () => refreshUser(auth.currentUser),
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
