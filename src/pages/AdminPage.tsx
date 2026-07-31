import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.js';
import {
  Product,
  Order,
  License,
  User,
  SupportTicket,
  DownloadRelease,
  Announcement,
  Coupon,
  SiteSettings,
  AuditLog,
  Category,
  RedeemKey,
  Tutorial,
  ManualSetupRequest,
  ManualSetupStatus
} from '../types/index.js';
import { Badge } from '../components/common/Badge.tsx';
import { Modal } from '../components/common/Modal.tsx';
import { VideoEmbed } from '../components/common/VideoEmbed.tsx';
import {
  Zap,
  LayoutDashboard,
  Package,
  Layers,
  Key,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  Download,
  HelpCircle,
  Tag,
  Bell,
  Settings,
  Plus,
  Video,
  Play,
  Film,
  Edit,
  Trash,
  Copy,
  RefreshCw,
  Search,
  ShieldAlert,
  Send,
  FileText,
  DollarSign,
  TrendingUp,
  ExternalLink,
  Trash2,
  Activity,
  Lock,
  Database,
  UserCheck,
  UserX,
  MessageSquare,
  AlertCircle,
  Gift,
  Check,
  Wrench,
  Sliders,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export const AdminPage: React.FC = () => {
  const { user, isAdmin, logout, settings, refreshSettings, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<
    'overview' | 'products' | 'categories' | 'licenses' | 'redeemKeys' | 'payments' | 'users' | 'downloads' | 'tutorials' | 'manualSetup' | 'tickets' | 'coupons' | 'announcements' | 'settings' | 'logs'
  >('overview');

  // State collections
  const [stats, setStats] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [licenses, setLicenses] = useState<License[]>([]);
  const [redeemKeys, setRedeemKeys] = useState<RedeemKey[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [downloads, setDownloads] = useState<DownloadRelease[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [manualSetupRequests, setManualSetupRequests] = useState<ManualSetupRequest[]>([]);
  const [mreqFilter, setMreqFilter] = useState<'ALL' | 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED'>('PENDING');
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Redeem Key Generator Form State
  const [rdmProductId, setRdmProductId] = useState('');
  const [rdmAssignedLicenseKey, setRdmAssignedLicenseKey] = useState('');
  const [rdmCode, setRdmCode] = useState('');
  const [rdmMaxUses, setRdmMaxUses] = useState(1);
  const [rdmValidityDays, setRdmValidityDays] = useState(30);
  const [copiedRdmCode, setCopiedRdmCode] = useState<string | null>(null);
  const [rdmError, setRdmError] = useState('');

  // Search filters
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');

  // Modals
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isSetupAccordionOpen, setIsSetupAccordionOpen] = useState(false);
  const [isMaintenanceAccordionOpen, setIsMaintenanceAccordionOpen] = useState(false);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);

  const [isGenLicenseModalOpen, setIsGenLicenseModalOpen] = useState(false);
  const [genUserEmail, setGenUserEmail] = useState('');
  const [genProductId, setGenProductId] = useState('');
  const [genDurationDays, setGenDurationDays] = useState(30);
  const [genCustomKey, setGenCustomKey] = useState('');
  const [genNotes, setGenNotes] = useState('');

  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [dlProductId, setDlProductId] = useState('');
  const [dlAccessType, setDlAccessType] = useState<'GLOBAL' | 'MEMBERS_ONLY'>('MEMBERS_ONLY');
  const [dlCustomName, setDlCustomName] = useState('');
  const [dlVersion, setDlVersion] = useState('v1.0.0');
  const [dlFileSize, setDlFileSize] = useState('25 MB');
  const [dlUrl, setDlUrl] = useState('https://example.com/download/installer.exe');
  const [dlChangelog, setDlChangelog] = useState('Feature and performance updates');

  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  const [ancTitle, setAncTitle] = useState('');
  const [ancContent, setAncContent] = useState('');
  const [ancLinkUrl, setAncLinkUrl] = useState('');

  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [cpnCode, setCpnCode] = useState('');
  const [cpnDiscount, setCpnDiscount] = useState(20);
  const [cpnMaxUses, setCpnMaxUses] = useState(100);

  // Tutorial Modal State
  const [isTutorialModalOpen, setIsTutorialModalOpen] = useState(false);
  const [editingTutorialId, setEditingTutorialId] = useState<string | null>(null);
  const [tutTitle, setTutTitle] = useState('');
  const [tutDescription, setTutDescription] = useState('');
  const [tutVideoUrl, setTutVideoUrl] = useState('');
  const [tutCategory, setTutCategory] = useState('General Guide');
  const [tutPlatform, setTutPlatform] = useState<'YOUTUBE' | 'FACEBOOK' | 'VIMEO' | 'TIKTOK' | 'OTHER' | 'AUTO'>('AUTO');
  const [tutDuration, setTutDuration] = useState('');

  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [adminReplyText, setAdminReplyText] = useState('');

  // Settings Form State
  const [settingsForm, setSettingsForm] = useState<Partial<SiteSettings>>({});

  // Modal: Payment Approval
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [paymentActionType, setPaymentActionType] = useState<'APPROVED' | 'REJECTED' | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [customLicenseKey, setCustomLicenseKey] = useState('');

  useEffect(() => {
    if (authLoading) return; // Wait for session load
    if (!isAdmin) {
      window.location.href = '/login';
      return;
    }
    loadAdminData();
    if (settings) {
      setSettingsForm(settings);
    }
  }, [isAdmin, authLoading, settings]);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [s, p, l, o, u, d, t, a, lg, c, cats, rdm, tuts, mreqs] = await Promise.all([
        api.getAdminStats(),
        api.getProducts(true),
        api.getAllLicenses(),
        api.getAllOrders(),
        api.getAdminUsers(),
        api.getDownloads(),
        api.getTickets(),
        api.getAnnouncements(),
        api.getAdminLogs(),
        api.getCoupons(),
        api.getCategories(),
        api.getRedeemKeys(),
        api.getTutorials(),
        api.getAdminManualSetupRequests(),
      ]);

      setStats(s);
      setProducts(p);
      setLicenses(l);
      setOrders(o);
      setUsersList(u);
      setDownloads(d);
      setTickets(t);
      setAnnouncements(a);
      setLogs(lg);
      setCoupons(c);
      setCategories(cats);
      setRedeemKeys(rdm);
      setTutorials(tuts);
      setManualSetupRequests(mreqs || []);

      if (p.length > 0 && !rdmProductId) {
        setRdmProductId(p[0].id);
      }
    } catch (e) {
      console.error('Failed to load admin dataset:', e);
    } finally {
      setLoading(false);
    }
  };

  // Redeem Key Handlers
  const handleGenerateRedeemKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rdmProductId) {
      setRdmError('Please select a target product.');
      return;
    }
    setRdmError('');
    try {
      const uses = Number(rdmMaxUses);
      await api.createRedeemKey({
        productId: rdmProductId,
        assignedLicenseKey: uses === 1 ? (rdmAssignedLicenseKey.trim() || undefined) : undefined,
        code: rdmCode.trim() || undefined,
        maxUses: uses,
        validityDays: Number(rdmValidityDays),
      });
      setRdmCode('');
      setRdmAssignedLicenseKey('');
      loadAdminData();
    } catch (err: any) {
      setRdmError(err.message || 'Failed to generate redeem key');
    }
  };

  const handleDeleteRedeemKey = async (id: string) => {
    if (!confirm('Are you sure you want to delete this redeem key?')) return;
    try {
      await api.deleteRedeemKey(id);
      loadAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete key');
    }
  };

  const handleCopyRedeemCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedRdmCode(code);
    setTimeout(() => setCopiedRdmCode(null), 2000);
  };

  // Category CRUD
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;

    try {
      if (editingCategory.id) {
        await api.updateCategory(editingCategory.id, editingCategory);
      } else {
        await api.createCategory(editingCategory);
      }
      setIsCategoryModalOpen(false);
      setEditingCategory(null);
      loadAdminData();
    } catch (e: any) {
      alert(e.message || 'Category save failed');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category? Products in this category will not be deleted.')) return;
    try {
      await api.deleteCategory(id);
      loadAdminData();
    } catch (e: any) {
      alert(e.message || 'Delete failed');
    }
  };

  // Product CRUD
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    try {
      if (editingProduct.id) {
        await api.updateProduct(editingProduct.id, editingProduct);
      } else {
        await api.createProduct(editingProduct);
      }
      setIsProductModalOpen(false);
      setEditingProduct(null);
      loadAdminData();
    } catch (e: any) {
      alert(e.message || 'Product save failed');
    }
  };

  const handleCloneProduct = async (id: string) => {
    try {
      await api.cloneProduct(id);
      loadAdminData();
    } catch (e: any) {
      alert(e.message || 'Clone failed');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.deleteProduct(id);
      loadAdminData();
    } catch (e: any) {
      alert(e.message || 'Delete failed');
    }
  };

  // Payment Verification
  const handleUpdateOrderStatus = async () => {
    if (!selectedOrder || !paymentActionType) return;
    try {
      await api.updateOrderStatus(selectedOrder.id, paymentActionType, adminNote || undefined, customLicenseKey || undefined);
      setIsPaymentModalOpen(false);
      setAdminNote('');
      setCustomLicenseKey('');
      setSelectedOrder(null);
      setPaymentActionType(null);
      loadAdminData();
    } catch (e: any) {
      alert(e.message || 'Failed to update order status');
    }
  };

  // License Manual Gen
  const handleGenerateLicense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!genUserEmail || !genProductId) {
      alert('Please select a target customer email and product.');
      return;
    }
    try {
      await api.createLicense({
        userEmail: genUserEmail,
        productId: genProductId,
        durationDays: genDurationDays,
        customKey: genCustomKey.trim() || undefined,
        notes: genNotes.trim() || undefined,
      });
      setIsGenLicenseModalOpen(false);
      setGenUserEmail('');
      setGenCustomKey('');
      setGenNotes('');
      alert('Subscription license issued successfully!');
      loadAdminData();
    } catch (e: any) {
      alert(e.message || 'Failed to generate license key');
    }
  };

  const handleResetHwidAdmin = async (licenseId: string) => {
    try {
      await api.resetHwid(licenseId);
      alert('HWID / Device lock reset successfully');
      loadAdminData();
    } catch (e: any) {
      alert(e.message || 'Reset failed');
    }
  };

  const handleUpdateLicenseKey = async (licenseId: string, newKey: string) => {
    try {
      await api.updateLicense(licenseId, { licenseKey: newKey });
      alert('License key updated successfully');
      loadAdminData();
    } catch (e: any) {
      alert(e.message || 'Failed to update license key');
    }
  };

  const handleResetUserHwid = async (userId: string, userName: string) => {
    if (!window.confirm(`Are you sure you want to reset HWID lock for ${userName}? This will unlock their account and allow them to register a new device HWID.`)) {
      return;
    }
    try {
      await api.resetUserHwid(userId);
      alert(`HWID lock reset successfully for ${userName}! User can now set a new HWID in their dashboard.`);
      loadAdminData();
    } catch (e: any) {
      alert(e.message || 'Failed to reset user HWID');
    }
  };

  // Manual Setup Request Actions
  const handleUpdateManualSetupStatus = async (id: string, status: ManualSetupStatus, note?: string) => {
    try {
      await api.updateManualSetupRequestStatus(id, status, note);
      alert(`Manual setup request marked as ${status}`);
      loadAdminData();
    } catch (e: any) {
      alert(e.message || 'Failed to update setup request status');
    }
  };

  const handleDeleteManualSetupRequest = async (id: string) => {
    if (!confirm('Are you sure you want to delete this manual setup request?')) return;
    try {
      await api.deleteManualSetupRequest(id);
      loadAdminData();
    } catch (e: any) {
      alert(e.message || 'Failed to delete setup request');
    }
  };

  // User Management
  const handleToggleUserBlock = async (id: string, currentBlocked: boolean) => {
    try {
      await api.toggleUserBlock(id, !currentBlocked);
      loadAdminData();
    } catch (e: any) {
      alert(e.message || 'User block status update failed');
    }
  };

  // Downloads Creation & Management
  const handleCreateDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const isGlobal = dlAccessType === 'GLOBAL' || dlProductId === 'global';
      const selectedProd = products.find((p) => p.id === dlProductId);
      const productName = isGlobal
        ? (dlCustomName.trim() || 'Global Software Release')
        : (selectedProd ? selectedProd.name : 'Software Release');

      await api.createDownload({
        productId: isGlobal ? 'global' : dlProductId,
        productName,
        version: dlVersion,
        fileSize: dlFileSize,
        fileUrl: dlUrl,
        changelog: dlChangelog,
        isLatest: true,
        accessType: dlAccessType,
      });
      setIsDownloadModalOpen(false);
      setDlCustomName('');
      loadAdminData();
    } catch (e: any) {
      alert(e.message || 'Failed to add download release');
    }
  };

  const handleDeleteDownload = async (id: string) => {
    if (!confirm('Are you sure you want to delete this software release?')) return;
    try {
      await api.deleteDownload(id);
      loadAdminData();
    } catch (e: any) {
      alert(e.message || 'Failed to delete release');
    }
  };

  // Ticket Reply
  const handleReplyTicketAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !adminReplyText.trim()) return;
    try {
      const updated = await api.replyTicket(selectedTicket.id, adminReplyText);
      setSelectedTicket(updated);
      setAdminReplyText('');
      loadAdminData();
    } catch (e: any) {
      alert(e.message || 'Failed to reply');
    }
  };

  const handleUpdateTicketStatusAdmin = async (ticketId: string, status: string) => {
    try {
      await api.updateTicketStatus(ticketId, status);
      if (selectedTicket && selectedTicket.id === ticketId) {
        setSelectedTicket({ ...selectedTicket, status: status as any });
      }
      loadAdminData();
    } catch (e: any) {
      alert(e.message || 'Status update failed');
    }
  };

  // Announcements
  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createAnnouncement({
        title: ancTitle,
        content: ancContent,
        type: 'BANNER',
        linkUrl: ancLinkUrl,
      });
      setIsAnnouncementModalOpen(false);
      setAncTitle('');
      setAncContent('');
      setAncLinkUrl('');
      loadAdminData();
    } catch (e: any) {
      alert(e.message || 'Announcement creation failed');
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    try {
      await api.deleteAnnouncement(id);
      loadAdminData();
    } catch (e: any) {
      alert(e.message || 'Failed to delete announcement');
    }
  };

  // Video Tutorials Management
  const handleOpenCreateTutorialModal = () => {
    setEditingTutorialId(null);
    setTutTitle('');
    setTutDescription('');
    setTutVideoUrl('');
    setTutCategory('General Guide');
    setTutPlatform('AUTO');
    setTutDuration('');
    setIsTutorialModalOpen(true);
  };

  const handleOpenEditTutorialModal = (tut: Tutorial) => {
    setEditingTutorialId(tut.id);
    setTutTitle(tut.title);
    setTutDescription(tut.description);
    setTutVideoUrl(tut.videoUrl);
    setTutCategory(tut.category);
    setTutPlatform(tut.platform);
    setTutDuration(tut.duration || '');
    setIsTutorialModalOpen(true);
  };

  const handleSyncMetadata = async () => {
    if (!tutVideoUrl) return;
    try {
      const response = await fetch('/api/video-metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: tutVideoUrl }),
      });
      const data = await response.json();
      if (data.title) setTutTitle(data.title);
      if (data.description) setTutDescription(data.description);
    } catch (e) {
      alert('Failed to fetch metadata');
    }
  };

  const handleSaveTutorial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tutTitle.trim() || !tutVideoUrl.trim()) {
      alert('Please enter a Title and Video URL link.');
      return;
    }
    try {
      if (editingTutorialId) {
        await api.updateTutorial(editingTutorialId, {
          title: tutTitle,
          description: tutDescription,
          videoUrl: tutVideoUrl,
          category: tutCategory,
          platform: tutPlatform,
          duration: tutDuration,
        });
      } else {
        await api.createTutorial({
          title: tutTitle,
          description: tutDescription,
          videoUrl: tutVideoUrl,
          category: tutCategory,
          platform: tutPlatform,
          duration: tutDuration,
        });
      }
      setIsTutorialModalOpen(false);
      loadAdminData();
    } catch (e: any) {
      alert(e.message || 'Failed to save video tutorial');
    }
  };

  const handleDeleteTutorial = async (id: string) => {
    if (!confirm('Are you sure you want to delete this video tutorial?')) return;
    try {
      await api.deleteTutorial(id);
      loadAdminData();
    } catch (e: any) {
      alert(e.message || 'Failed to delete tutorial');
    }
  };

  // Coupons
  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createCoupon({
        code: cpnCode,
        discountPercent: cpnDiscount,
        maxUses: cpnMaxUses,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      });
      setIsCouponModalOpen(false);
      setCpnCode('');
      loadAdminData();
    } catch (e: any) {
      alert(e.message || 'Failed to create coupon');
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    try {
      await api.deleteCoupon(id);
      loadAdminData();
    } catch (e: any) {
      alert(e.message || 'Failed to delete coupon');
    }
  };

  // Settings Save
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.updateSettings(settingsForm);
      await refreshSettings();
      alert('Website & Payment Settings updated successfully!');
    } catch (e: any) {
      alert(e.message || 'Failed to save settings');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center font-sans">
        <div className="flex flex-col items-center space-y-3">
          <RefreshCw className="w-8 h-8 text-purple-500 animate-spin" />
          <p className="text-xs font-bold text-slate-400">Authenticating Admin Portal...</p>
        </div>
      </div>
    );
  }

  const currency = settings?.currencySymbol || '৳';

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 font-sans flex flex-col md:flex-row">
      {/* ADMIN SIDEBAR */}
      <aside className="w-full md:w-64 bg-slate-950 text-slate-300 p-6 flex flex-col justify-between shrink-0 border-r border-slate-900">
        <div>
          <a href="/admin" className="flex items-center space-x-2.5 mb-8">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-white block leading-none">
                {settings?.siteName || 'ApexBoost'}
              </span>
              <span className="text-[9px] font-mono font-bold text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/20 uppercase">
                Admin Control
              </span>
            </div>
          </a>

          <nav className="space-y-1 text-xs font-bold">
            {[
              { id: 'overview', label: 'Analytics Overview', icon: LayoutDashboard },
              { id: 'products', label: 'Product Catalog', icon: Package, badge: products.length },
              { id: 'categories', label: 'Category Manager', icon: Layers, badge: categories.length },
              { id: 'licenses', label: 'Licenses & Subscriptions', icon: Key, badge: licenses.length },
              { id: 'redeemKeys', label: 'Redeem Key Generator', icon: Gift, badge: redeemKeys.filter((k) => k.isActive).length },
              { id: 'payments', label: 'Payment Verifier', icon: CheckCircle, badge: orders.filter((o) => o.status === 'PENDING').length },
              { id: 'users', label: 'User Directory', icon: Users, badge: usersList.length },
              { id: 'downloads', label: 'Download Releases', icon: Download },
              { id: 'tutorials', label: 'Video Tutorials', icon: Video, badge: tutorials.length },
              { id: 'manualSetup', label: 'Manual Setup Requests', icon: Wrench, badge: manualSetupRequests.filter((r) => r.status === 'PENDING').length },
              { id: 'tickets', label: 'Support Queue', icon: HelpCircle, badge: tickets.filter((t) => t.status === 'OPEN').length },
              { id: 'coupons', label: 'Promo Coupons', icon: Tag, badge: coupons.length },
              { id: 'announcements', label: 'Announcements', icon: Bell },
              { id: 'settings', label: 'Website Settings', icon: Settings },
              { id: 'logs', label: 'Audit Logs', icon: Database },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full px-3.5 py-2.5 rounded-xl transition flex items-center justify-between ${
                    isActive
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-slate-900 text-purple-300'}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="pt-6 border-t border-slate-900 space-y-2">
          <a href="/dashboard" className="w-full py-2 px-3 text-xs font-bold text-slate-400 hover:text-white block rounded-xl">
            Switch to Customer View
          </a>
          <button onClick={logout} className="w-full py-2 px-3 text-xs font-bold text-rose-400 hover:bg-rose-500/10 block text-left rounded-xl">
            Logout Admin
          </button>
        </div>
      </aside>

      {/* ADMIN MAIN CONTENT */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        {loading ? (
          <div className="p-8 text-center text-slate-500 font-medium flex items-center justify-center space-x-2">
            <RefreshCw className="w-5 h-5 animate-spin text-purple-600" />
            <span>Loading Admin Data Suite...</span>
          </div>
        ) : (
          <div>
            {/* TAB: OVERVIEW */}
            {activeTab === 'overview' && stats && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-2xl font-black text-slate-900">Admin Control Center</h1>
                  <p className="text-xs text-slate-500 mt-1">Real-time revenue metrics, pending payment verifications, and digital subscription sales.</p>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-sm">
                    <span className="text-xs font-bold text-slate-400 uppercase">Total Revenue</span>
                    <div className="text-2xl font-black text-slate-900 mt-1">{currency}{stats.totalRevenue.toLocaleString()}</div>
                    <span className="text-[10px] text-emerald-600 font-bold">↑ {stats.totalSalesCount} Completed Orders</span>
                  </div>

                  <div className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-sm">
                    <span className="text-xs font-bold text-slate-400 uppercase">Active Subscriptions</span>
                    <div className="text-2xl font-black text-slate-900 mt-1">{stats.activeLicensesCount}</div>
                    <span className="text-[10px] text-blue-600 font-bold">Active Customer Keys</span>
                  </div>

                  <div className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-sm">
                    <span className="text-xs font-bold text-slate-400 uppercase">Pending Payments</span>
                    <div className="text-2xl font-black text-amber-600 mt-1">{stats.pendingVerificationsCount}</div>
                    <span className="text-[10px] text-amber-600 font-bold">Needs bKash/Nagad Review</span>
                  </div>

                  <div className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-sm">
                    <span className="text-xs font-bold text-slate-400 uppercase">Total Users</span>
                    <div className="text-2xl font-black text-slate-900 mt-1">{stats.totalUsersCount}</div>
                    <span className="text-[10px] text-purple-600 font-bold">Registered Accounts</span>
                  </div>
                </div>

                {/* Pending Verification Banner */}
                {stats.pendingVerificationsCount > 0 && (
                  <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-800 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center space-x-3 text-xs font-bold">
                      <ShieldAlert className="w-5 h-5 text-amber-600" />
                      <span>There are {stats.pendingVerificationsCount} pending orders requiring manual TrxID verification.</span>
                    </div>
                    <button
                      onClick={() => setActiveTab('payments')}
                      className="px-4 py-1.5 bg-amber-600 text-white font-bold text-xs rounded-xl shadow-sm"
                    >
                      Verify Now
                    </button>
                  </div>
                )}

                {/* Recent Activity Table */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-slate-900">Recent Customer Orders</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] font-bold">
                          <th className="pb-3">Order Number</th>
                          <th className="pb-3">Customer</th>
                          <th className="pb-3">Item</th>
                          <th className="pb-3">Payment Method</th>
                          <th className="pb-3">Amount</th>
                          <th className="pb-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {orders.slice(0, 5).map((o) => (
                          <tr key={o.id} className="hover:bg-slate-50">
                            <td className="py-3 font-mono font-bold text-slate-900">{o.orderNumber}</td>
                            <td className="py-3">{o.userName} ({o.userEmail})</td>
                            <td className="py-3 font-semibold text-slate-800">{o.productName}</td>
                            <td className="py-3">{o.paymentMethod} • <span className="font-mono text-blue-600">{o.transactionId}</span></td>
                            <td className="py-3 font-bold">{currency}{o.finalAmount}</td>
                            <td className="py-3">
                              <Badge variant={o.status === 'APPROVED' ? 'active' : o.status === 'PENDING' ? 'pending' : 'rejected'}>
                                {o.status}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: PRODUCT CATALOG */}
            {activeTab === 'products' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-black text-slate-900">Product & Subscription Catalog</h1>
                    <p className="text-xs text-slate-500 mt-1">Manage Streaming, AI Tools, VPNs, Software Keys, and Game Boosters.</p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingProduct({
                        name: '',
                        category: 'Streaming & Entertainment',
                        subscriptionTier: 'PRO',
                        resourceType: 'ACCOUNT_CREDENTIALS',
                        price: 500,
                        salePrice: 350,
                        billingType: 'SUBSCRIPTION',
                        durationValue: 30,
                        durationUnit: 'DAYS',
                        maintenanceFee: 0,
                        maintenanceIntervalDays: 30,
                        renewPrice: 350,
                        downloadUrl: '',
                        fileSize: 'N/A',
                        version: 'v1.0.0',
                        changelog: 'Initial Release',
                        maxDevices: 1,
                        hwidLock: false,
                        autoActivation: true,
                        featured: true,
                        popular: false,
                        newBadge: true,
                        displayOrder: products.length + 1,
                        status: 'ACTIVE',
                        features: ['24/7 Service Support', 'Instant Auto-Activation'],
                      });
                      setIsProductModalOpen(true);
                    }}
                    className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center space-x-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create New Product</span>
                  </button>
                </div>

                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] font-bold">
                        <th className="pb-3">Product Name</th>
                        <th className="pb-3">Category</th>
                        <th className="pb-3">Tier & Delivery</th>
                        <th className="pb-3">Pricing</th>
                        <th className="pb-3">Duration</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {products.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50">
                          <td className="py-3 font-bold text-slate-900 flex items-center space-x-3">
                            <img src={p.image} alt={p.name} className="w-8 h-8 object-cover rounded-lg border" />
                            <div>
                              <span>{p.name}</span>
                              <span className="text-[10px] text-slate-400 block font-normal">{p.version}</span>
                            </div>
                          </td>
                          <td className="py-3 font-semibold text-slate-600">{p.category}</td>
                          <td className="py-3">
                            <div className="flex flex-col space-y-0.5">
                              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200/80 w-max">
                                {p.subscriptionTier || 'PRO'} Tier
                              </span>
                              <span className="text-[10px] font-medium text-slate-500">
                                {p.resourceType === 'ACCOUNT_CREDENTIALS' && 'Account Credentials'}
                                {p.resourceType === 'LICENSE_KEY' && 'License Key'}
                                {p.resourceType === 'INVITE_LINK' && 'Invite Link'}
                                {p.resourceType === 'INSTALLER_BUILD' && 'Installer Executable'}
                                {p.resourceType === 'API_KEY' && 'API Key'}
                                {!['ACCOUNT_CREDENTIALS', 'LICENSE_KEY', 'INVITE_LINK', 'INSTALLER_BUILD', 'API_KEY'].includes(p.resourceType as string) && (p.resourceType || 'Direct Delivery')}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 font-extrabold text-slate-900">
                            {currency}{p.salePrice || p.price}
                          </td>
                          <td className="py-3 text-slate-600">
                            {p.durationValue} {p.durationUnit.toLowerCase()}
                          </td>
                          <td className="py-3">
                            <Badge variant={p.status === 'ACTIVE' ? 'active' : 'suspended'}>{p.status}</Badge>
                          </td>
                          <td className="py-3 text-right space-x-2">
                            <button
                              onClick={() => {
                                setEditingProduct(p);
                                setIsProductModalOpen(true);
                              }}
                              className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700"
                              title="Edit Product"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleCloneProduct(p.id)}
                              className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700"
                              title="Clone Product"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id)}
                              className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg"
                              title="Delete Product"
                            >
                              <Trash className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB: CATEGORY MANAGER */}
            {activeTab === 'categories' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
                  <div>
                    <h1 className="text-2xl font-black text-slate-900">Category Manager</h1>
                    <p className="text-xs text-slate-500 mt-1">Add, edit, or remove categories for digital subscriptions, accounts, and software keys.</p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingCategory({
                        name: '',
                        slug: '',
                        description: '',
                        displayOrder: categories.length + 1,
                      });
                      setIsCategoryModalOpen(true);
                    }}
                    className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl transition shadow-md shadow-purple-500/20 flex items-center justify-center space-x-2 shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Category</span>
                  </button>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden p-6">
                  {categories.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 font-medium text-xs">
                      No categories created yet. Click "Add New Category" to create one.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {categories.map((cat) => {
                        const productCount = products.filter(
                          (p) => (p.category || '').toLowerCase() === cat.name.toLowerCase()
                        ).length;

                        return (
                          <div
                            key={cat.id}
                            className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-purple-300 hover:shadow-lg transition flex flex-col justify-between space-y-4"
                          >
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-mono text-purple-700 font-extrabold bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200/70">
                                  Order #{cat.displayOrder}
                                </span>
                                <span className="text-[10px] font-bold text-slate-600 bg-slate-200/70 px-2.5 py-1 rounded-lg">
                                  {productCount} Products
                                </span>
                              </div>
                              <h3 className="text-base font-black text-slate-900">{cat.name}</h3>
                              <p className="text-[11px] font-mono text-slate-400">slug: {cat.slug}</p>
                              {cat.description && (
                                <p className="text-xs text-slate-600 leading-relaxed pt-1">{cat.description}</p>
                              )}
                            </div>
                            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-200/60">
                              <button
                                onClick={() => {
                                  setEditingCategory(cat);
                                  setIsCategoryModalOpen(true);
                                }}
                                className="px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-lg transition flex items-center space-x-1.5"
                              >
                                <Edit className="w-3.5 h-3.5 text-blue-600" />
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={() => handleDeleteCategory(cat.id)}
                                className="px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg transition flex items-center space-x-1.5"
                              >
                                <Trash className="w-3.5 h-3.5" />
                                <span>Delete</span>
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

            {/* TAB: LICENSE & SUBSCRIPTION KEYS */}
            {activeTab === 'licenses' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-black text-slate-900">License & Subscription Keys</h1>
                    <p className="text-xs text-slate-500 mt-1">Audit active keys, reset HWID/device locks, and issue manual keys.</p>
                  </div>
                  <button
                    onClick={() => setIsGenLicenseModalOpen(true)}
                    className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center space-x-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Issue Manual License</span>
                  </button>
                </div>

                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] font-bold">
                        <th className="pb-3">License Key</th>
                        <th className="pb-3">Customer</th>
                        <th className="pb-3">Product</th>
                        <th className="pb-3">Expiry</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {licenses.map((l) => (
                        <tr key={l.id} className="hover:bg-slate-50">
                          <td className="py-3 font-mono font-bold text-blue-600">{l.licenseKey}</td>
                          <td className="py-3">
                            <span className="font-semibold text-slate-900 block">{l.userName}</span>
                            <span className="text-[10px] text-slate-400">{l.userEmail}</span>
                          </td>
                          <td className="py-3 font-semibold text-slate-800">{l.productName}</td>
                          <td className="py-3 text-slate-600">
                            {l.expiryDate === 'LIFETIME' ? 'Lifetime' : new Date(l.expiryDate).toLocaleDateString()}
                          </td>
                          <td className="py-3">
                            <Badge variant={l.status === 'ACTIVE' ? 'active' : 'suspended'}>{l.status}</Badge>
                          </td>
                          <td className="py-3 text-right space-x-2">
                            <button
                              onClick={() => {
                                const newKey = prompt('Enter new License Key:', l.licenseKey);
                                if (newKey && newKey !== l.licenseKey) {
                                  handleUpdateLicenseKey(l.id, newKey.trim().toUpperCase());
                                }
                              }}
                              className="px-2.5 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold text-[11px] rounded-lg"
                            >
                              Edit Key
                            </button>
                            <button
                              onClick={() => handleResetHwidAdmin(l.id)}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] rounded-lg"
                            >
                              Reset Lock
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB: REDEEM KEY GENERATOR */}
            {activeTab === 'redeemKeys' && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-2xl font-black text-slate-900">Redeem Key Generator & Usage Tracker</h1>
                  <p className="text-xs text-slate-500 mt-1">
                    Create product-locked redeem codes for promotions, giveaways, or partners. Codes are strictly product-bound.
                  </p>
                </div>

                {/* Generator Form + Quick Overview Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column: Form */}
                  <div className="lg:col-span-1 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
                    <h3 className="text-base font-black text-slate-900 mb-4 flex items-center space-x-2">
                      <Gift className="w-5 h-5 text-indigo-600" />
                      <span>Generate New Redeem Key</span>
                    </h3>

                    <form onSubmit={handleGenerateRedeemKey} className="space-y-4 text-xs">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Target Product <span className="text-rose-500">*</span></label>
                        <select
                          required
                          value={rdmProductId}
                          onChange={(e) => setRdmProductId(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                        >
                          <option value="">-- Select Product --</option>
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} ({p.durationText || `${p.durationValue} ${p.durationUnit}`})
                            </option>
                          ))}
                        </select>
                      </div>

                      {Number(rdmMaxUses) === 1 && (
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="block font-bold text-slate-700">Assigned License Key (Optional)</label>
                          </div>
                          <input
                            type="text"
                            placeholder="e.g. APEX-XXXX-XXXX (or leave blank)"
                            value={rdmAssignedLicenseKey}
                            onChange={(e) => setRdmAssignedLicenseKey(e.target.value.toUpperCase())}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase font-bold text-slate-800"
                          />
                        </div>
                      )}

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block font-bold text-slate-700">Custom Code (Optional)</label>
                          <button
                            type="button"
                            onClick={() => {
                              const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
                              const r = (len: number) => Array.from({ length: len }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
                              setRdmCode(`DUDE-${r(4)}-${r(4)}-${r(4)}`);
                            }}
                            className="text-[10px] text-purple-600 hover:text-purple-700 font-bold"
                          >
                            Auto-Generate
                          </button>
                        </div>
                        <input
                          type="text"
                          placeholder="e.g. DUDE-VIP88-PRO (or leave blank)"
                          value={rdmCode}
                          onChange={(e) => setRdmCode(e.target.value.toUpperCase())}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase font-bold text-slate-800"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Max Usages</label>
                          <input
                            type="number"
                            min={1}
                            required
                            value={rdmMaxUses}
                            onChange={(e) => setRdmMaxUses(Number(e.target.value))}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Validity (Days)</label>
                          <input
                            type="number"
                            min={1}
                            required
                            value={rdmValidityDays}
                            onChange={(e) => setRdmValidityDays(Number(e.target.value))}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                          />
                        </div>
                      </div>

                      {rdmError && (
                        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-[11px] flex items-center space-x-1.5">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span>{rdmError}</span>
                        </div>
                      )}

                      <button
                        type="submit"
                        className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-md transition"
                      >
                        Generate & Save Redeem Key
                      </button>
                    </form>
                  </div>

                  {/* Right Column: Key List Table */}
                  <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm overflow-x-auto">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-base font-black text-slate-900">Generated Redeem Keys</h3>
                      <span className="text-xs text-slate-400 font-medium">{redeemKeys.length} total keys</span>
                    </div>

                    {redeemKeys.length === 0 ? (
                      <p className="text-xs text-slate-500 py-8 text-center">No redeem keys generated yet.</p>
                    ) : (
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] font-bold">
                            <th className="pb-3">Code</th>
                            <th className="pb-3">Product</th>
                            <th className="pb-3">Uses</th>
                            <th className="pb-3">Expiry</th>
                            <th className="pb-3">Status</th>
                            <th className="pb-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {redeemKeys.map((rk) => {
                            const isExhausted = rk.usedCount >= rk.maxUses;
                            const isExpired = rk.expiryDate ? new Date(rk.expiryDate) < new Date() : false;
                            const isLive = rk.isActive && !isExhausted && !isExpired;

                            return (
                              <tr key={rk.id} className="hover:bg-slate-50">
                                <td className="py-3">
                                  <div className="flex items-center space-x-1.5">
                                    <code className="font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded border border-indigo-100">
                                      {rk.code}
                                    </code>
                                    <button
                                      onClick={() => handleCopyRedeemCode(rk.code)}
                                      className="p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded transition"
                                      title="Copy Code"
                                    >
                                      {copiedRdmCode === rk.code ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                    </button>
                                  </div>
                                </td>
                                <td className="py-3 font-semibold text-slate-900">{rk.productName}</td>
                                <td className="py-3">
                                  <span className={`font-mono font-bold ${isExhausted ? 'text-rose-600' : 'text-slate-700'}`}>
                                    {rk.usedCount} / {rk.maxUses}
                                  </span>
                                </td>
                                <td className="py-3 text-slate-500">
                                  {rk.expiryDate ? new Date(rk.expiryDate).toLocaleDateString() : 'No Limit'}
                                </td>
                                <td className="py-3">
                                  {isLive ? (
                                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">ACTIVE</span>
                                  ) : isExhausted ? (
                                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">USED UP</span>
                                  ) : (
                                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">EXPIRED</span>
                                  )}
                                </td>
                                <td className="py-3 text-right">
                                  <button
                                    onClick={() => handleDeleteRedeemKey(rk.id)}
                                    className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                    title="Delete Key"
                                  >
                                    <Trash className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'payments' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-black text-slate-900">Payment Verification Ledger</h1>
                    <p className="text-xs text-slate-500 mt-1">
                      View and approve pending manual payments submitted via bKash, Nagad, Rocket, or Bank Transfer.
                    </p>
                  </div>
                </div>

                {/* Quick Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 bg-amber-50/80 border border-amber-200/80 rounded-2xl flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Pending Approvals</span>
                      <div className="text-xl font-black text-amber-900 mt-0.5">
                        {orders.filter((o) => o.status === 'PENDING').length} Submissions
                      </div>
                      <div className="text-[11px] font-semibold text-amber-700 mt-0.5">
                        {currency}
                        {orders
                          .filter((o) => o.status === 'PENDING')
                          .reduce((acc, curr) => acc + curr.finalAmount, 0)
                          .toLocaleString()}
                      </div>
                    </div>
                    <div className="p-3 bg-amber-100 text-amber-700 rounded-xl">
                      <Clock className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="p-4 bg-emerald-50/80 border border-emerald-200/80 rounded-2xl flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Approved Payments</span>
                      <div className="text-xl font-black text-emerald-900 mt-0.5">
                        {orders.filter((o) => o.status === 'APPROVED').length} Orders
                      </div>
                      <div className="text-[11px] font-semibold text-emerald-700 mt-0.5">
                        {currency}
                        {orders
                          .filter((o) => o.status === 'APPROVED')
                          .reduce((acc, curr) => acc + curr.finalAmount, 0)
                          .toLocaleString()}
                      </div>
                    </div>
                    <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="p-4 bg-rose-50/80 border border-rose-200/80 rounded-2xl flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700">Rejected Submissions</span>
                      <div className="text-xl font-black text-rose-900 mt-0.5">
                        {orders.filter((o) => o.status === 'REJECTED').length} Orders
                      </div>
                      <div className="text-[11px] font-semibold text-rose-700 mt-0.5">
                        {currency}
                        {orders
                          .filter((o) => o.status === 'REJECTED')
                          .reduce((acc, curr) => acc + curr.finalAmount, 0)
                          .toLocaleString()}
                      </div>
                    </div>
                    <div className="p-3 bg-rose-100 text-rose-700 rounded-xl">
                      <XCircle className="w-5 h-5" />
                    </div>
                  </div>
                </div>

                {/* Filter Bar & Search */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    {[
                      { id: 'PENDING', label: 'Pending Manual Payments', count: orders.filter((o) => o.status === 'PENDING').length },
                      { id: 'APPROVED', label: 'Approved', count: orders.filter((o) => o.status === 'APPROVED').length },
                      { id: 'REJECTED', label: 'Rejected', count: orders.filter((o) => o.status === 'REJECTED').length },
                      { id: 'ALL', label: 'All Payments', count: orders.length },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setPaymentFilter(tab.id as any)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
                          paymentFilter === tab.id
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        <span>{tab.label}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                            paymentFilter === tab.id
                              ? 'bg-white/20 text-white'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {tab.count}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="relative min-w-[220px]">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search TrxID, Email, Order #..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                {/* Payments Table */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm overflow-x-auto">
                  {(() => {
                    const filteredOrders = orders.filter((o) => {
                      const matchesStatus = paymentFilter === 'ALL' ? true : o.status === paymentFilter;
                      const matchesSearch =
                        !searchTerm ||
                        o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        o.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        o.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        o.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        o.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase());
                      return matchesStatus && matchesSearch;
                    });

                    if (filteredOrders.length === 0) {
                      return (
                        <div className="py-12 text-center text-slate-400 space-y-2">
                          <CheckCircle className="w-8 h-8 mx-auto text-slate-300" />
                          <p className="font-bold text-sm text-slate-600">No payment submissions found</p>
                          <p className="text-xs">There are no records matching your current filter criteria.</p>
                        </div>
                      );
                    }

                    return (
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] font-bold">
                            <th className="pb-3">Order / TrxID</th>
                            <th className="pb-3">Customer</th>
                            <th className="pb-3">Product</th>
                            <th className="pb-3">Method & Account</th>
                            <th className="pb-3">Amount</th>
                            <th className="pb-3">Submission Date</th>
                            <th className="pb-3">Status</th>
                            <th className="pb-3 text-right">Verification Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredOrders.map((o) => (
                            <tr key={o.id} className="hover:bg-slate-50/80 transition">
                              <td className="py-3.5 font-mono">
                                <span className="font-bold text-slate-900 block">{o.orderNumber}</span>
                                <span className="font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-[11px] inline-block mt-0.5 border border-blue-100">
                                  {o.transactionId}
                                </span>
                              </td>
                              <td className="py-3.5">
                                <span className="font-semibold text-slate-900 block">{o.userName}</span>
                                <span className="text-[10px] text-slate-400 font-mono">{o.userEmail}</span>
                              </td>
                              <td className="py-3.5 font-semibold text-slate-800">{o.productName}</td>
                              <td className="py-3.5">
                                <span className="font-bold text-slate-900 block">{o.paymentMethod}</span>
                                <span className="text-slate-500 font-mono text-[11px]">{o.accountNumber || 'N/A'}</span>
                              </td>
                              <td className="py-3.5 font-black text-slate-900">{currency}{o.finalAmount.toLocaleString()}</td>
                              <td className="py-3.5 text-slate-500 font-medium">
                                {new Date(o.createdAt).toLocaleDateString()} {new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </td>
                              <td className="py-3.5">
                                <Badge variant={o.status === 'APPROVED' ? 'active' : o.status === 'PENDING' ? 'pending' : 'rejected'}>
                                  {o.status}
                                </Badge>
                              </td>
                              <td className="py-3.5 text-right space-x-2">
                                {o.status === 'PENDING' ? (
                                  <div className="inline-flex items-center space-x-2">
                                    <button
                                      onClick={() => {
                                        setSelectedOrder(o);
                                        setPaymentActionType('APPROVED');
                                        setIsPaymentModalOpen(true);
                                      }}
                                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-500/20 transition flex items-center space-x-1"
                                    >
                                      <CheckCircle className="w-3.5 h-3.5" />
                                      <span>Approve</span>
                                    </button>
                                    <button
                                      onClick={() => {
                                        setSelectedOrder(o);
                                        setPaymentActionType('REJECTED');
                                        setIsPaymentModalOpen(true);
                                      }}
                                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-500/20 transition flex items-center space-x-1"
                                    >
                                      <XCircle className="w-3.5 h-3.5" />
                                      <span>Reject</span>
                                    </button>
                                  </div>
                                ) : (
                                  <div className="text-right">
                                    <span className="text-slate-500 font-mono text-[11px] bg-slate-100 px-2.5 py-1 rounded-lg block">
                                      {o.status === 'APPROVED' ? 'Approved' : 'Rejected'}
                                    </span>
                                    {o.adminNote && <span className="text-[10px] text-slate-400 block mt-1">{o.adminNote}</span>}
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    );
                  })()}
                </div>
              </div>
            )}

            {/* TAB: USER DIRECTORY */}
            {activeTab === 'users' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-black text-slate-900">User Directory</h1>
                  <p className="text-xs text-slate-500 mt-1">Manage registered accounts, view roles, and block/unblock accounts.</p>
                </div>

                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] font-bold">
                        <th className="pb-3">User</th>
                        <th className="pb-3">Phone</th>
                        <th className="pb-3">Role</th>
                        <th className="pb-3">HWID Status</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3">Joined</th>
                        <th className="pb-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {usersList.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50">
                          <td className="py-3 flex items-center space-x-3">
                            <img src={u.avatarUrl} alt={u.name} className="w-8 h-8 rounded-full border" />
                            <div>
                              <span className="font-bold text-slate-900 block">{u.name}</span>
                              <span className="text-[10px] text-slate-400">{u.email}</span>
                            </div>
                          </td>
                          <td className="py-3 font-mono text-slate-600">{u.phone || 'N/A'}</td>
                          <td className="py-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-700'}`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="py-3 font-mono">
                            {u.hwid ? (
                              <div>
                                <span className="text-[10px] bg-slate-100 text-slate-800 font-bold px-2 py-0.5 rounded border border-slate-200 block truncate max-w-[130px]">
                                  🔒 {u.hwid}
                                </span>
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-400 font-semibold italic">Not Set</span>
                            )}
                          </td>
                          <td className="py-3">
                            <Badge variant={u.isBlocked ? 'suspended' : 'active'}>
                              {u.isBlocked ? 'BLOCKED' : 'ACTIVE'}
                            </Badge>
                          </td>
                          <td className="py-3 text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                          <td className="py-3 text-right space-x-1">
                            {u.hwid && (
                              <button
                                onClick={() => handleResetUserHwid(u.id, u.name)}
                                className="px-2.5 py-1 text-xs font-bold rounded-lg bg-amber-100 text-amber-800 hover:bg-amber-200 border border-amber-300/60"
                                title="Reset User's HWID lock to allow new PC setup"
                              >
                                🔓 Reset HWID
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setGenUserEmail(u.email);
                                setIsGenLicenseModalOpen(true);
                              }}
                              className="px-2.5 py-1 text-xs font-bold rounded-lg bg-purple-100 text-purple-700 hover:bg-purple-200"
                            >
                              + Issue License
                            </button>
                            {u.role !== 'ADMIN' && (
                              <button
                                onClick={() => handleToggleUserBlock(u.id, u.isBlocked)}
                                className={`px-2.5 py-1 text-xs font-bold rounded-lg ${
                                  u.isBlocked ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                                }`}
                              >
                                {u.isBlocked ? 'Unblock' : 'Block'}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB: DOWNLOAD RELEASES */}
            {activeTab === 'downloads' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-black text-slate-900">Download Releases</h1>
                    <p className="text-xs text-slate-500 mt-1">Publish software installer builds, version updates, access permissions & changelogs.</p>
                  </div>
                  <button
                    onClick={() => {
                      setDlProductId('');
                      setDlAccessType('MEMBERS_ONLY');
                      setDlCustomName('');
                      setIsDownloadModalOpen(true);
                    }}
                    className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center space-x-1.5 transition"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Upload Build Release</span>
                  </button>
                </div>

                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] font-bold">
                        <th className="pb-3">Software / Release Name</th>
                        <th className="pb-3">Access Type</th>
                        <th className="pb-3">Version</th>
                        <th className="pb-3">File Size</th>
                        <th className="pb-3">Download URL</th>
                        <th className="pb-3">Changelog</th>
                        <th className="pb-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {downloads.map((d) => {
                        const isGlobal = d.accessType === 'GLOBAL' || d.productId === 'global';
                        return (
                          <tr key={d.id} className="hover:bg-slate-50 transition">
                            <td className="py-3.5 font-bold text-slate-900">
                              <div>
                                {d.productName}
                                <span className="block text-[10px] text-slate-400 font-mono font-normal">
                                  Product ID: {d.productId}
                                </span>
                              </div>
                            </td>
                            <td className="py-3.5">
                              {isGlobal ? (
                                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  <span>🌐 Global Release</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                                  <span>🔒 Members Only</span>
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 font-mono text-purple-600 font-bold">{d.version}</td>
                            <td className="py-3.5 text-slate-600 font-mono">{d.fileSize}</td>
                            <td className="py-3.5 max-w-xs">
                              <a
                                href={d.fileUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-purple-600 font-mono hover:underline flex items-center space-x-1 truncate max-w-[200px]"
                              >
                                <ExternalLink className="w-3 h-3 shrink-0" />
                                <span className="truncate">{d.fileUrl}</span>
                              </a>
                            </td>
                            <td className="py-3.5 text-slate-600 max-w-xs truncate">{d.changelog}</td>
                            <td className="py-3.5 text-right">
                              <button
                                onClick={() => handleDeleteDownload(d.id)}
                                className="px-2.5 py-1 text-[11px] font-bold text-red-600 hover:bg-red-50 border border-red-200 rounded-lg transition inline-flex items-center space-x-1"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>Delete</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB: SUPPORT QUEUE */}
            {activeTab === 'tickets' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-black text-slate-900">Customer Support Queue</h1>
                  <p className="text-xs text-slate-500 mt-1">Answer help requests, resolve issues, and communicate with buyers.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Tickets List */}
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm space-y-3">
                    <h3 className="text-xs font-bold text-slate-400 uppercase">All Tickets ({tickets.length})</h3>
                    <div className="space-y-2 max-h-[500px] overflow-y-auto">
                      {tickets.map((t) => (
                        <div
                          key={t.id}
                          onClick={() => setSelectedTicket(t)}
                          className={`p-3 rounded-xl border cursor-pointer transition ${
                            selectedTicket?.id === t.id ? 'bg-purple-50 border-purple-300' : 'bg-slate-50 border-slate-200/60 hover:bg-slate-100'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-mono font-bold text-xs text-purple-600">{t.ticketNumber}</span>
                            <Badge variant={t.status === 'RESOLVED' ? 'active' : 'pending'}>{t.status}</Badge>
                          </div>
                          <div className="font-bold text-xs text-slate-900 truncate">{t.subject}</div>
                          <div className="text-[10px] text-slate-400 mt-1">{t.userName} • {t.category}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Selected Ticket Thread */}
                  <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                    {selectedTicket ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                          <div>
                            <h2 className="text-lg font-bold text-slate-900">{selectedTicket.subject}</h2>
                            <span className="text-xs text-slate-500">{selectedTicket.userName} ({selectedTicket.userEmail})</span>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleUpdateTicketStatusAdmin(selectedTicket.id, 'RESOLVED')}
                              className="px-3 py-1 bg-emerald-600 text-white font-bold text-xs rounded-lg"
                            >
                              Mark Resolved
                            </button>
                            <button
                              onClick={() => handleUpdateTicketStatusAdmin(selectedTicket.id, 'CLOSED')}
                              className="px-3 py-1 bg-slate-200 text-slate-700 font-bold text-xs rounded-lg"
                            >
                              Close Ticket
                            </button>
                          </div>
                        </div>

                        {/* Thread Messages */}
                        <div className="space-y-3 max-h-80 overflow-y-auto p-2">
                          {selectedTicket.messages.map((m) => (
                            <div
                              key={m.id}
                              className={`p-3 rounded-xl text-xs space-y-1 ${
                                m.senderRole === 'ADMIN' ? 'bg-purple-50 border border-purple-200 ml-6' : 'bg-slate-100 border border-slate-200 mr-6'
                              }`}
                            >
                              <div className="flex items-center justify-between font-bold text-slate-800">
                                <span>{m.senderName} ({m.senderRole})</span>
                                <span className="text-[10px] text-slate-400">{new Date(m.createdAt).toLocaleTimeString()}</span>
                              </div>
                              <p className="text-slate-700 leading-relaxed">{m.message}</p>
                            </div>
                          ))}
                        </div>

                        {/* Admin Reply Input */}
                        <form onSubmit={handleReplyTicketAdmin} className="space-y-2 pt-3 border-t border-slate-100">
                          <textarea
                            rows={3}
                            placeholder="Type admin response..."
                            value={adminReplyText}
                            onChange={(e) => setAdminReplyText(e.target.value)}
                            className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                          <button
                            type="submit"
                            className="px-4 py-2 bg-purple-600 text-white font-bold text-xs rounded-xl shadow-md flex items-center space-x-1.5"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Send Official Admin Reply</span>
                          </button>
                        </form>
                      </div>
                    ) : (
                      <div className="text-center py-16 text-slate-400 text-xs font-semibold">
                        Select a ticket from the left queue to view and respond.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: PROMO COUPONS */}
            {activeTab === 'coupons' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-black text-slate-900">Promo Coupons</h1>
                    <p className="text-xs text-slate-500 mt-1">Create discount codes for customer checkout.</p>
                  </div>
                  <button
                    onClick={() => setIsCouponModalOpen(true)}
                    className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center space-x-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Promo Coupon</span>
                  </button>
                </div>

                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] font-bold">
                        <th className="pb-3">Coupon Code</th>
                        <th className="pb-3">Discount</th>
                        <th className="pb-3">Usage Count</th>
                        <th className="pb-3">Expiry Date</th>
                        <th className="pb-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {coupons.map((c) => (
                        <tr key={c.id} className="hover:bg-slate-50">
                          <td className="py-3 font-mono font-bold text-purple-600">{c.code}</td>
                          <td className="py-3 font-bold text-slate-900">{c.discountPercent}% OFF</td>
                          <td className="py-3 text-slate-600">{c.usedCount} / {c.maxUses}</td>
                          <td className="py-3 text-slate-500">{new Date(c.expiresAt).toLocaleDateString()}</td>
                          <td className="py-3 text-right">
                            <button
                              onClick={() => handleDeleteCoupon(c.id)}
                              className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg"
                            >
                              <Trash className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB: ANNOUNCEMENTS */}
            {activeTab === 'announcements' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-black text-slate-900">Site Announcements</h1>
                    <p className="text-xs text-slate-500 mt-1">Publish top notification banners and offer alerts across the storefront.</p>
                  </div>
                  <button
                    onClick={() => setIsAnnouncementModalOpen(true)}
                    className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center space-x-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Announcement</span>
                  </button>
                </div>

                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] font-bold">
                        <th className="pb-3">Title</th>
                        <th className="pb-3">Content</th>
                        <th className="pb-3">Target Link</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {announcements.map((a) => (
                        <tr key={a.id} className="hover:bg-slate-50">
                          <td className="py-3 font-bold text-slate-900">{a.title}</td>
                          <td className="py-3 text-slate-600 max-w-sm truncate">{a.content}</td>
                          <td className="py-3 text-blue-600 font-mono">{a.linkUrl || 'N/A'}</td>
                          <td className="py-3">
                            <Badge variant={a.isActive ? 'active' : 'suspended'}>
                              {a.isActive ? 'ACTIVE BANNER' : 'INACTIVE'}
                            </Badge>
                          </td>
                          <td className="py-3 text-right">
                            <button
                              onClick={() => handleDeleteAnnouncement(a.id)}
                              className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg"
                            >
                              <Trash className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB: VIDEO TUTORIALS */}
            {activeTab === 'tutorials' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-black text-slate-900">Video Tutorials Management</h1>
                    <p className="text-xs text-slate-500 mt-1">
                      Add and manage YouTube, Facebook, Vimeo, and custom video guides for user activation & HWID setup.
                    </p>
                  </div>
                  <button
                    onClick={handleOpenCreateTutorialModal}
                    className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center justify-center space-x-2 shrink-0 shadow-purple-600/20"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Video Tutorial</span>
                  </button>
                </div>

                {tutorials.length === 0 ? (
                  <div className="p-12 text-center bg-white border border-slate-200/80 rounded-2xl space-y-3 shadow-xs">
                    <Video className="w-12 h-12 text-slate-300 mx-auto" />
                    <h3 className="text-base font-bold text-slate-900">No Video Tutorials Added Yet</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Add video guides for YouTube, Facebook, or Vimeo to help users activate license keys and troubleshoot setup.
                    </p>
                    <button
                      onClick={handleOpenCreateTutorialModal}
                      className="px-4 py-2 bg-purple-600 text-white font-bold text-xs rounded-xl shadow-sm hover:bg-purple-700 transition"
                    >
                      Add First Tutorial
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tutorials.map((tut) => (
                      <div key={tut.id} className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between">
                        <div className="p-4 space-y-3">
                          <VideoEmbed videoUrl={tut.videoUrl} title={tut.title} />

                          <div className="space-y-1.5 pt-1">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-md border border-purple-100">
                                {tut.category}
                              </span>
                              <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                {tut.platform} {tut.duration ? `• ${tut.duration}` : ''}
                              </span>
                            </div>
                            <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{tut.title}</h3>
                            <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{tut.description || 'No description provided.'}</p>
                          </div>
                        </div>

                        <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                          <a
                            href={tut.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-600 hover:text-purple-700 font-bold flex items-center space-x-1"
                          >
                            <span>Open Link</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>

                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleOpenEditTutorialModal(tut)}
                              className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-100 transition flex items-center space-x-1"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => handleDeleteTutorial(tut.id)}
                              className="px-2.5 py-1.5 bg-rose-50 border border-rose-200 text-rose-600 font-bold rounded-lg hover:bg-rose-100 transition flex items-center space-x-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB: MANUAL SETUP REQUESTS */}
            {activeTab === 'manualSetup' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-black text-slate-900 flex items-center space-x-2">
                      <Wrench className="w-6 h-6 text-purple-600" />
                      <span>Manual Setup Requests Queue</span>
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">
                      Manage product-specific setup requests submitted by customers with HWID, phone, and custom requirements.
                    </p>
                  </div>

                  {/* Filter Pills */}
                  <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold shrink-0">
                    {(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'REJECTED', 'ALL'] as const).map((st) => (
                      <button
                        key={st}
                        onClick={() => setMreqFilter(st)}
                        className={`px-3 py-1.5 rounded-lg transition ${
                          mreqFilter === st
                            ? 'bg-white text-purple-600 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {st}
                        {st !== 'ALL' && (
                          <span className="ml-1 text-[10px] opacity-75">
                            ({manualSetupRequests.filter((r) => r.status === st).length})
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {manualSetupRequests.filter((r) => mreqFilter === 'ALL' || r.status === mreqFilter).length === 0 ? (
                  <div className="p-12 text-center bg-white border border-slate-200/80 rounded-2xl space-y-3 shadow-xs">
                    <Sliders className="w-12 h-12 text-slate-300 mx-auto" />
                    <h3 className="text-base font-bold text-slate-900">No Manual Setup Requests Found</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Requests will appear here when users click "Setup" on their product licenses that require manual administration.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {manualSetupRequests
                      .filter((r) => mreqFilter === 'ALL' || r.status === mreqFilter)
                      .map((req) => (
                        <div
                          key={req.id}
                          className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                            <div className="flex items-center space-x-3">
                              <span className="font-mono font-black text-sm text-purple-600 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-100">
                                {req.requestNumber}
                              </span>
                              <div>
                                <h3 className="text-base font-bold text-slate-900">{req.productName}</h3>
                                <p className="text-xs text-slate-500">Submitted: {new Date(req.createdAt).toLocaleString()}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge
                                variant={
                                  req.status === 'COMPLETED'
                                    ? 'active'
                                    : req.status === 'PENDING'
                                    ? 'pending'
                                    : req.status === 'IN_PROGRESS'
                                    ? 'pending'
                                    : 'rejected'
                                }
                              >
                                {req.status}
                              </Badge>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                            <div className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
                              <span className="text-slate-400 font-medium block text-[10px] uppercase">Customer Info</span>
                              <div className="font-bold text-slate-900">{req.userName}</div>
                              <div className="text-slate-600 font-mono">{req.userEmail}</div>
                              <div className="text-purple-600 font-bold">{req.userPhone || 'No Phone Provided'}</div>
                            </div>

                            <div className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
                              <span className="text-slate-400 font-medium block text-[10px] uppercase">License & HWID</span>
                              <div className="font-mono font-bold text-blue-600">{req.licenseKey}</div>
                              <div className="text-slate-700 font-mono text-[11px] truncate" title={req.hwid}>
                                HWID: {req.hwid}
                              </div>
                            </div>

                            <div className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
                              <span className="text-slate-400 font-medium block text-[10px] uppercase">Submitted Answers / Requirements</span>
                              {Object.keys(req.customAnswers || {}).length === 0 ? (
                                <span className="text-slate-400 italic">No custom fields filled.</span>
                              ) : (
                                <div className="space-y-1">
                                  {Object.entries(req.customAnswers).map(([q, a]) => (
                                    <div key={q} className="text-[11px]">
                                      <span className="font-semibold text-slate-600">{q}:</span>{' '}
                                      <span className="font-bold text-slate-900">{a}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Admin Note & Status Change Actions */}
                          <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
                            <div className="flex-1 flex items-center space-x-2">
                              <input
                                type="text"
                                placeholder="Admin Note / Setup Instructions for Customer..."
                                defaultValue={req.adminNote || ''}
                                id={`note_input_${req.id}`}
                                className="w-full px-3 py-1.5 border border-slate-200 rounded-xl bg-slate-50 text-xs font-medium"
                              />
                            </div>

                            <div className="flex items-center space-x-2 shrink-0">
                              <button
                                onClick={() => {
                                  const note = (document.getElementById(`note_input_${req.id}`) as HTMLInputElement)?.value;
                                  handleUpdateManualSetupStatus(req.id, 'IN_PROGRESS', note);
                                }}
                                className="px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-700 font-bold rounded-xl hover:bg-amber-100 transition"
                              >
                                In Progress
                              </button>
                              <button
                                onClick={() => {
                                  const note = (document.getElementById(`note_input_${req.id}`) as HTMLInputElement)?.value;
                                  handleUpdateManualSetupStatus(req.id, 'COMPLETED', note);
                                }}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition"
                              >
                                Complete Setup
                              </button>
                              <button
                                onClick={() => {
                                  const note = (document.getElementById(`note_input_${req.id}`) as HTMLInputElement)?.value;
                                  handleUpdateManualSetupStatus(req.id, 'REJECTED', note);
                                }}
                                className="px-3 py-1.5 bg-rose-50 border border-rose-200 text-rose-600 font-bold rounded-xl hover:bg-rose-100 transition"
                              >
                                Reject
                              </button>
                              <button
                                onClick={() => handleDeleteManualSetupRequest(req.id)}
                                className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-xl transition"
                                title="Delete Request"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB: WEBSITE SETTINGS */}
            {activeTab === 'settings' && (
              <div className="space-y-6 max-w-3xl">
                <div>
                  <h1 className="text-2xl font-black text-slate-900">Website & Payment Settings</h1>
                  <p className="text-xs text-slate-500 mt-1">Configure bKash, Nagad, Rocket numbers, site branding, and currency.</p>
                </div>

                <form onSubmit={handleSaveSettings} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">Site Branding</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Site Title</label>
                      <input
                        type="text"
                        value={settingsForm.siteName || ''}
                        onChange={(e) => setSettingsForm({ ...settingsForm, siteName: e.target.value })}
                        className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Support Email</label>
                      <input
                        type="email"
                        value={settingsForm.supportEmail || ''}
                        onChange={(e) => setSettingsForm({ ...settingsForm, supportEmail: e.target.value })}
                        className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Promo Prefix (First 4 Digits)</label>
                      <input
                        type="text"
                        maxLength={4}
                        value={settingsForm.promoPrefix || ''}
                        onChange={(e) => setSettingsForm({ ...settingsForm, promoPrefix: e.target.value.substring(0, 4) })}
                        className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono"
                      />
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 pt-4 pb-2 border-b border-slate-100">Bangladesh Payment Gateway Numbers</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">bKash Number</label>
                      <input
                        type="text"
                        value={settingsForm.bkashNumber || ''}
                        onChange={(e) => setSettingsForm({ ...settingsForm, bkashNumber: e.target.value })}
                        className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Nagad Number</label>
                      <input
                        type="text"
                        value={settingsForm.nagadNumber || ''}
                        onChange={(e) => setSettingsForm({ ...settingsForm, nagadNumber: e.target.value })}
                        className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Rocket Number</label>
                      <input
                        type="text"
                        value={settingsForm.rocketNumber || ''}
                        onChange={(e) => setSettingsForm({ ...settingsForm, rocketNumber: e.target.value })}
                        className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-purple-600 text-white font-bold text-xs rounded-xl shadow-md"
                  >
                    Save All Settings
                  </button>
                </form>
              </div>
            )}

            {/* TAB: AUDIT LOGS */}
            {activeTab === 'logs' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-black text-slate-900">System Audit Logs</h1>
                  <p className="text-xs text-slate-500 mt-1">Track administrative actions, license activations, and system events.</p>
                </div>

                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] font-bold">
                        <th className="pb-3">Timestamp</th>
                        <th className="pb-3">Action</th>
                        <th className="pb-3">Actor Email</th>
                        <th className="pb-3">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {logs.map((lg) => (
                        <tr key={lg.id} className="hover:bg-slate-50">
                          <td className="py-2.5 text-slate-400">{new Date(lg.createdAt).toLocaleString()}</td>
                          <td className="py-2.5 font-bold text-purple-600">{lg.action}</td>
                          <td className="py-2.5 text-slate-700">{lg.actorEmail}</td>
                          <td className="py-2.5 text-slate-900">{lg.details}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modal: Add/Edit Product */}
      <Modal isOpen={isProductModalOpen} onClose={() => setIsProductModalOpen(false)} title="Configure Product / Subscription">
        {editingProduct && (
          <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Netflix 4K UHD"
                  value={editingProduct.name || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl bg-slate-50"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Category</label>
                <select
                  value={editingProduct.category || (categories[0]?.name || 'Streaming & Entertainment')}
                  onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl bg-slate-50 font-medium"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                  {!categories.some((c) => c.name === editingProduct.category) && editingProduct.category && (
                    <option value={editingProduct.category}>{editingProduct.category}</option>
                  )}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-1">Subscription Tier</label>
                <select
                  value={editingProduct.subscriptionTier || 'PRO'}
                  onChange={(e) => setEditingProduct({ ...editingProduct, subscriptionTier: e.target.value as any })}
                  className="w-full px-3 py-2 border rounded-xl bg-slate-50 font-medium"
                >
                  <option value="BASIC">BASIC Tier</option>
                  <option value="STANDARD">STANDARD Tier</option>
                  <option value="PRO">PRO / Premium Tier</option>
                  <option value="ULTRA">ULTRA / VIP Tier</option>
                  <option value="ENTERPRISE">ENTERPRISE Tier</option>
                  <option value="FAMILY">FAMILY / Shared Tier</option>
                  <option value="INDIVIDUAL">INDIVIDUAL / Private Tier</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-1">Resource Type (Delivery Format)</label>
                <select
                  value={editingProduct.resourceType || 'ACCOUNT_CREDENTIALS'}
                  onChange={(e) => setEditingProduct({ ...editingProduct, resourceType: e.target.value as any })}
                  className="w-full px-3 py-2 border rounded-xl bg-slate-50 font-medium"
                >
                  <option value="ACCOUNT_CREDENTIALS">Account Credentials (User/Pass/PIN)</option>
                  <option value="LICENSE_KEY">License Activation Key</option>
                  <option value="INVITE_LINK">Invite Link / Email Upgrade</option>
                  <option value="INSTALLER_BUILD">Software Installer Executable</option>
                  <option value="API_KEY">API Token / Key</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-1">Regular Price ({currency})</label>
                <input
                  type="number"
                  required
                  value={editingProduct.price || 0}
                  onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-xl bg-slate-50"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Discounted Sale Price ({currency})</label>
                <input
                  type="number"
                  value={editingProduct.salePrice || 0}
                  onChange={(e) => setEditingProduct({ ...editingProduct, salePrice: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-xl bg-slate-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-1">Subscription Period (Manual Text)</label>
                <input
                  type="text"
                  placeholder="e.g. Permanent, 1 Month, 1 Year, Lifetime, 30 Days"
                  value={editingProduct.durationText || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, durationText: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl bg-slate-50 font-medium"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Billing Type</label>
                <select
                  value={editingProduct.billingType || 'SUBSCRIPTION'}
                  onChange={(e) => setEditingProduct({ ...editingProduct, billingType: e.target.value as any })}
                  className="w-full px-3 py-2 border rounded-xl bg-slate-50 font-medium"
                >
                  <option value="SUBSCRIPTION">SUBSCRIPTION (Monthly/Yearly)</option>
                  <option value="PERMANENT">PERMANENT / LIFETIME</option>
                  <option value="ONE_TIME">ONE-TIME</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-1">Short Description</label>
              <textarea
                rows={2}
                value={editingProduct.shortDescription || ''}
                onChange={(e) => setEditingProduct({ ...editingProduct, shortDescription: e.target.value })}
                className="w-full p-2 border rounded-xl bg-slate-50"
              />
            </div>

            {/* ACCORDION ITEM 1: MANUAL SETUP & VIDEO TUTORIAL CONFIGURATION */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
              <button
                type="button"
                onClick={() => setIsSetupAccordionOpen(!isSetupAccordionOpen)}
                className="w-full p-4 bg-purple-50/70 hover:bg-purple-100/60 transition flex items-center justify-between text-left"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 text-purple-700 rounded-xl">
                    <Wrench className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Manual Setup & Video Configuration</h4>
                    <p className="text-[11px] text-slate-500">Assign system video tutorials, external setup bot links, and HWID input questions.</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${
                    editingProduct.manualSetupRequired
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}>
                    {editingProduct.manualSetupRequired ? 'SETUP ACTIVE' : 'OFF'}
                  </span>
                  {isSetupAccordionOpen ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                </div>
              </button>

              {isSetupAccordionOpen && (
                <div className="p-4 border-t border-purple-100 space-y-4 bg-purple-50/20">
                  <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200">
                    <label className="flex items-center space-x-2 font-bold text-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(editingProduct.manualSetupRequired)}
                        onChange={(e) => setEditingProduct({ ...editingProduct, manualSetupRequired: e.target.checked })}
                        className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                      />
                      <span>Require Manual Setup Request by Admin</span>
                    </label>
                  </div>

                  {/* VIDEO TUTORIAL DROPDOWN SELECTION */}
                  <div className="space-y-3 bg-white p-3 rounded-xl border border-slate-200">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1 text-xs">Select Video Tutorial (From System Database)</label>
                      <select
                        value={editingProduct.tutorialId || ''}
                        onChange={(e) => {
                          const selectedId = e.target.value;
                          const tut = tutorials.find((t) => t.id === selectedId);
                          setEditingProduct({
                            ...editingProduct,
                            tutorialId: selectedId,
                            tutorialVideoUrl: tut ? tut.videoUrl : editingProduct.tutorialVideoUrl,
                          });
                        }}
                        className="w-full px-3 py-2 border rounded-xl bg-slate-50 text-xs font-semibold text-slate-900"
                      >
                        <option value="">-- Select from Database Tutorials --</option>
                        {tutorials.map((tut) => (
                          <option key={tut.id} value={tut.id}>
                            {tut.title} ({tut.platform})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1 text-xs">Or Custom Video Tutorial URL</label>
                      <input
                        type="url"
                        placeholder="https://www.youtube.com/watch?v=... or Facebook / Vimeo link"
                        value={editingProduct.tutorialVideoUrl || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, tutorialVideoUrl: e.target.value })}
                        className="w-full px-3 py-2 border rounded-xl bg-slate-50 font-mono text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-3 rounded-xl border border-slate-200">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1 text-xs">External Setup Link (Optional)</label>
                      <input
                        type="url"
                        placeholder="e.g. https://t.me/setup_bot"
                        value={editingProduct.setupExternalLink || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, setupExternalLink: e.target.value })}
                        className="w-full px-3 py-2 border rounded-xl bg-slate-50 font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1 text-xs">External Button Label</label>
                      <input
                        type="text"
                        placeholder="e.g. Open Telegram Setup Bot"
                        value={editingProduct.setupExternalLinkLabel || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, setupExternalLinkLabel: e.target.value })}
                        className="w-full px-3 py-2 border rounded-xl bg-slate-50 text-xs font-medium"
                      />
                    </div>
                  </div>

                  {editingProduct.manualSetupRequired && (
                    <div className="pt-2 border-t border-purple-100 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 text-xs">Custom Setup Questions / Required Input Fields</span>
                        <button
                          type="button"
                          onClick={() => {
                            const current = editingProduct.setupCustomFields || [];
                            setEditingProduct({
                              ...editingProduct,
                              setupCustomFields: [
                                ...current,
                                { id: 'f_' + Date.now(), label: 'AnyDesk ID / Requirements', placeholder: 'e.g. 123 456 789', required: true }
                              ]
                            });
                          }}
                          className="px-2.5 py-1 bg-purple-600 text-white font-bold text-[10px] rounded-lg shadow-xs hover:bg-purple-700 transition"
                        >
                          + Add Custom Field
                        </button>
                      </div>

                      {(editingProduct.setupCustomFields || []).length === 0 ? (
                        <p className="text-[11px] text-slate-500 italic">No custom fields added yet. Users will be asked for basic HWID, Email, and Phone.</p>
                      ) : (
                        <div className="space-y-2">
                          {(editingProduct.setupCustomFields || []).map((field, idx) => (
                            <div key={field.id || idx} className="flex items-center gap-2 bg-white p-2 border border-slate-200 rounded-xl">
                              <input
                                type="text"
                                placeholder="Field Label (e.g. AnyDesk ID)"
                                value={field.label}
                                onChange={(e) => {
                                  const updated = [...(editingProduct.setupCustomFields || [])];
                                  updated[idx].label = e.target.value;
                                  setEditingProduct({ ...editingProduct, setupCustomFields: updated });
                                }}
                                className="flex-1 px-2.5 py-1.5 border rounded-lg text-xs font-semibold"
                              />
                              <input
                                type="text"
                                placeholder="Placeholder"
                                value={field.placeholder || ''}
                                onChange={(e) => {
                                  const updated = [...(editingProduct.setupCustomFields || [])];
                                  updated[idx].placeholder = e.target.value;
                                  setEditingProduct({ ...editingProduct, setupCustomFields: updated });
                                }}
                                className="w-32 px-2.5 py-1.5 border rounded-lg text-xs"
                              />
                              <label className="flex items-center space-x-1 text-[11px] font-bold text-slate-600">
                                <input
                                  type="checkbox"
                                  checked={Boolean(field.required)}
                                  onChange={(e) => {
                                    const updated = [...(editingProduct.setupCustomFields || [])];
                                    updated[idx].required = e.target.checked;
                                    setEditingProduct({ ...editingProduct, setupCustomFields: updated });
                                  }}
                                  className="w-3 h-3 text-purple-600 rounded"
                                />
                                <span>Required</span>
                              </label>
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = (editingProduct.setupCustomFields || []).filter((_, i) => i !== idx);
                                  setEditingProduct({ ...editingProduct, setupCustomFields: updated });
                                }}
                                className="p-1 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ACCORDION ITEM 2: MAINTENANCE FEE SETTINGS */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
              <button
                type="button"
                onClick={() => setIsMaintenanceAccordionOpen(!isMaintenanceAccordionOpen)}
                className="w-full p-4 bg-amber-50/70 hover:bg-amber-100/60 transition flex items-center justify-between text-left"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-amber-100 text-amber-700 rounded-xl">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Maintenance Fee & Expiry Settings</h4>
                    <p className="text-[11px] text-slate-500">Enable recurring fee charges, notice alerts, and auto-pausing subscriptions.</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${
                    editingProduct.maintenanceFeeEnabled
                      ? 'bg-amber-600 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}>
                    {editingProduct.maintenanceFeeEnabled ? `FEE ACTIVE (৳${editingProduct.maintenanceFeeAmount || 50}/${editingProduct.maintenanceFeePeriodDays || 30}d)` : 'DISABLED'}
                  </span>
                  {isMaintenanceAccordionOpen ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                </div>
              </button>

              {isMaintenanceAccordionOpen && (
                <div className="p-4 border-t border-amber-100 space-y-4 bg-amber-50/20">
                  <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200">
                    <label className="flex items-center space-x-2 font-bold text-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(editingProduct.maintenanceFeeEnabled)}
                        onChange={(e) => setEditingProduct({ ...editingProduct, maintenanceFeeEnabled: e.target.checked })}
                        className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                      />
                      <span>Enable Maintenance Fee for this Product</span>
                    </label>
                  </div>

                  {editingProduct.maintenanceFeeEnabled && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3 rounded-xl border border-slate-200">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1 text-xs">Maintenance Fee Amount (৳)</label>
                        <input
                          type="number"
                          min={0}
                          placeholder="e.g. 50"
                          value={editingProduct.maintenanceFeeAmount ?? 50}
                          onChange={(e) => setEditingProduct({ ...editingProduct, maintenanceFeeAmount: Number(e.target.value) })}
                          className="w-full px-3 py-1.5 border rounded-xl text-xs font-bold text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1 text-xs">Period Interval (Days)</label>
                        <input
                          type="number"
                          min={1}
                          placeholder="e.g. 30"
                          value={editingProduct.maintenanceFeePeriodDays ?? 30}
                          onChange={(e) => setEditingProduct({ ...editingProduct, maintenanceFeePeriodDays: Number(e.target.value) })}
                          className="w-full px-3 py-1.5 border rounded-xl text-xs font-bold text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1 text-xs">Notice Advance Days</label>
                        <input
                          type="number"
                          min={1}
                          placeholder="e.g. 7"
                          value={editingProduct.maintenanceFeeNoticeDays ?? 7}
                          onChange={(e) => setEditingProduct({ ...editingProduct, maintenanceFeeNoticeDays: Number(e.target.value) })}
                          className="w-full px-3 py-1.5 border rounded-xl text-xs font-bold text-slate-900"
                        />
                      </div>
                    </div>
                  )}

                  <p className="text-[11px] text-slate-500 italic">
                    Note: When active, users will receive dashboard notifications N days before their maintenance fee due date. If unpaid, subscription status will automatically turn inactive/expired.
                  </p>
                </div>
              )}
            </div>

            <button type="submit" className="w-full py-3 bg-purple-600 text-white font-bold rounded-xl shadow-md">
              Save Product
            </button>
          </form>
        )}
      </Modal>

      {/* Modal: Issue Manual License */}
      <Modal isOpen={isGenLicenseModalOpen} onClose={() => setIsGenLicenseModalOpen(false)} title="Issue Manual License Key">
        <form onSubmit={handleGenerateLicense} className="space-y-4 text-xs">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block font-bold text-slate-700">Target Customer Email</label>
              {usersList.length > 0 && (
                <span className="text-[10px] text-purple-600 font-semibold">
                  Select registered user or type email
                </span>
              )}
            </div>
            {usersList.length > 0 && (
              <select
                onChange={(e) => {
                  if (e.target.value) setGenUserEmail(e.target.value);
                }}
                className="w-full px-3 py-1.5 mb-1.5 border border-purple-200 rounded-xl bg-purple-50/50 font-medium text-slate-800"
              >
                <option value="">-- Quick Select Registered User --</option>
                {usersList.map((u) => (
                  <option key={u.id} value={u.email}>
                    {u.name} ({u.email})
                  </option>
                ))}
              </select>
            )}
            <input
              type="email"
              required
              placeholder="e.g. user@apexboost.io"
              value={genUserEmail}
              onChange={(e) => setGenUserEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-xl bg-slate-50 font-medium"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Select Product / Subscription</label>
            <select
              required
              value={genProductId}
              onChange={(e) => setGenProductId(e.target.value)}
              className="w-full px-3 py-2 border rounded-xl bg-slate-50 font-medium"
            >
              <option value="">-- Choose Product --</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.billingType === 'PERMANENT' ? 'Permanent' : `${p.durationValue} ${p.durationUnit}`})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Custom License Key (Optional)</label>
            <input
              type="text"
              placeholder="e.g. APEX-88F2-9901-XK92-PRO (Leave blank to auto-generate)"
              value={genCustomKey}
              onChange={(e) => setGenCustomKey(e.target.value)}
              className="w-full px-3 py-2 border rounded-xl bg-slate-50 font-mono"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block font-bold text-slate-700">Duration (Days)</label>
              <div className="flex space-x-1">
                <button
                  type="button"
                  onClick={() => setGenDurationDays(30)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${genDurationDays === 30 ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600'}`}
                >
                  30 Days
                </button>
                <button
                  type="button"
                  onClick={() => setGenDurationDays(90)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${genDurationDays === 90 ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600'}`}
                >
                  90 Days
                </button>
                <button
                  type="button"
                  onClick={() => setGenDurationDays(365)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${genDurationDays === 365 ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600'}`}
                >
                  1 Year
                </button>
                <button
                  type="button"
                  onClick={() => setGenDurationDays(3650)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${genDurationDays === 3650 ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600'}`}
                >
                  Lifetime
                </button>
              </div>
            </div>
            <input
              type="number"
              min={1}
              value={genDurationDays}
              onChange={(e) => setGenDurationDays(Number(e.target.value))}
              className="w-full px-3 py-2 border rounded-xl bg-slate-50 font-medium"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Admin Notes / Order Ref (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Manually issued via Bkash offline agreement"
              value={genNotes}
              onChange={(e) => setGenNotes(e.target.value)}
              className="w-full px-3 py-2 border rounded-xl bg-slate-50"
            />
          </div>

          <button type="submit" className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-md transition">
            Issue Manual License Key
          </button>
        </form>
      </Modal>

      {/* Modal: Create Download Release */}
      <Modal isOpen={isDownloadModalOpen} onClose={() => setIsDownloadModalOpen(false)} title="Add Software Download Release">
        <form onSubmit={handleCreateDownload} className="space-y-4 text-xs">
          {/* Release Access Type Selection */}
          <div>
            <label className="block font-bold text-slate-900 mb-1.5">Release Access Permission</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setDlAccessType('GLOBAL');
                  setDlProductId('global');
                }}
                className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                  dlAccessType === 'GLOBAL'
                    ? 'border-emerald-500 bg-emerald-50/80 ring-2 ring-emerald-500/20 text-emerald-950 font-bold'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-800">
                  <span>🌐 Global Release</span>
                </div>
                <span className="text-[10px] text-slate-500 font-normal mt-1 leading-tight">
                  Public download accessible to everyone (no purchase required).
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setDlAccessType('MEMBERS_ONLY');
                  if (dlProductId === 'global') setDlProductId('');
                }}
                className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                  dlAccessType === 'MEMBERS_ONLY'
                    ? 'border-purple-500 bg-purple-50/80 ring-2 ring-purple-500/20 text-purple-950 font-bold'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center space-x-1.5 text-xs font-bold text-purple-900">
                  <span>🔒 Members Only</span>
                </div>
                <span className="text-[10px] text-slate-500 font-normal mt-1 leading-tight">
                  Only customers who purchased this specific product can access.
                </span>
              </button>
            </div>
          </div>

          {dlAccessType === 'MEMBERS_ONLY' ? (
            <div>
              <label className="block font-bold text-slate-700 mb-1">Select Purchased Product *</label>
              <select
                required
                value={dlProductId}
                onChange={(e) => setDlProductId(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50 font-bold text-slate-900"
              >
                <option value="">-- Choose Target Product --</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="block font-bold text-slate-700 mb-1">Software / Release Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. ApexBoost HWID & PC Diagnostics Utility"
                value={dlCustomName}
                onChange={(e) => setDlCustomName(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50 font-bold text-slate-900"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Version Tag</label>
              <input
                type="text"
                required
                placeholder="v1.0.0"
                value={dlVersion}
                onChange={(e) => setDlVersion(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl bg-slate-50 font-mono font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">File Size</label>
              <input
                type="text"
                required
                placeholder="25 MB"
                value={dlFileSize}
                onChange={(e) => setDlFileSize(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl bg-slate-50"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Download URL (Direct Executable or Cloud Link) *</label>
            <input
              type="text"
              required
              placeholder="e.g. https://cdn.example.com/build.exe or Google Drive / Mediafire link"
              value={dlUrl}
              onChange={(e) => setDlUrl(e.target.value)}
              className="w-full px-3 py-2.5 border rounded-xl bg-slate-50 font-mono text-xs font-bold text-slate-900"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              ℹ️ Clicking the Download button on this release will open/redirect directly to this link.
            </p>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Changelog & Release Notes</label>
            <textarea
              rows={2}
              required
              placeholder="List major features, driver fixes, or system optimizations..."
              value={dlChangelog}
              onChange={(e) => setDlChangelog(e.target.value)}
              className="w-full p-3 border rounded-xl bg-slate-50 text-slate-900"
            />
          </div>

          <button type="submit" className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-md transition text-xs">
            Publish Release
          </button>
        </form>
      </Modal>

      {/* Modal: Create Promo Coupon */}
      <Modal isOpen={isCouponModalOpen} onClose={() => setIsCouponModalOpen(false)} title="Create Promo Coupon">
        <form onSubmit={handleCreateCoupon} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold mb-1">Coupon Code</label>
            <input
              type="text"
              required
              placeholder="e.g. SAVE30"
              value={cpnCode}
              onChange={(e) => setCpnCode(e.target.value)}
              className="w-full px-3 py-2 border rounded-xl bg-slate-50 uppercase font-mono font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1">Discount %</label>
              <input
                type="number"
                required
                value={cpnDiscount}
                onChange={(e) => setCpnDiscount(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-xl bg-slate-50"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Max Uses</label>
              <input
                type="number"
                value={cpnMaxUses}
                onChange={(e) => setCpnMaxUses(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-xl bg-slate-50"
              />
            </div>
          </div>

          <button type="submit" className="w-full py-3 bg-purple-600 text-white font-bold rounded-xl shadow-md">
            Save Promo Coupon
          </button>
        </form>
      </Modal>

      {/* Modal: Create Announcement */}
      <Modal isOpen={isAnnouncementModalOpen} onClose={() => setIsAnnouncementModalOpen(false)} title="Create Site Banner Announcement">
        <form onSubmit={handleCreateAnnouncement} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold mb-1">Banner Title</label>
            <input
              type="text"
              required
              placeholder="e.g. ⚡ Special Offer 30% Discount"
              value={ancTitle}
              onChange={(e) => setAncTitle(e.target.value)}
              className="w-full px-3 py-2 border rounded-xl bg-slate-50"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Content Text</label>
            <textarea
              rows={3}
              required
              placeholder="e.g. Get Netflix, ChatGPT Plus, and Canva Pro at discounted rates!"
              value={ancContent}
              onChange={(e) => setAncContent(e.target.value)}
              className="w-full p-2 border rounded-xl bg-slate-50"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Target Link URL (Optional)</label>
            <input
              type="text"
              placeholder="/pricing"
              value={ancLinkUrl}
              onChange={(e) => setAncLinkUrl(e.target.value)}
              className="w-full px-3 py-2 border rounded-xl bg-slate-50"
            />
          </div>

          <button type="submit" className="w-full py-3 bg-purple-600 text-white font-bold rounded-xl shadow-md">
            Publish Announcement Banner
          </button>
        </form>
      </Modal>

      {/* Modal: Add/Edit Category */}
      {isCategoryModalOpen && editingCategory && (
        <Modal
          isOpen={isCategoryModalOpen}
          onClose={() => setIsCategoryModalOpen(false)}
          title={editingCategory.id ? 'Edit Category' : 'Add New Category'}
        >
          <form onSubmit={handleSaveCategory} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold mb-1">Category Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Streaming & Entertainment"
                value={editingCategory.name || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  setEditingCategory({
                    ...editingCategory,
                    name: val,
                    slug: editingCategory.id ? editingCategory.slug : val.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                  });
                }}
                className="w-full px-3 py-2 border rounded-xl bg-slate-50 font-medium text-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Category Slug (URL Identifier)</label>
              <input
                type="text"
                required
                placeholder="e.g. streaming-entertainment"
                value={editingCategory.slug || ''}
                onChange={(e) => setEditingCategory({ ...editingCategory, slug: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl bg-slate-50 font-mono text-slate-700"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Description (Optional)</label>
              <textarea
                rows={3}
                placeholder="e.g. Subscriptions for Netflix 4K, Prime Video, Spotify Family and Streaming tools..."
                value={editingCategory.description || ''}
                onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                className="w-full p-2.5 border rounded-xl bg-slate-50 font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Display Order Priority</label>
              <input
                type="number"
                value={editingCategory.displayOrder || 1}
                onChange={(e) => setEditingCategory({ ...editingCategory, displayOrder: Number(e.target.value) })}
                className="w-full px-3 py-2 border rounded-xl bg-slate-50 font-medium"
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t">
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button type="submit" className="px-5 py-2 bg-purple-600 text-white font-bold rounded-xl shadow-md hover:bg-purple-700">
                Save Category
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL: PAYMENT APPROVAL */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setSelectedOrder(null);
          setPaymentActionType(null);
          setAdminNote('');
          setCustomLicenseKey('');
        }}
        title={`${paymentActionType === 'APPROVED' ? 'Approve' : 'Reject'} Payment - ${selectedOrder?.orderNumber}`}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {paymentActionType === 'APPROVED' ? 'Admin Note (Optional)' : 'Rejection Reason (Optional)'}
            </label>
            <textarea
              rows={3}
              placeholder={paymentActionType === 'APPROVED' ? 'e.g., Payment verified, license issued.' : 'e.g., TrxID invalid or payment not received.'}
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-600"
            />
          </div>

          {paymentActionType === 'APPROVED' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Custom License Key (Optional)</label>
              <input
                type="text"
                placeholder="e.g., APEX-XXXX-XXXX"
                value={customLicenseKey}
                onChange={(e) => setCustomLicenseKey(e.target.value.toUpperCase())}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-600 font-mono uppercase"
              />
            </div>
          )}

          <div className="pt-2">
            <button
              onClick={handleUpdateOrderStatus}
              className={`w-full py-3 text-white font-bold rounded-xl shadow-md ${
                paymentActionType === 'APPROVED' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              Confirm {paymentActionType === 'APPROVED' ? 'Approval' : 'Rejection'}
            </button>
          </div>
        </div>
      </Modal>

      {/* MODAL: CREATE / EDIT TUTORIAL */}
      <Modal
        isOpen={isTutorialModalOpen}
        onClose={() => setIsTutorialModalOpen(false)}
        title={editingTutorialId ? 'Edit Video Tutorial' : 'Add New Video Tutorial'}
      >
        <form onSubmit={handleSaveTutorial} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Tutorial Title *</label>
            <input
              type="text"
              required
              placeholder="e.g., How to Redeem License Key & Activate Software"
              value={tutTitle}
              onChange={(e) => setTutTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-600 font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
              <input
                type="text"
                placeholder="e.g., License Activation, HWID Reset, Setup Guide"
                value={tutCategory}
                onChange={(e) => setTutCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Video Platform</label>
              <select
                value={tutPlatform}
                onChange={(e) => setTutPlatform(e.target.value as any)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-600 font-semibold"
              >
                <option value="AUTO">✨ Auto-Detect Platform</option>
                <option value="YOUTUBE">YouTube</option>
                <option value="FACEBOOK">Facebook Video</option>
                <option value="VIMEO">Vimeo</option>
                <option value="TIKTOK">TikTok</option>
                <option value="OTHER">Other / Direct Video Link</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Video Link / URL *</label>
            <div className="flex gap-2">
              <input
                type="url"
                required
                placeholder="https://www.youtube.com/watch?v=... or https://facebook.com/watch/?v=..."
                value={tutVideoUrl}
                onChange={(e) => setTutVideoUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-600 font-mono"
              />
              <button
                type="button"
                onClick={handleSyncMetadata}
                className="px-3 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
              >
                Sync
              </button>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              Supports YouTube links, Facebook video URLs, Vimeo, TikTok, or direct video URLs.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Video Duration (Optional)</label>
            <input
              type="text"
              placeholder="e.g., 03:45"
              value={tutDuration}
              onChange={(e) => setTutDuration(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Short Description</label>
            <textarea
              rows={3}
              placeholder="Explain what users will learn from this video tutorial..."
              value={tutDescription}
              onChange={(e) => setTutDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-600"
            />
          </div>

          {tutVideoUrl && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="text-[11px] font-bold text-slate-700 block">Live Video Embed Preview:</span>
              <VideoEmbed videoUrl={tutVideoUrl} title={tutTitle || 'Preview'} />
            </div>
          )}

          <div className="pt-2 flex items-center justify-end space-x-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsTutorialModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-md transition shadow-purple-600/20"
            >
              {editingTutorialId ? 'Update Tutorial' : 'Create Tutorial'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
