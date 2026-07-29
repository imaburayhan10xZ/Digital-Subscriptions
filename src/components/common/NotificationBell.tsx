import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/api.ts';
import { UserNotification, NotificationType } from '../../types/index.ts';
import {
  Bell,
  CheckCheck,
  Trash2,
  Key,
  CreditCard,
  ShieldAlert,
  Info,
  X,
  ExternalLink,
  Sparkles,
  RefreshCw
} from 'lucide-react';

export const NotificationBell: React.FC = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'LICENSE' | 'PAYMENT' | 'SECURITY'>('ALL');
  const [loading, setLoading] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const data = await api.getNotifications();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      console.error('Failed to load notifications', err);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchNotifications();
    // Poll every 12 seconds for persistent global updates
    const interval = setInterval(fetchNotifications, 12000);
    return () => clearInterval(interval);
  }, [user]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  const handleMarkRead = async (notifId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await api.markNotificationRead(notifId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notifId ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      setLoading(true);
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (notifId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.deleteNotification(notifId);
      const target = notifications.find((n) => n.id === notifId);
      setNotifications((prev) => prev.filter((n) => n.id !== notifId));
      if (target && !target.isRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Failed to delete notification', err);
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === 'LICENSE') return n.type === 'LICENSE_ACTIVATED';
    if (activeFilter === 'PAYMENT') return n.type === 'PAYMENT_STATUS';
    if (activeFilter === 'SECURITY') return n.type === 'SECURITY' || n.type === 'SYSTEM';
    return true;
  });

  const getTypeIcon = (type: NotificationType) => {
    switch (type) {
      case 'LICENSE_ACTIVATED':
        return <Key className="w-4 h-4 text-emerald-600" />;
      case 'PAYMENT_STATUS':
        return <CreditCard className="w-4 h-4 text-blue-600" />;
      case 'SECURITY':
        return <ShieldAlert className="w-4 h-4 text-amber-600" />;
      default:
        return <Info className="w-4 h-4 text-purple-600" />;
    }
  };

  const getTypeBadgeColor = (type: NotificationType) => {
    switch (type) {
      case 'LICENSE_ACTIVATED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
      case 'PAYMENT_STATUS':
        return 'bg-blue-50 text-blue-700 border-blue-200/80';
      case 'SECURITY':
        return 'bg-amber-50 text-amber-800 border-amber-200/80';
      default:
        return 'bg-purple-50 text-purple-700 border-purple-200/80';
    }
  };

  const formatRelativeTime = (dateStr: string) => {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 text-slate-700 hover:text-indigo-600 hover:bg-slate-100/80 rounded-xl transition flex items-center justify-center border border-slate-200/60 focus:outline-none"
        title="Notifications & Alerts"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 bg-rose-600 text-white font-black text-[10px] rounded-full flex items-center justify-center shadow-md shadow-rose-500/30 border-2 border-white animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 sm:right-0 mt-3 w-80 sm:w-96 bg-white border border-slate-200/90 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center border border-indigo-400/20">
                <Sparkles className="w-4 h-4 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-sm font-black tracking-tight flex items-center space-x-1.5">
                  <span>Persistent Notifications</span>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 text-[10px] bg-rose-500 text-white font-extrabold rounded-full">
                      {unreadCount} NEW
                    </span>
                  )}
                </h3>
                <p className="text-[10px] text-slate-400 font-medium">License, payment & security alerts</p>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={fetchNotifications}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg transition hover:bg-slate-800"
                title="Refresh notifications"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg transition hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filter Bar & Quick Actions */}
          <div className="p-2.5 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between gap-1 overflow-x-auto text-[11px]">
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setActiveFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg font-bold transition ${
                  activeFilter === 'ALL'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setActiveFilter('LICENSE')}
                className={`px-2 py-1 rounded-lg font-bold transition flex items-center space-x-1 ${
                  activeFilter === 'LICENSE'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                <Key className="w-3 h-3" />
                <span>Licenses</span>
              </button>
              <button
                onClick={() => setActiveFilter('PAYMENT')}
                className={`px-2 py-1 rounded-lg font-bold transition flex items-center space-x-1 ${
                  activeFilter === 'PAYMENT'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                <CreditCard className="w-3 h-3" />
                <span>Payments</span>
              </button>
              <button
                onClick={() => setActiveFilter('SECURITY')}
                className={`px-2 py-1 rounded-lg font-bold transition flex items-center space-x-1 ${
                  activeFilter === 'SECURITY'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                <ShieldAlert className="w-3 h-3" />
                <span>Security</span>
              </button>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                disabled={loading}
                className="text-[10px] font-extrabold text-indigo-600 hover:text-indigo-800 shrink-0 flex items-center space-x-1 px-2 py-1 rounded hover:bg-indigo-50 transition"
              >
                <CheckCheck className="w-3 h-3" />
                <span>Mark All Read</span>
              </button>
            )}
          </div>

          {/* List of Notifications */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {filteredNotifications.length === 0 ? (
              <div className="py-12 px-4 text-center">
                <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700">No notifications found</p>
                <p className="text-[11px] text-slate-400 mt-1">You are all caught up with license and security alerts.</p>
              </div>
            ) : (
              filteredNotifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => {
                    if (!n.isRead) handleMarkRead(n.id);
                    if (n.linkUrl) {
                      window.location.href = n.linkUrl;
                    }
                  }}
                  className={`p-3.5 transition cursor-pointer flex items-start space-x-3 group relative ${
                    !n.isRead ? 'bg-indigo-50/40 hover:bg-indigo-50/70' : 'hover:bg-slate-50'
                  }`}
                >
                  {/* Unread Pill Indicator */}
                  {!n.isRead && (
                    <span className="absolute top-4 left-1.5 w-1.5 h-1.5 bg-indigo-600 rounded-full" />
                  )}

                  {/* Type Icon Badge */}
                  <div className={`p-2 rounded-xl border shrink-0 mt-0.5 ${getTypeBadgeColor(n.type)}`}>
                    {getTypeIcon(n.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <h4 className={`text-xs truncate ${!n.isRead ? 'font-black text-slate-900' : 'font-bold text-slate-700'}`}>
                        {n.title}
                      </h4>
                      <span className="text-[10px] text-slate-400 font-semibold shrink-0">
                        {formatRelativeTime(n.createdAt)}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 font-medium leading-relaxed line-clamp-2">
                      {n.message}
                    </p>

                    {n.linkUrl && (
                      <span className="mt-1.5 inline-flex items-center space-x-1 text-[10px] font-bold text-indigo-600 hover:underline">
                        <span>View Details</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </div>

                  {/* Hover Quick Actions */}
                  <div className="opacity-0 group-hover:opacity-100 transition flex items-center space-x-1 shrink-0">
                    {!n.isRead && (
                      <button
                        onClick={(e) => handleMarkRead(n.id, e)}
                        className="p-1 hover:bg-slate-200 text-slate-500 hover:text-indigo-600 rounded transition"
                        title="Mark read"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={(e) => handleDelete(n.id, e)}
                      className="p-1 hover:bg-rose-100 text-slate-400 hover:text-rose-600 rounded transition"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 bg-slate-50 border-t border-slate-200/80 text-center text-[11px]">
            <a
              href="/dashboard"
              onClick={() => setIsOpen(false)}
              className="font-bold text-indigo-600 hover:text-indigo-800 transition"
            >
              Open Full Notifications & Security Logs &rarr;
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
