import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext.tsx';
import { CartProvider } from './context/CartContext.tsx';
import { SiteSettingsSync } from './components/common/SiteSettingsSync.tsx';
import { HomePage } from './pages/HomePage.tsx';
import { DownloadsPage } from './pages/DownloadsPage.tsx';
import { FAQPage } from './pages/FAQPage.tsx';
import { ContactPage } from './pages/ContactPage.tsx';
import { TermsPage, PrivacyPage, RefundPage } from './pages/TermsPage.tsx';
import { LoginPage } from './pages/LoginPage.tsx';
import { RegisterPage } from './pages/RegisterPage.tsx';
import { DashboardPage } from './pages/DashboardPage.tsx';
import { AdminPage } from './pages/AdminPage.tsx';

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const renderRoute = () => {
    const path = currentPath.toLowerCase();

    if (path === '/downloads') return <DownloadsPage />;
    if (path === '/faq') return <FAQPage />;
    if (path === '/contact') return <ContactPage />;
    if (path === '/terms') return <TermsPage />;
    if (path === '/privacy') return <PrivacyPage />;
    if (path === '/refund') return <RefundPage />;
    if (path === '/login') return <LoginPage />;
    if (path === '/register') return <RegisterPage />;
    if (path === '/dashboard') return <DashboardPage />;
    if (path === '/cmsadmin') {
      // In a real app, you might want a loading state here
      return <AdminPage />;
    }

    return <HomePage />;
  };

  return (
    <AuthProvider>
      <CartProvider>
        <SiteSettingsSync />
        {renderRoute()}
      </CartProvider>
    </AuthProvider>
  );
}
