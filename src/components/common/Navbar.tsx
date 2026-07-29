import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useCart } from '../../context/CartContext.tsx';
import { CartModal } from './CartModal.tsx';
import { NotificationBell } from './NotificationBell.tsx';
import { Zap, Shield, Download, User as UserIcon, LogOut, Menu, X, ChevronRight, LayoutDashboard, Settings, ShoppingBag } from 'lucide-react';

interface NavbarProps {
  activeTab?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab = 'home' }) => {
  const { user, isAdmin, logout, announcements, settings } = useAuth();
  const { totalCount, isCartOpen, setIsCartOpen } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeAnnouncement = announcements.find((a) => a.isActive && a.type === 'BANNER');

  const navLinks = [
    { id: 'home', label: 'Home', href: '/' },
    { id: 'downloads', label: 'Downloads', href: '/downloads' },
    { id: 'faq', label: 'FAQ', href: '/faq' },
    { id: 'contact', label: 'Contact', href: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full transition-all">
      {/* Top Announcement Bar */}
      {activeAnnouncement && (
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white text-xs font-semibold py-2 px-4 text-center flex items-center justify-center space-x-2 shadow-sm">
          <Zap className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
          <span>{activeAnnouncement.content}</span>
          {activeAnnouncement.linkUrl && (
            <a href={activeAnnouncement.linkUrl} className="underline hover:text-yellow-200 transition ml-1 font-bold">
              Check Details &rarr;
            </a>
          )}
        </div>
      )}

      {/* Main Glass Navbar */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200/80 px-4 sm:px-8 py-3.5 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Brand Logo */}
          <a href="/" className="flex items-center space-x-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-slate-900 group-hover:text-blue-600 transition">
                {settings?.siteName || 'ApexBoost'}
              </span>
              <span className="hidden sm:inline-block text-[10px] uppercase font-bold text-blue-600 bg-blue-50 border border-blue-200/60 px-1.5 py-0.5 rounded ml-2 tracking-wider">
                SaaS v3.4
              </span>
            </div>
          </a>

          {/* Desktop Links */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-100/60 p-1 rounded-full border border-slate-200/60">
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={link.href}
                className={`px-4 py-1.5 text-xs font-semibold rounded-full transition ${
                  activeTab === link.id
                    ? 'bg-white text-blue-600 shadow-sm border border-slate-200/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* User Auth / Dashboard / Cart Controls */}
          <div className="flex items-center space-x-2.5">
            {/* Persistent Global Notification Bell */}
            {user && <NotificationBell />}

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 text-slate-700 hover:text-blue-600 hover:bg-slate-100/80 rounded-xl transition flex items-center justify-center border border-slate-200/60"
              title="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-blue-600 text-white font-extrabold text-[10px] rounded-full flex items-center justify-center shadow-md shadow-blue-500/30 border-2 border-white">
                  {totalCount}
                </span>
              )}
            </button>

            <div className="hidden sm:flex items-center space-x-2">
              {user ? (
                <div className="flex items-center space-x-2">
                  {isAdmin ? (
                    <a
                      href="/admin"
                      className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-md shadow-purple-500/20 transition flex items-center space-x-1.5"
                    >
                      <Settings className="w-3.5 h-3.5" />
                      <span>Admin Panel</span>
                    </a>
                  ) : (
                    <a
                      href="/dashboard"
                      className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition flex items-center space-x-1.5"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5" />
                      <span>My Dashboard</span>
                    </a>
                  )}

                  <button
                    onClick={logout}
                    title="Logout"
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <a
                    href="/login"
                    className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
                  >
                    Log In
                  </a>
                  <a
                    href="/register"
                    className="px-4 py-2 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-md shadow-slate-900/10 transition flex items-center space-x-1"
                  >
                    <span>Get Started</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-2xl border-b border-slate-200 p-6 space-y-4 shadow-xl">
          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={link.href}
                className="px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-xl"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-col space-y-2">
            {user ? (
              <>
                <a
                  href={isAdmin ? '/admin' : '/dashboard'}
                  className="w-full py-2.5 text-center text-xs font-bold bg-blue-600 text-white rounded-xl"
                >
                  {isAdmin ? 'Admin Dashboard' : 'User Dashboard'}
                </a>
                <button
                  onClick={logout}
                  className="w-full py-2.5 text-center text-xs font-bold bg-slate-100 text-rose-600 rounded-xl"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <a
                  href="/login"
                  className="w-full py-2.5 text-center text-xs font-bold text-slate-700 bg-slate-100 rounded-xl"
                >
                  Log In
                </a>
                <a
                  href="/register"
                  className="w-full py-2.5 text-center text-xs font-bold bg-blue-600 text-white rounded-xl"
                >
                  Register Account
                </a>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
