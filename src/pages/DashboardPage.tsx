import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.js';
import { License, Order, SupportTicket, DownloadRelease, Product, UserNotification, NotificationType, Tutorial, ManualSetupRequest, ManualSetupStatus } from '../types/index.js';
import { Badge } from '../components/common/Badge.tsx';
import { Modal } from '../components/common/Modal.tsx';
import { NotificationModal, NotificationState } from '../components/common/NotificationModal.tsx';
import { VideoEmbed } from '../components/common/VideoEmbed.tsx';
import {
  Zap,
  LayoutDashboard,
  Key,
  Download,
  CreditCard,
  RefreshCw,
  HelpCircle,
  User as UserIcon,
  LogOut,
  Copy,
  Check,
  Eye,
  EyeOff,
  Cpu,
  ShieldAlert,
  Plus,
  Send,
  MessageSquare,
  FileText,
  Clock,
  ChevronRight,
  ShieldCheck,
  Lock,
  Gift,
  AlertCircle,
  Bell,
  CheckCheck,
  Trash2,
  ExternalLink,
  Sparkles,
  Terminal,
  ShoppingBag,
  Globe,
  Video,
  Wrench,
  Sliders,
  Settings,
  CheckCircle2
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user, logout, settings, refreshUser, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'licenses' | 'hwid' | 'downloads' | 'tutorials' | 'payments' | 'tickets' | 'profile' | 'notifications'>('overview');

  // User state
  const [licenses, setLicenses] = useState<License[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [downloads, setDownloads] = useState<DownloadRelease[]>([]);
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [unreadNotifsCount, setUnreadNotifsCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // HWID Modal state
  const [isHwidModalOpen, setIsHwidModalOpen] = useState(false);
  const [isDetectModalOpen, setIsDetectModalOpen] = useState(false);
  const [hwidInput, setHwidInput] = useState(user?.hwid || '');
  const [pastedHwid, setPastedHwid] = useState('');
  const [hwidLoading, setHwidLoading] = useState(false);
  const [hwidErr, setHwidErr] = useState('');
  const [hwidSuccess, setHwidSuccess] = useState('');
  const [psCopied, setPsCopied] = useState(false);

  // License view controls
  const [showKeyId, setShowKeyId] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Tickets
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState('License Issue');
  const [ticketPriority, setTicketPriority] = useState('MEDIUM');
  const [ticketMessage, setTicketMessage] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyText, setReplyText] = useState('');

  // Invoice Modal
  const [selectedInvoice, setSelectedInvoice] = useState<Order | null>(null);

  // Profile Form
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [profileMsg, setProfileMsg] = useState('');
  const [profileErr, setProfileErr] = useState('');

  // Redeem Key Modal state
  const [isRedeemModalOpen, setIsRedeemModalOpen] = useState(false);
  const [dashboardRedeemCode, setDashboardRedeemCode] = useState('');
  const [dashboardProductId, setDashboardProductId] = useState('');
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [redeemLoading, setRedeemLoading] = useState(false);
  const [redeemErr, setRedeemErr] = useState('');
  const [redeemSuccessMsg, setRedeemSuccessMsg] = useState('');

  // Setup Modal State
  const [userSetupRequests, setUserSetupRequests] = useState<ManualSetupRequest[]>([]);
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [selectedSetupLicense, setSelectedSetupLicense] = useState<License | null>(null);
  const [selectedSetupProduct, setSelectedSetupProduct] = useState<Product | null>(null);
  const [setupCustomAnswers, setSetupCustomAnswers] = useState<Record<string, string>>({});
  const [setupUserPhone, setSetupUserPhone] = useState<string>('');
  const [setupHwidInput, setSetupHwidInput] = useState<string>('');
  const [setupSubmitting, setSetupSubmitting] = useState(false);
  const [setupSuccessMsg, setSetupSuccessMsg] = useState<string>('');
  const [setupErrMsg, setSetupErrMsg] = useState<string>('');

  // UI Popup Notification state
  const [notifPopup, setNotifPopup] = useState<NotificationState>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
  });

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      window.location.href = '/login';
      return;
    }
    fetchUserData();
    api.getProducts().then((prods) => {
      setAllProducts(prods);
      if (prods.length > 0) setDashboardProductId(prods[0].id);
    }).catch((e) => console.error(e));
  }, [authLoading, user]);

  const POWERSHELL_HWID_CMD = `powershell -NoProfile -ExecutionPolicy Bypass -Command "$sid=([System.Security.Principal.WindowsIdentity]::GetCurrent()).User.Value;Set-Clipboard $sid;$path=$env:TEMP+'\\SID.txt';Set-Content -Path $path -Value $sid -Encoding UTF8;notepad $path"`;

  const handleCopyPowershellCmd = () => {
    navigator.clipboard.writeText(POWERSHELL_HWID_CMD);
    setPsCopied(true);
    setTimeout(() => setPsCopied(false), 3000);
  };

  const handleApplyDetectedHwid = (customVal?: string) => {
    const targetVal = customVal || pastedHwid;
    if (targetVal && targetVal.trim()) {
      setHwidInput(targetVal.trim().toUpperCase());
    } else {
      handleAutoDetectHwid();
    }
    setIsDetectModalOpen(false);
  };

  const handleAutoDetectHwid = () => {
    const nav = window.navigator;
    const screen = window.screen;
    const rawSig = `${nav.userAgent}-${screen.width}x${screen.height}-${nav.language}-${screen.colorDepth}`;
    let hash = 0;
    for (let i = 0; i < rawSig.length; i++) {
      hash = (hash << 5) - hash + rawSig.charCodeAt(i);
      hash |= 0;
    }
    const hexHash = Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
    const part2 = Math.floor(1000 + Math.random() * 9000);
    setHwidInput(`HWID-${hexHash.slice(0, 4)}-${hexHash.slice(4, 8)}-${part2}`);
  };

  const handleSaveHwid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hwidInput.trim()) {
      setHwidErr('Please enter or auto-detect a valid Hardware ID.');
      return;
    }
    setHwidLoading(true);
    setHwidErr('');
    setHwidSuccess('');
    try {
      await api.setUserHwid(hwidInput);
      await refreshUser();
      fetchUserData();
      setHwidSuccess('Hardware ID set and locked to your account successfully!');
    } catch (err: any) {
      setHwidErr(err.message || 'Failed to save HWID');
    } finally {
      setHwidLoading(false);
    }
  };

  const handleDashboardRedeemKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dashboardRedeemCode.trim()) {
      setRedeemErr('Please enter a Redeem Key Code.');
      return;
    }
    if (!dashboardProductId) {
      setRedeemErr('Please select the target product.');
      return;
    }

    setRedeemLoading(true);
    setRedeemErr('');
    setRedeemSuccessMsg('');

    try {
      const res = await api.redeemKey(dashboardRedeemCode.trim(), dashboardProductId);
      setRedeemSuccessMsg(`Success! Activated product license for "${res.license.productName}".`);
      setDashboardRedeemCode('');
      fetchUserData();
    } catch (e: any) {
      setRedeemErr(e.message || 'Failed to redeem key.');
    } finally {
      setRedeemLoading(false);
    }
  };

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const [l, o, t, d, nData, tuts, prods, mreqs] = await Promise.all([
        api.getUserLicenses(),
        api.getUserOrders(),
        api.getTickets(),
        api.getDownloads(),
        api.getNotifications(),
        api.getTutorials(),
        api.getProducts(),
        api.getUserManualSetupRequests(),
      ]);
      setLicenses(l);
      setOrders(o);
      setTickets(t);
      setDownloads(d);
      setNotifications(nData.notifications || []);
      setUnreadNotifsCount(nData.unreadCount || 0);
      setTutorials(tuts || []);
      setAllProducts(prods || []);
      setUserSetupRequests(mreqs || []);
    } catch (e) {
      console.error('Failed to load user dashboard data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenSetupModal = (license: License) => {
    setSelectedSetupLicense(license);
    const prod = allProducts.find((p) => p.id === license.productId) || null;
    setSelectedSetupProduct(prod);
    setSetupCustomAnswers({});
    setSetupUserPhone(user?.phone || '');
    setSetupHwidInput(license.currentHwid || user?.hwid || '');
    setSetupSuccessMsg('');
    setSetupErrMsg('');
    setIsSetupModalOpen(true);
  };

  const handleSubmitSetupRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSetupLicense || !selectedSetupProduct) return;
    setSetupSubmitting(true);
    setSetupErrMsg('');
    setSetupSuccessMsg('');
    try {
      await api.createManualSetupRequest({
        licenseId: selectedSetupLicense.id,
        productId: selectedSetupProduct.id,
        customAnswers: setupCustomAnswers,
        userPhone: setupUserPhone,
        hwid: setupHwidInput,
      });
      setSetupSuccessMsg('Your manual setup request has been submitted! Our admin team will process your setup shortly.');
      const reqs = await api.getUserManualSetupRequests();
      setUserSetupRequests(reqs);
    } catch (err: any) {
      setSetupErrMsg(err.message || 'Failed to submit manual setup request.');
    } finally {
      setSetupSubmitting(false);
    }
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDownloadClick = (d: DownloadRelease) => {
    const isGlobal = d.accessType === 'GLOBAL' || d.productId === 'global';
    const userHasLicense = licenses.some(
      (l) => l.productId === d.productId && l.status === 'ACTIVE'
    );
    const hasAccess = isGlobal || userHasLicense || user?.role === 'ADMIN';

    if (!hasAccess) {
      setNotifPopup({
        isOpen: true,
        type: 'warning',
        title: 'Members-Only License Required',
        message: `You do not have an active subscription license for "${d.productName}". Purchase a license key or redeem your product code to download this release.`,
        actionText: 'Browse Product Catalog',
        actionUrl: '/products',
      });
      return;
    }

    // Track download in background
    api.trackDownload(d.id);

    if (d.fileUrl) {
      setNotifPopup({
        isOpen: true,
        type: 'download',
        title: 'Downloading Software Build',
        message: `Your download for "${d.productName}" (${d.version}) is initiating now. If the download does not start automatically, click below.`,
        actionText: 'Direct File Download Link',
        actionUrl: d.fileUrl,
      });

      setTimeout(() => {
        if (d.fileUrl.startsWith('http://') || d.fileUrl.startsWith('https://')) {
          window.open(d.fileUrl, '_blank');
        } else {
          const link = document.createElement('a');
          link.href = d.fileUrl;
          link.download = '';
          link.target = '_blank';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      }, 600);
    } else {
      setNotifPopup({
        isOpen: true,
        type: 'error',
        title: 'Download Link Unconfigured',
        message: `The release download URL for "${d.productName}" has not been configured by the Admin team yet. Please submit a support ticket.`,
        actionText: 'Open Support Ticket',
        onAction: () => setActiveTab('tickets'),
      });
    }
  };

  const handleResetHwid = async (licenseId: string) => {
    try {
      await api.resetHwid(licenseId);
      setNotifPopup({
        isOpen: true,
        type: 'success',
        title: 'HWID Lock Reset',
        message: 'Your Hardware ID lock has been successfully reset! You can now activate and launch ApexBoost on your new computer.',
      });
      fetchUserData();
    } catch (e: any) {
      setNotifPopup({
        isOpen: true,
        type: 'error',
        title: 'HWID Reset Failed',
        message: e.message || 'Failed to reset Hardware ID lock.',
      });
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createTicket({
        subject: ticketSubject,
        category: ticketCategory,
        priority: ticketPriority,
        message: ticketMessage,
      });
      setIsNewTicketOpen(false);
      setTicketSubject('');
      setTicketMessage('');
      fetchUserData();
      setNotifPopup({
        isOpen: true,
        type: 'success',
        title: 'Support Ticket Opened',
        message: 'Your ticket has been submitted to the support team. You will receive notifications when an admin replies.',
      });
    } catch (e: any) {
      setNotifPopup({
        isOpen: true,
        type: 'error',
        title: 'Ticket Creation Error',
        message: e.message || 'Failed to open ticket',
      });
    }
  };

  const handleReplyTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyText.trim()) return;
    try {
      const updated = await api.replyTicket(selectedTicket.id, replyText);
      setSelectedTicket(updated);
      setReplyText('');
      fetchUserData();
    } catch (e: any) {
      setNotifPopup({
        isOpen: true,
        type: 'error',
        title: 'Reply Error',
        message: e.message || 'Failed to send reply',
      });
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg('');
    setProfileErr('');
    try {
      await api.updateProfile({
        name: profileName,
        phone: profilePhone,
        currentPassword: currentPassword || undefined,
        newPassword: newPassword || undefined,
      });
      setProfileMsg('Profile updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
    } catch (e: any) {
      setProfileErr(e.message || 'Failed to update profile');
    }
  };

  const activeLicense = licenses.find((l) => l.status === 'ACTIVE') || licenses[0];
  const currency = settings?.currencySymbol || '৳';

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 font-sans flex flex-col md:flex-row">
      {/* SIDEBAR */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 p-6 flex flex-col justify-between shrink-0 border-r border-slate-800">
        <div>
          {/* Brand */}
          <a href="/" className="flex items-center space-x-2.5 mb-8">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <span className="text-lg font-black tracking-tight text-white">
              {settings?.siteName || 'ApexBoost'}
            </span>
          </a>

          {/* User Profile Mini Badge */}
          <div className="p-3 bg-slate-800/80 border border-slate-700/80 rounded-2xl mb-6 flex items-center space-x-3">
            <img
              src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
              alt={user?.name}
              className="w-10 h-10 rounded-xl object-cover border border-slate-700"
            />
            <div className="overflow-hidden">
              <h4 className="text-xs font-bold text-white truncate">{user?.name}</h4>
              <span className="text-[10px] text-blue-400 font-semibold">{user?.email}</span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1 text-xs font-bold">
            {[
              { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
              { id: 'licenses', label: 'My Licenses', icon: Key, badge: licenses.length },
              { id: 'hwid', label: 'HWID Management', icon: Cpu },
              { id: 'notifications', label: 'Notifications & Alerts', icon: Bell, badge: unreadNotifsCount },
              { id: 'downloads', label: 'Download Center', icon: Download },
              { id: 'tutorials', label: 'Video Tutorials', icon: Video, badge: tutorials.length },
              { id: 'payments', label: 'Payment History', icon: CreditCard },
              { id: 'tickets', label: 'Support Tickets', icon: HelpCircle, badge: tickets.filter(t => t.status !== 'CLOSED').length },
              { id: 'profile', label: 'Profile Settings', icon: UserIcon },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full px-3.5 py-2.5 rounded-xl transition flex items-center justify-between ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300'}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer controls */}
        <div className="pt-6 border-t border-slate-800 space-y-2">
          <a
            href="/"
            className="w-full py-2 px-3 text-xs font-bold text-slate-400 hover:text-white flex items-center space-x-2 rounded-xl hover:bg-slate-800 transition"
          >
            <span>Back to Main Site</span>
          </a>
          <button
            onClick={logout}
            className="w-full py-2 px-3 text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 flex items-center space-x-2 rounded-xl transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        {loading ? (
          <div className="p-8 text-center text-slate-500 font-medium">Loading User Dashboard...</div>
        ) : (
          <div>
            {/* TAB: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Customer Portal</h1>
                    <p className="text-xs text-slate-500 mt-1">Manage your active software keys, HWID locks, and downloads.</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setRedeemErr('');
                        setRedeemSuccessMsg('');
                        setIsRedeemModalOpen(true);
                      }}
                      className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center space-x-1.5"
                    >
                      <Gift className="w-4 h-4" />
                      <span>Redeem Key</span>
                    </button>
                    <a
                      href="/"
                      className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition flex items-center space-x-1.5 shadow-md"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Buy New Subscription</span>
                    </a>
                  </div>
                </div>

                {/* Unread Alert Notification Banner */}
                {unreadNotifsCount > 0 && (
                  <div className="p-4 bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-2xl border border-indigo-700/50 shadow-lg flex items-center justify-between gap-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2.5 bg-indigo-500/20 text-indigo-300 rounded-xl border border-indigo-400/30 shrink-0">
                        <Bell className="w-5 h-5 text-indigo-400 animate-bounce" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-white flex items-center space-x-2">
                          <span>System Updates & Payment Alerts</span>
                          <span className="px-2 py-0.5 text-[10px] bg-rose-500 text-white font-black rounded-full">
                            {unreadNotifsCount} UNREAD
                          </span>
                        </h4>
                        <p className="text-[11px] text-indigo-200 font-medium mt-0.5">
                          {notifications.find((n) => !n.isRead)?.message || 'You have pending activations or payment status updates.'}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setActiveTab('notifications')}
                      className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow transition shrink-0"
                    >
                      View All Alerts &rarr;
                    </button>
                  </div>
                )}

                {/* Primary Active License Widget */}
                {activeLicense ? (
                  <div className="p-6 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider font-extrabold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-md">
                          Primary Active Product
                        </span>
                        <h2 className="text-xl font-bold text-white mt-2">{activeLicense.productName}</h2>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <Badge variant={activeLicense.status === 'ACTIVE' ? 'active' : 'expired'}>
                          {activeLicense.status}
                        </Badge>
                        <button
                          onClick={() => handleOpenSetupModal(activeLicense)}
                          className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl shadow-md shadow-purple-600/30 transition flex items-center space-x-1.5"
                        >
                          <Settings className="w-3.5 h-3.5" />
                          <span>Setup Product</span>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                      {/* License Key Display */}
                      <div className="space-y-1">
                        <span className="text-xs text-slate-400 font-medium">Software License Key</span>
                        <div className="flex items-center space-x-2">
                          <code className="text-sm font-mono font-bold text-blue-300 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
                            {showKeyId === activeLicense.id ? activeLicense.licenseKey : '••••-••••-••••-PRO'}
                          </code>
                          <button
                            onClick={() => setShowKeyId(showKeyId === activeLicense.id ? null : activeLicense.id)}
                            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
                          >
                            {showKeyId === activeLicense.id ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => handleCopyKey(activeLicense.licenseKey)}
                            className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                        {copiedKey === activeLicense.licenseKey && (
                          <span className="text-[10px] text-emerald-400 font-bold block mt-1">Copied to clipboard!</span>
                        )}
                      </div>

                      {/* Expiry & Maintenance */}
                      <div className="space-y-1">
                        <span className="text-xs text-slate-400 font-medium">Expiry / Maintenance</span>
                        <div className="text-xs font-bold text-slate-200">
                          Expires: {activeLicense.expiryDate === 'LIFETIME' ? 'Lifetime Access' : new Date(activeLicense.expiryDate).toLocaleDateString()}
                        </div>
                        <div className="text-[11px] text-amber-400 font-medium">
                          Next Maintenance: {new Date(activeLicense.maintenanceDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-slate-800 flex items-center justify-between">
                      <a
                        href="/downloads"
                        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center space-x-2"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download Software Installer</span>
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 bg-white border border-slate-200 rounded-2xl text-center space-y-3">
                    <Key className="w-10 h-10 text-slate-300 mx-auto" />
                    <h3 className="text-base font-bold text-slate-900">No Active Software License Found</h3>
                    <p className="text-xs text-slate-500">Purchase a license key to unlock low-latency kernel boosting.</p>
                    <a
                      href="/pricing"
                      className="inline-block px-5 py-2.5 bg-blue-600 text-white text-xs font-bold rounded-xl shadow-md"
                    >
                      Browse Products
                    </a>
                  </div>
                )}

                {/* Recent Orders Table */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-slate-900">Recent Transactions</h3>
                    <button onClick={() => setActiveTab('payments')} className="text-xs text-blue-600 font-bold hover:underline">
                      View All
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] font-bold">
                          <th className="pb-3">Order Number</th>
                          <th className="pb-3">Product</th>
                          <th className="pb-3">TrxID / Method</th>
                          <th className="pb-3">Amount</th>
                          <th className="pb-3">Status</th>
                          <th className="pb-3 text-right">Invoice</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {orders.slice(0, 5).map((o) => (
                          <tr key={o.id} className="hover:bg-slate-50">
                            <td className="py-3 font-mono font-bold text-slate-900">{o.orderNumber}</td>
                            <td className="py-3 font-semibold text-slate-800">{o.productName}</td>
                            <td className="py-3 text-slate-600">
                              <span className="font-mono font-bold text-slate-900">{o.transactionId}</span>
                              <span className="text-[10px] text-slate-400 block">{o.paymentMethod}</span>
                            </td>
                            <td className="py-3 font-extrabold text-slate-900">{currency}{o.finalAmount.toLocaleString()}</td>
                            <td className="py-3">
                              <Badge variant={o.status === 'APPROVED' ? 'active' : o.status === 'PENDING' ? 'pending' : 'rejected'}>
                                {o.status}
                              </Badge>
                            </td>
                            <td className="py-3 text-right">
                              <button
                                onClick={() => setSelectedInvoice(o)}
                                className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition"
                                title="Print Invoice"
                              >
                                <FileText className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: MY LICENSES */}
            {activeTab === 'licenses' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-black text-slate-900">My Software Licenses</h1>
                  <p className="text-xs text-slate-500 mt-1">View keys, HWID lock state, and expiration dates.</p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {licenses.map((l) => (
                    <div key={l.id} className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-sm space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                        <div>
                          <h3 className="text-base font-bold text-slate-900">{l.productName}</h3>
                          <p className="text-xs text-slate-400">Activated: {new Date(l.activationDate).toLocaleDateString()}</p>
                        </div>
                        <div className="flex flex-col items-end space-y-1.5">
                          <Badge variant={l.status === 'ACTIVE' ? 'active' : 'expired'}>{l.status}</Badge>
                          <button
                            onClick={() => handleOpenSetupModal(l)}
                            className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center space-x-1.5"
                          >
                            <Settings className="w-3.5 h-3.5" />
                            <span>Setup</span>
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div>
                          <span className="text-slate-400 block font-medium mb-1">License Key</span>
                          <div className="flex items-center space-x-2">
                            <code className="font-mono font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded border border-blue-100">
                              {showKeyId === l.id ? l.licenseKey : '••••-••••-••••-PRO'}
                            </code>
                            <button
                              onClick={() => setShowKeyId(showKeyId === l.id ? null : l.id)}
                              className="text-slate-400 hover:text-slate-600"
                            >
                              {showKeyId === l.id ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => handleCopyKey(l.licenseKey)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div>
                          <span className="text-slate-400 block font-medium mb-1">Expiry Date</span>
                          <span className="font-bold text-slate-800">
                            {l.expiryDate === 'LIFETIME' ? 'Lifetime Access' : new Date(l.expiryDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: HWID MANAGEMENT */}
            {activeTab === 'hwid' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
                      <Cpu className="w-6 h-6 text-purple-600" />
                      <span>Hardware ID (HWID) Device Lock</span>
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">
                      Configure and view your unique Hardware Fingerprint. Your HWID locks your active subscriptions to your PC.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setHwidErr('');
                      setHwidSuccess('');
                      setHwidInput(user?.hwid || '');
                      setIsHwidModalOpen(true);
                    }}
                    className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center space-x-2"
                  >
                    <Cpu className="w-4 h-4" />
                    <span>{user?.hwidLocked ? 'Open HWID Details Popup' : 'Configure HWID Popup'}</span>
                  </button>
                </div>

                {/* Primary HWID Card */}
                <div className="p-6 bg-white border border-slate-200/80 rounded-3xl shadow-sm space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-purple-100 text-purple-700 rounded-2xl">
                        <Cpu className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-900">Registered Machine Fingerprint</h3>
                        <p className="text-xs text-slate-500">System Hardware ID (HWID) Lock Status</p>
                      </div>
                    </div>
                    {user?.hwidLocked && user?.hwid ? (
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-extrabold rounded-full flex items-center space-x-1.5 border border-emerald-300">
                        <Lock className="w-3.5 h-3.5" />
                        <span>LOCKED & BOUND TO ACCOUNT</span>
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-extrabold rounded-full flex items-center space-x-1.5 border border-amber-300">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>HWID NOT SET / UNLOCKED</span>
                      </span>
                    )}
                  </div>

                  {user?.hwidLocked && user?.hwid ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-2">
                        <span className="text-[11px] text-purple-400 font-extrabold uppercase tracking-wider block">Active Hardware Key Signature</span>
                        <div className="flex items-center justify-between gap-3">
                          <code className="text-sm font-mono font-black text-white tracking-wider break-all">
                            {user.hwid}
                          </code>
                          <button
                            onClick={() => handleCopyKey(user.hwid!)}
                            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl shadow transition shrink-0 flex items-center space-x-1"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                          </button>
                        </div>
                      </div>

                      <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl text-xs space-y-2 text-purple-950">
                        <div className="font-bold flex items-center space-x-1.5 text-purple-900">
                          <Lock className="w-4 h-4 text-purple-700" />
                          <span>Strict Anti-Sharer Lock Policy</span>
                        </div>
                        <p className="text-purple-800 leading-relaxed text-[11px]">
                          Your HWID is registered and <strong>permanently locked</strong> to your specific machine. <strong>As a user, you cannot edit or change this value yourself.</strong> If you formatted your PC, changed components, or purchased a new computer, please contact Admin or submit a support ticket to request a HWID reset.
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                        <span>Status: Locked on {user.hwidSetAt ? new Date(user.hwidSetAt).toLocaleDateString() : 'Account'}</span>
                        <button
                          onClick={() => {
                            setHwidErr('');
                            setHwidSuccess('');
                            setHwidInput(user.hwid || '');
                            setIsHwidModalOpen(true);
                          }}
                          className="text-purple-600 font-bold hover:underline text-xs flex items-center space-x-1"
                        >
                          <span>View HWID Popup</span>
                          <span>&rarr;</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 space-y-2">
                        <div className="font-bold text-amber-950 flex items-center space-x-1.5">
                          <AlertCircle className="w-4 h-4 text-amber-700" />
                          <span>No Hardware ID (HWID) Configured Yet</span>
                        </div>
                        <p className="text-amber-800 leading-relaxed">
                          Your account does not have a registered HWID. Set your Hardware ID to secure your subscription key and prevent unauthorized device access. Click below to open the HWID Setup popup.
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          setHwidErr('');
                          setHwidSuccess('');
                          if (!user?.hwid) setPastedHwid('');
                          setIsHwidModalOpen(true);
                        }}
                        className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl text-xs shadow-md transition flex items-center justify-center space-x-2"
                      >
                        <Terminal className="w-4 h-4" />
                        <span>Open Popup & Set Hardware ID (HWID) Now</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB: DOWNLOADS */}
            {activeTab === 'downloads' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-black text-slate-900">Software Downloads</h1>
                  <p className="text-xs text-slate-500 mt-1">Access signed executables for your active product subscriptions and global diagnostic tools.</p>
                </div>

                {(() => {
                  const userVisibleDownloads = downloads.filter((d) => {
                    const isGlobal = d.accessType === 'GLOBAL' || d.productId === 'global';
                    const userHasLicense = licenses.some(
                      (l) => l.productId === d.productId && l.status === 'ACTIVE'
                    );
                    return isGlobal || userHasLicense || user?.role === 'ADMIN';
                  });

                  if (userVisibleDownloads.length === 0) {
                    return (
                      <div className="p-8 sm:p-12 text-center bg-white border border-slate-200/80 rounded-2xl space-y-4 shadow-xs">
                        <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mx-auto border border-purple-100">
                          <Lock className="w-7 h-7" />
                        </div>
                        <div className="max-w-md mx-auto space-y-1">
                          <h3 className="text-base font-bold text-slate-900">No Purchased Software Downloads Available</h3>
                          <p className="text-xs text-slate-500 leading-relaxed">
                            Members-only software releases are unlocked automatically when you hold an active license key for that specific product.
                          </p>
                        </div>
                        <a
                          href="/products"
                          className="inline-flex items-center space-x-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md transition"
                        >
                          <ShoppingBag className="w-4 h-4" />
                          <span>Browse Product Catalog</span>
                        </a>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-4">
                      {userVisibleDownloads.map((d) => {
                        const isGlobal = d.accessType === 'GLOBAL' || d.productId === 'global';

                        return (
                          <div
                            key={d.id}
                            className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
                          >
                            <div className="space-y-2 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="text-base font-bold text-slate-900">{d.productName}</h3>
                                <span className="text-xs font-mono font-bold text-purple-600 bg-purple-50 border border-purple-200 px-2.5 py-0.5 rounded-md">
                                  {d.version}
                                </span>

                                {isGlobal ? (
                                  <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    <Globe className="w-3 h-3" />
                                    <span>🌐 Global Release</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                                    <ShieldCheck className="w-3 h-3" />
                                    <span>🔒 Licensed Product</span>
                                  </span>
                                )}
                              </div>

                              <p className="text-xs text-slate-600 font-mono bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
                                ⚡ <strong>Changelog:</strong> {d.changelog}
                              </p>

                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                                <span>File Size: <strong className="text-slate-700 font-mono">{d.fileSize}</strong></span>
                                <span>•</span>
                                <span>Release Date: {d.releaseDate}</span>
                                <span>•</span>
                                <span>Total Downloads: {(d.downloadCount || 0).toLocaleString()}</span>
                              </div>
                            </div>

                            <button
                              onClick={() => handleDownloadClick(d)}
                              className="w-full md:w-auto px-5 py-3 text-xs font-bold rounded-xl shadow-md transition flex items-center justify-center space-x-2 shrink-0 bg-purple-600 hover:bg-purple-700 text-white shadow-purple-600/20"
                            >
                              <Download className="w-4 h-4" />
                              <span>Download Executable ({d.fileSize})</span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* TAB: VIDEO TUTORIALS */}
            {activeTab === 'tutorials' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-black text-slate-900">Video Tutorials & Activation Guides</h1>
                  <p className="text-xs text-slate-500 mt-1">
                    Watch step-by-step video guides on key redemption, HWID lock resets, bKash/Nagad payment verification, and software setup.
                  </p>
                </div>

                {tutorials.length === 0 ? (
                  <div className="p-12 text-center bg-white border border-slate-200/80 rounded-2xl space-y-3 shadow-xs">
                    <Video className="w-12 h-12 text-slate-300 mx-auto" />
                    <h3 className="text-base font-bold text-slate-900">No Video Tutorials Available</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Check back soon or contact support if you need assistance with key activation or software installation.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tutorials.map((tut) => (
                      <div key={tut.id} className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between hover:shadow-md transition">
                        <div className="p-4 space-y-3">
                          <VideoEmbed url={tut.videoUrl} title={tut.title} />

                          <div className="space-y-1.5 pt-1">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-md border border-purple-100">
                                {tut.category}
                              </span>
                              {tut.duration && (
                                <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                  ⏱️ {tut.duration}
                                </span>
                              )}
                            </div>
                            <h3 className="text-sm font-bold text-slate-900 leading-snug">{tut.title}</h3>
                            <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                              {tut.description || 'Step-by-step video guide.'}
                            </p>
                          </div>
                        </div>

                        <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                          <span className="text-[10px] font-semibold text-slate-400">
                            Platform: <strong className="text-slate-700 uppercase">{tut.platform}</strong>
                          </span>

                          <a
                            href={tut.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition flex items-center space-x-1 shadow-sm"
                          >
                            <span>Watch Video</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB: PAYMENTS */}
            {activeTab === 'payments' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-black text-slate-900">Payment & Invoices</h1>
                  <p className="text-xs text-slate-500 mt-1">Full transaction history and printable invoices.</p>
                </div>

                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] font-bold">
                        <th className="pb-3">Order Number</th>
                        <th className="pb-3">Product Name</th>
                        <th className="pb-3">TrxID / Method</th>
                        <th className="pb-3">Amount</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3 text-right">Invoice</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {orders.map((o) => (
                        <tr key={o.id} className="hover:bg-slate-50">
                          <td className="py-3 font-mono font-bold text-slate-900">{o.orderNumber}</td>
                          <td className="py-3 font-semibold text-slate-800">{o.productName}</td>
                          <td className="py-3 text-slate-600">
                            <span className="font-mono font-bold text-slate-900">{o.transactionId}</span>
                            <span className="text-[10px] text-slate-400 block">{o.paymentMethod}</span>
                          </td>
                          <td className="py-3 font-extrabold text-slate-900">{currency}{o.finalAmount.toLocaleString()}</td>
                          <td className="py-3">
                            <Badge variant={o.status === 'APPROVED' ? 'active' : o.status === 'PENDING' ? 'pending' : 'rejected'}>
                              {o.status}
                            </Badge>
                          </td>
                          <td className="py-3 text-right">
                            <button
                              onClick={() => setSelectedInvoice(o)}
                              className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition"
                            >
                              View Invoice
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB: TICKETS */}
            {activeTab === 'tickets' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-black text-slate-900">Support Portal</h1>
                    <p className="text-xs text-slate-500 mt-1">Open support tickets for HWID resets or payment assistance.</p>
                  </div>
                  <button
                    onClick={() => setIsNewTicketOpen(true)}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center space-x-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Open New Ticket</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Ticket Queue */}
                  <div className="lg:col-span-5 space-y-3">
                    {tickets.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setSelectedTicket(t)}
                        className={`w-full p-4 rounded-2xl border text-left transition space-y-2 ${
                          selectedTicket?.id === t.id
                            ? 'bg-blue-50/80 border-blue-500 shadow-sm'
                            : 'bg-white border-slate-200/80 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[11px] font-bold text-blue-600">{t.ticketNumber}</span>
                          <Badge variant={t.status === 'RESOLVED' ? 'active' : 'pending'}>{t.status}</Badge>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 truncate">{t.subject}</h4>
                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span>Category: {t.category}</span>
                          <span>{new Date(t.createdAt).toLocaleDateString()}</span>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Ticket Thread Detail */}
                  <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between min-h-[400px]">
                    {selectedTicket ? (
                      <div className="flex flex-col h-full justify-between space-y-4">
                        <div>
                          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div>
                              <span className="text-[10px] font-mono text-slate-400 font-bold">{selectedTicket.ticketNumber}</span>
                              <h3 className="text-sm font-bold text-slate-900">{selectedTicket.subject}</h3>
                            </div>
                            <Badge variant={selectedTicket.status === 'RESOLVED' ? 'active' : 'pending'}>
                              {selectedTicket.status}
                            </Badge>
                          </div>

                          <div className="py-4 space-y-3 max-h-[300px] overflow-y-auto">
                            {selectedTicket.messages.map((m) => (
                              <div
                                key={m.id}
                                className={`p-3 rounded-xl text-xs space-y-1 max-w-[85%] ${
                                  m.senderRole === 'ADMIN'
                                    ? 'bg-purple-50 border border-purple-100 text-purple-900 ml-auto'
                                    : 'bg-slate-50 border border-slate-100 text-slate-800'
                                }`}
                              >
                                <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                                  <span>{m.senderName} ({m.senderRole})</span>
                                  <span>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <p className="leading-relaxed">{m.message}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        <form onSubmit={handleReplyTicket} className="pt-3 border-t border-slate-100 flex items-center space-x-2">
                          <input
                            type="text"
                            placeholder="Type a reply message..."
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            className="flex-1 px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
                          />
                          <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-md flex items-center space-x-1"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Reply</span>
                          </button>
                        </form>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-center my-auto text-slate-400 text-xs">
                        <MessageSquare className="w-8 h-8 mb-2" />
                        <span>Select a support ticket from the list to view chat thread.</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: PROFILE */}
            {activeTab === 'profile' && (
              <div className="space-y-6 max-w-2xl">
                <div>
                  <h1 className="text-2xl font-black text-slate-900">Profile & Security</h1>
                  <p className="text-xs text-slate-500 mt-1">Update personal details and change your account password.</p>
                </div>

                <form onSubmit={handleUpdateProfile} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">Personal Information</h3>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number (For payment matching)</label>
                    <input
                      type="text"
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 pt-4 pb-2 border-b border-slate-100">Change Password</h3>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Current Password</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">New Password</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {profileMsg && <p className="text-xs text-emerald-600 font-semibold">{profileMsg}</p>}
                  {profileErr && <p className="text-xs text-rose-600 font-semibold">{profileErr}</p>}

                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-md transition"
                  >
                    Save Changes
                  </button>
                </form>
              </div>
            )}

            {/* TAB: NOTIFICATIONS & ALERTS */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
                      <Bell className="w-6 h-6 text-indigo-600" />
                      <span>Notifications & Security Logs</span>
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">
                      Persistent real-time alerts for license activations, manual payment verifications, and account security.
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    {unreadNotifsCount > 0 && (
                      <button
                        onClick={async () => {
                          await api.markAllNotificationsRead();
                          fetchUserData();
                        }}
                        className="px-3.5 py-2 bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 text-xs font-bold rounded-xl transition flex items-center space-x-1.5 shadow-sm"
                      >
                        <CheckCheck className="w-4 h-4" />
                        <span>Mark All Read ({unreadNotifsCount})</span>
                      </button>
                    )}
                    <button
                      onClick={fetchUserData}
                      className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center space-x-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Refresh Feed</span>
                    </button>
                  </div>
                </div>

                {/* Notifications Cards List */}
                <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
                  {notifications.length === 0 ? (
                    <div className="py-16 text-center">
                      <Bell className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                      <h3 className="text-sm font-bold text-slate-800">No Notifications Logged</h3>
                      <p className="text-xs text-slate-400 mt-1">All clear! Updates regarding payments and license keys will appear here.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {notifications.map((n) => {
                        const isLicense = n.type === 'LICENSE_ACTIVATED';
                        const isPayment = n.type === 'PAYMENT_STATUS';

                        return (
                          <div
                            key={n.id}
                            className={`p-5 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                              !n.isRead ? 'bg-indigo-50/40' : 'hover:bg-slate-50/80'
                            }`}
                          >
                            <div className="flex items-start space-x-4">
                              <div
                                className={`p-3 rounded-2xl border shrink-0 mt-0.5 ${
                                  isLicense
                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                                    : isPayment
                                    ? 'bg-blue-50 border-blue-200 text-blue-600'
                                    : 'bg-amber-50 border-amber-200 text-amber-600'
                                }`}
                              >
                                {isLicense ? (
                                  <Key className="w-5 h-5" />
                                ) : isPayment ? (
                                  <CreditCard className="w-5 h-5" />
                                ) : (
                                  <ShieldAlert className="w-5 h-5" />
                                )}
                              </div>

                              <div>
                                <div className="flex items-center space-x-2">
                                  <h3 className={`text-sm ${!n.isRead ? 'font-black text-slate-900' : 'font-bold text-slate-700'}`}>
                                    {n.title}
                                  </h3>
                                  {!n.isRead && (
                                    <span className="px-2 py-0.5 text-[10px] font-extrabold bg-indigo-600 text-white rounded-full">
                                      NEW
                                    </span>
                                  )}
                                  <span className="text-[10px] uppercase font-bold text-slate-400 px-2 py-0.5 bg-slate-100 rounded">
                                    {n.type.replace('_', ' ')}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-600 mt-1 font-medium leading-relaxed">{n.message}</p>
                                <span className="text-[10px] text-slate-400 font-semibold mt-2 block">
                                  {new Date(n.createdAt).toLocaleString()}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                              {!n.isRead && (
                                <button
                                  onClick={async () => {
                                    await api.markNotificationRead(n.id);
                                    fetchUserData();
                                  }}
                                  className="px-3 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition"
                                >
                                  Mark Read
                                </button>
                              )}
                              <button
                                onClick={async () => {
                                  await api.deleteNotification(n.id);
                                  fetchUserData();
                                }}
                                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                title="Delete Notification"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modal: Create Ticket */}
      <Modal isOpen={isNewTicketOpen} onClose={() => setIsNewTicketOpen(false)} title="Open Support Ticket">
        <form onSubmit={handleCreateTicket} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
            <select
              value={ticketCategory}
              onChange={(e) => setTicketCategory(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
            >
              <option value="License Issue">License Key Issue</option>
              <option value="Payment Verification">bKash / Nagad Payment Verification</option>
              <option value="HWID Reset">HWID Lock Reset Request</option>
              <option value="Software Bug">Software Bug / Crash Report</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
            <input
              type="text"
              required
              placeholder="Brief topic..."
              value={ticketSubject}
              onChange={(e) => setTicketSubject(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Message Details</label>
            <textarea
              rows={4}
              required
              placeholder="Describe your issue in detail..."
              value={ticketMessage}
              onChange={(e) => setTicketMessage(e.target.value)}
              className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-md"
          >
            Submit Ticket
          </button>
        </form>
      </Modal>

      {/* Modal: Printable Invoice */}
      <Modal isOpen={!!selectedInvoice} onClose={() => setSelectedInvoice(null)} title="Official SaaS Invoice">
        {selectedInvoice && (
          <div className="space-y-6 text-xs text-slate-700">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div>
                <h2 className="text-xl font-black text-slate-900">{settings?.siteName || 'ApexBoost'}</h2>
                <p className="text-[10px] text-slate-400">Official Software Invoice</p>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-slate-900 block">{selectedInvoice.orderNumber}</span>
                <span className="text-[10px] text-slate-400">{new Date(selectedInvoice.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div>
                <strong className="block font-bold text-slate-900">Billed To:</strong>
                <p>{selectedInvoice.userName}</p>
                <p className="text-slate-500">{selectedInvoice.userEmail}</p>
              </div>
              <div>
                <strong className="block font-bold text-slate-900">Payment Details:</strong>
                <p>Method: {selectedInvoice.paymentMethod}</p>
                <p className="font-mono text-slate-500">TrxID: {selectedInvoice.transactionId}</p>
              </div>
            </div>

            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 text-[10px] uppercase font-bold">
                  <th className="py-2">Item Description</th>
                  <th className="py-2 text-right">Price</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-100 font-semibold">
                  <td className="py-2.5">{selectedInvoice.productName}</td>
                  <td className="py-2.5 text-right">{currency}{selectedInvoice.amount.toLocaleString()}</td>
                </tr>
                {selectedInvoice.discountAmount > 0 && (
                  <tr className="text-emerald-600 border-b border-slate-100">
                    <td className="py-2.5">Promo Discount ({selectedInvoice.couponCode})</td>
                    <td className="py-2.5 text-right">-{currency}{selectedInvoice.discountAmount.toLocaleString()}</td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="flex justify-between items-center pt-2 text-sm font-black text-slate-900">
              <span>Total Paid Amount:</span>
              <span className="text-base text-blue-600">{currency}{selectedInvoice.finalAmount.toLocaleString()}</span>
            </div>

            <button
              onClick={() => window.print()}
              className="w-full py-2.5 bg-slate-900 text-white font-bold rounded-xl transition"
            >
              Print / Save PDF
            </button>
          </div>
        )}
      </Modal>

      {/* Modal: Redeem Key Activation */}
      <Modal
        isOpen={isRedeemModalOpen}
        onClose={() => setIsRedeemModalOpen(false)}
        title="Redeem Product License Key"
      >
        <form onSubmit={handleDashboardRedeemKey} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Select Target Product</label>
            <select
              value={dashboardProductId}
              onChange={(e) => setDashboardProductId(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {allProducts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.durationText || `${p.durationValue} ${p.durationUnit}`})
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400 mt-1">
              Note: Redeem keys are product-specific. Select the exact product this key was created for.
            </p>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Redeem Key Code</label>
            <input
              type="text"
              required
              placeholder="e.g. DUDE-882A-990B"
              value={dashboardRedeemCode}
              onChange={(e) => setDashboardRedeemCode(e.target.value.toUpperCase())}
              className="w-full px-4 py-2.5 text-sm font-mono font-bold uppercase bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {redeemErr && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{redeemErr}</span>
            </div>
          )}

          {redeemSuccessMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center space-x-2 font-bold">
              <Check className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{redeemSuccessMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={redeemLoading}
            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition disabled:opacity-50"
          >
            {redeemLoading ? 'Activating Key...' : 'Activate & Add to My Subscriptions'}
          </button>
        </form>
      </Modal>

      {/* Modal: HWID Management & Setup */}
      <Modal
        isOpen={isHwidModalOpen}
        onClose={() => setIsHwidModalOpen(false)}
        title="Hardware ID (HWID) Device Configuration"
      >
        <div className="space-y-4 text-xs">
          {hwidSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl font-bold flex items-center space-x-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{hwidSuccess}</span>
            </div>
          )}

          {hwidErr && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl font-bold flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{hwidErr}</span>
            </div>
          )}

          {user?.hwidLocked && user?.hwid ? (
            <div className="space-y-4">
              <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">Locked Hardware Signature</span>
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded-full flex items-center space-x-1 border border-emerald-500/30">
                    <Lock className="w-3 h-3" />
                    <span>LOCKED</span>
                  </span>
                </div>
                <code className="text-sm font-mono font-black text-white block py-1 break-all">
                  {user.hwid}
                </code>
              </div>

              <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-950 rounded-2xl space-y-1.5">
                <h4 className="font-bold flex items-center space-x-1.5 text-rose-900">
                  <Lock className="w-4 h-4 text-rose-700 shrink-0" />
                  <span>HWID Locked — No User Modification Allowed</span>
                </h4>
                <p className="text-[11px] text-rose-800 leading-relaxed">
                  Your Hardware ID is bound and locked to your account. <strong>Users cannot change or edit their HWID once set.</strong> If Admin resets your HWID lock, this modal will unlock automatically so you can set a new device signature.
                </p>
              </div>

              <div className="flex items-center justify-between text-slate-500 text-[11px]">
                <span>Set Date: {user.hwidSetAt ? new Date(user.hwidSetAt).toLocaleString() : 'Active'}</span>
                <button
                  type="button"
                  onClick={() => handleCopyKey(user.hwid!)}
                  className="text-purple-600 font-bold hover:underline flex items-center space-x-1"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copy Key</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setIsHwidModalOpen(false)}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition"
              >
                Close Popup
              </button>
            </div>
          ) : (
            <form onSubmit={handleSaveHwid} className="space-y-4">
              <div className="p-3 bg-purple-50 border border-purple-200 text-purple-900 rounded-xl text-[11px] leading-relaxed">
                ℹ️ Enter your machine Hardware ID (HWID) below or click <strong>Detect My HWID</strong> to run the Windows PowerShell command to auto-detect your exact PC signature.
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block font-bold text-slate-700">Hardware ID (HWID)</label>
                  <button
                    type="button"
                    onClick={() => {
                      setPastedHwid('');
                      setIsDetectModalOpen(true);
                    }}
                    className="text-[11px] font-bold text-purple-700 hover:text-purple-800 flex items-center space-x-1 px-2.5 py-1 bg-purple-100 hover:bg-purple-200 border border-purple-300/80 rounded-lg shadow-xs transition"
                  >
                    <Terminal className="w-3.5 h-3.5 text-purple-700" />
                    <span>Detect My HWID</span>
                  </button>
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. S-1-5-21-382910291-..."
                  value={hwidInput}
                  onChange={(e) => setHwidInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50 font-mono text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-[11px] leading-relaxed font-medium">
                ⚠️ <strong>Important Security Notice:</strong> Once saved, your HWID will be <strong>permanently locked</strong> to your account. You will NOT be able to change it yourself. Admin must reset it if you change PCs.
              </div>

              <button
                type="submit"
                disabled={hwidLoading}
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <Lock className="w-4 h-4" />
                <span>{hwidLoading ? 'Saving & Locking...' : 'Save & Lock Hardware ID'}</span>
              </button>
            </form>
          )}
        </div>
      </Modal>

      {/* Modal: Detect My HWID Popup */}
      <Modal
        isOpen={isDetectModalOpen}
        onClose={() => setIsDetectModalOpen(false)}
        title="Detect Machine HWID (Windows PowerShell)"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-purple-50 border border-purple-200 text-purple-950 rounded-xl space-y-1">
            <div className="font-bold flex items-center space-x-1.5 text-purple-900">
              <Terminal className="w-4 h-4 text-purple-700" />
              <span>Get Windows Machine Hardware SID</span>
            </div>
            <p className="text-[11px] text-purple-800 leading-relaxed">
              Run the PowerShell script below on your Windows PC to fetch your exact machine SID/HWID. It will automatically copy the SID to your clipboard and open Notepad containing your SID.
            </p>
          </div>

          {/* Code Box */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700 text-[11px]">PowerShell Command:</span>
              <button
                type="button"
                onClick={handleCopyPowershellCmd}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition flex items-center space-x-1 ${
                  psCopied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-purple-600 hover:bg-purple-700 text-white shadow-xs'
                }`}
              >
                {psCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Command Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy PowerShell Command</span>
                  </>
                )}
              </button>
            </div>
            <div className="p-3 bg-slate-950 text-emerald-400 font-mono text-[10px] font-bold rounded-xl border border-slate-800 break-all select-all leading-relaxed shadow-inner">
              {POWERSHELL_HWID_CMD}
            </div>
          </div>

          {/* Step Guide */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-slate-700">
            <span className="font-bold text-slate-900 block border-b border-slate-200 pb-1">Quick Steps:</span>
            <ol className="list-decimal list-inside space-y-1 text-[11px] leading-relaxed">
              <li>Click <strong>Copy PowerShell Command</strong> above.</li>
              <li>Press <strong>Win + R</strong> on your keyboard, paste the command, and hit <strong>Enter</strong>.</li>
              <li>Your Windows SID will open in Notepad and copy to clipboard automatically.</li>
              <li>Paste your copied SID below and click <strong>Use This HWID</strong>.</li>
            </ol>
          </div>

          {/* Paste Input */}
          <div className="space-y-1.5">
            <label className="block font-bold text-slate-700">Paste Your Copied HWID / SID Below:</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. S-1-5-21-382910291-..."
                value={pastedHwid}
                onChange={(e) => setPastedHwid(e.target.value)}
                className="flex-1 px-3 py-2 border border-slate-200 rounded-xl bg-white font-mono text-xs font-bold text-slate-900 focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => handleApplyDetectedHwid(pastedHwid)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-xs transition shrink-0"
              >
                Use This HWID
              </button>
            </div>
          </div>

          {/* Fallback */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Not on Windows or having issues?</span>
            <button
              type="button"
              onClick={() => {
                handleAutoDetectHwid();
                setIsDetectModalOpen(false);
              }}
              className="text-purple-600 font-bold hover:underline flex items-center space-x-1"
            >
              <Sparkles className="w-3 h-3" />
              <span>Use Browser Fingerprint Instead</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal: Product Setup & Configuration */}
      <Modal
        isOpen={isSetupModalOpen}
        onClose={() => setIsSetupModalOpen(false)}
        title={`Product Setup — ${selectedSetupLicense?.productName || 'Software Setup'}`}
      >
        <div className="space-y-6 text-xs text-slate-700">
          {/* Header Summary */}
          <div className="bg-slate-900 text-white p-4 rounded-2xl space-y-2 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-lg border border-purple-500/20">
                Key: {selectedSetupLicense?.licenseKey}
              </span>
              <Badge variant={selectedSetupLicense?.status === 'ACTIVE' ? 'active' : 'expired'}>
                {selectedSetupLicense?.status || 'ACTIVE'}
              </Badge>
            </div>
            <div className="text-[11px] text-slate-300">
              Account Email: <span className="text-white font-bold">{user?.email}</span>
            </div>
          </div>

          {/* Assigned Video Tutorial(s) */}
          {(selectedSetupProduct?.tutorialVideoUrl || tutorials.filter(t => t.productId === selectedSetupProduct?.id || t.isGlobal).length > 0) && (
            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 flex items-center space-x-1.5 text-sm">
                <Video className="w-4 h-4 text-purple-600" />
                <span>Product Setup Tutorial Video</span>
              </h4>
              {selectedSetupProduct?.tutorialVideoUrl ? (
                <div className="rounded-xl overflow-hidden border border-slate-200 bg-black">
                  <VideoEmbed videoUrl={selectedSetupProduct.tutorialVideoUrl} title={`${selectedSetupProduct.name} Setup Tutorial`} />
                </div>
              ) : (
                <div className="space-y-2">
                  {tutorials
                    .filter(t => t.productId === selectedSetupProduct?.id || t.isGlobal)
                    .map(tut => (
                      <div key={tut.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                        <div className="font-bold text-slate-900">{tut.title}</div>
                        <VideoEmbed videoUrl={tut.videoUrl} title={tut.title} />
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* External Setup Link Button (If Configured) */}
          {selectedSetupProduct?.setupExternalLink && (
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <h4 className="font-bold text-purple-950">External Setup Portal Available</h4>
                <p className="text-[11px] text-purple-700">Click below to access external setup tools or Telegram setup bot.</p>
              </div>
              <a
                href={selectedSetupProduct.setupExternalLink}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-md transition flex items-center space-x-1.5 shrink-0"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>{selectedSetupProduct.setupExternalLinkLabel || 'Open External Setup Link'}</span>
              </a>
            </div>
          )}

          {/* Existing Setup Request Status (If any) */}
          {userSetupRequests.filter(r => r.licenseId === selectedSetupLicense?.id).length > 0 && (
            <div className="space-y-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
              <h4 className="font-bold text-slate-900 flex items-center space-x-2">
                <Clock className="w-4 h-4 text-purple-600" />
                <span>Your Manual Setup Request Status</span>
              </h4>
              {userSetupRequests
                .filter(r => r.licenseId === selectedSetupLicense?.id)
                .map(req => (
                  <div key={req.id} className="p-3 bg-white border border-slate-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-purple-600 text-xs">{req.requestNumber}</span>
                      <Badge variant={req.status === 'COMPLETED' ? 'active' : req.status === 'PENDING' ? 'pending' : 'rejected'}>
                        {req.status}
                      </Badge>
                    </div>
                    {req.adminNote && (
                      <div className="p-2.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg text-[11px]">
                        <strong>Admin Note:</strong> {req.adminNote}
                      </div>
                    )}
                    <div className="text-[10px] text-slate-400">
                      Submitted: {new Date(req.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))}
            </div>
          )}

          {/* Form: Manual Setup Inputs */}
          <form onSubmit={handleSubmitSetupRequest} className="space-y-4 pt-2 border-t border-slate-100">
            <h4 className="font-bold text-slate-900 text-sm flex items-center space-x-1.5">
              <Wrench className="w-4 h-4 text-purple-600" />
              <span>
                {selectedSetupProduct?.manualSetupRequired
                  ? 'Submit Requirements for Manual Setup'
                  : 'Product Configuration Details'}
              </span>
            </h4>

            {setupErrMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 font-bold rounded-xl text-xs">
                {setupErrMsg}
              </div>
            )}

            {setupSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold rounded-xl text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{setupSuccessMsg}</span>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Account Email</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-3 py-2 border rounded-xl bg-slate-100 text-slate-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Hardware ID (HWID / SID)</label>
                <input
                  type="text"
                  placeholder="e.g. S-1-5-21-382910291-..."
                  value={setupHwidInput}
                  onChange={(e) => setSetupHwidInput(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl bg-slate-50 font-mono text-xs font-bold text-slate-900 border-purple-200 focus:ring-2 focus:ring-purple-500/20"
                />
                {(selectedSetupLicense?.currentHwid || user?.hwid) && (
                  <p className="text-[11px] text-purple-600 font-semibold mt-1 flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Auto-synced from account HWID/SID: {setupHwidInput || selectedSetupLicense?.currentHwid || user?.hwid}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Phone Number (For Setup Notifications)</label>
                <input
                  type="tel"
                  placeholder="e.g. +8801700000000"
                  value={setupUserPhone}
                  onChange={(e) => setSetupUserPhone(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl bg-slate-50 font-medium"
                />
              </div>

              {/* Dynamic Custom Fields Configured by Admin */}
              {selectedSetupProduct?.setupCustomFields?.map((field) => (
                <div key={field.id}>
                  <label className="block font-bold text-slate-700 mb-1">
                    {field.label} {field.required && <span className="text-rose-500">*</span>}
                  </label>
                  <input
                    type="text"
                    required={field.required}
                    placeholder={field.placeholder || ''}
                    value={setupCustomAnswers[field.label] || ''}
                    onChange={(e) =>
                      setSetupCustomAnswers({
                        ...setupCustomAnswers,
                        [field.label]: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-xl bg-slate-50 font-medium"
                  />
                </div>
              ))}
            </div>

            <button
              type="submit"
              disabled={setupSubmitting}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center space-x-2"
            >
              {setupSubmitting ? (
                <span>Sending Request...</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send Setup Request</span>
                </>
              )}
            </button>
          </form>
        </div>
      </Modal>

      {/* Global Notification Popup */}
      <NotificationModal
        {...notifPopup}
        onClose={() => setNotifPopup((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};
