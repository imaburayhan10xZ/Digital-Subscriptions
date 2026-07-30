import {
  User,
  Product,
  Order,
  License,
  DownloadRelease,
  SupportTicket,
  Announcement,
  Coupon,
  SiteSettings,
  AuditLog,
  Category,
  RedeemKey,
  UserNotification,
  NotificationType,
  Tutorial,
  ManualSetupRequest,
  ManualSetupStatus
} from '../types/index.js';

const getAuthHeaders = () => {
  const token = localStorage.getItem('apexboost_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'API Request failed');
  }
  return data as T;
}

export const api = {
  // Auth
  register: async (payload: { name: string; email: string; password: string; phone?: string }) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<{ token: string; user: User }>(res);
  },

  login: async (payload: { email: string; password: string }) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<{ token: string; user: User }>(res);
  },

  getMe: async () => {
    const res = await fetch('/api/auth/me', {
      headers: getAuthHeaders(),
    });
    return handleResponse<{ user: User }>(res);
  },

  updateProfile: async (payload: { name?: string; phone?: string; currentPassword?: string; newPassword?: string }) => {
    const res = await fetch('/api/auth/profile', {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse<{ user: User }>(res);
  },

  // Categories
  getCategories: async () => {
    const res = await fetch('/api/categories');
    return handleResponse<Category[]>(res);
  },

  createCategory: async (payload: Partial<Category>) => {
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse<Category>(res);
  },

  updateCategory: async (id: string, payload: Partial<Category>) => {
    const res = await fetch(`/api/categories/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse<Category>(res);
  },

  deleteCategory: async (id: string) => {
    const res = await fetch(`/api/categories/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse<{ success: boolean }>(res);
  },

  // Products
  getProducts: async (adminView = false) => {
    const res = await fetch(`/api/products${adminView ? '?admin=true' : ''}`);
    return handleResponse<Product[]>(res);
  },

  getProduct: async (idOrSlug: string) => {
    const res = await fetch(`/api/products/${idOrSlug}`);
    return handleResponse<Product>(res);
  },

  createProduct: async (payload: Partial<Product>) => {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse<Product>(res);
  },

  updateProduct: async (id: string, payload: Partial<Product>) => {
    const res = await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse<Product>(res);
  },

  cloneProduct: async (id: string) => {
    const res = await fetch(`/api/products/${id}/clone`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return handleResponse<Product>(res);
  },

  deleteProduct: async (id: string) => {
    const res = await fetch(`/api/products/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse<{ success: boolean }>(res);
  },

  // Coupons
  validateCoupon: async (code: string) => {
    const res = await fetch('/api/coupons/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });
    return handleResponse<{ coupon: Coupon }>(res);
  },

  // Orders
  createOrder: async (payload: {
    productId: string;
    paymentMethod: string;
    transactionId: string;
    accountNumber?: string;
    couponCode?: string;
    paymentProofUrl?: string;
  }) => {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse<{ order: Order; autoActivated: boolean }>(res);
  },

  getUserOrders: async () => {
    const res = await fetch('/api/orders/user', {
      headers: getAuthHeaders(),
    });
    return handleResponse<Order[]>(res);
  },

  getAllOrders: async () => {
    const res = await fetch('/api/orders', {
      headers: getAuthHeaders(),
    });
    return handleResponse<Order[]>(res);
  },

  updateOrderStatus: async (id: string, status: string, adminNote?: string, customLicenseKey?: string) => {
    const res = await fetch(`/api/orders/${id}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, adminNote, customLicenseKey }),
    });
    return handleResponse<Order>(res);
  },

  // Licenses
  getUserLicenses: async () => {
    const res = await fetch('/api/licenses/user', {
      headers: getAuthHeaders(),
    });
    return handleResponse<License[]>(res);
  },

  resetHwid: async (licenseId: string) => {
    const res = await fetch(`/api/licenses/reset-hwid/${licenseId}`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return handleResponse<{ success: boolean; license: License }>(res);
  },

  updateLicense: async (id: string, updates: Partial<License>) => {
    const res = await fetch(`/api/licenses/${id}`, {
      method: 'PUT',
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return handleResponse<License>(res);
  },

  setUserHwid: async (hwid: string) => {
    const res = await fetch('/api/user/hwid', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ hwid }),
    });
    return handleResponse<{ user: User; success: boolean }>(res);
  },

  resetUserHwid: async (userId: string) => {
    const res = await fetch(`/api/admin/users/${userId}/reset-hwid`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return handleResponse<{ user: User; success: boolean }>(res);
  },

  getAllLicenses: async () => {
    const res = await fetch('/api/licenses', {
      headers: getAuthHeaders(),
    });
    return handleResponse<License[]>(res);
  },

  createLicense: async (payload: {
    userEmail: string;
    productId: string;
    durationDays?: number;
    notes?: string;
    customKey?: string;
    maxDevices?: number;
    hwidLock?: boolean;
  }) => {
    const res = await fetch('/api/licenses', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse<License>(res);
  },

  updateLicense: async (id: string, payload: Partial<License>) => {
    const res = await fetch(`/api/licenses/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse<License>(res);
  },

  deleteLicense: async (id: string) => {
    const res = await fetch(`/api/licenses/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse<{ success: boolean }>(res);
  },

  // Downloads
  getDownloads: async () => {
    const res = await fetch('/api/downloads');
    return handleResponse<DownloadRelease[]>(res);
  },

  createDownload: async (payload: Partial<DownloadRelease>) => {
    const res = await fetch('/api/downloads', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse<DownloadRelease>(res);
  },

  deleteDownload: async (id: string) => {
    const res = await fetch(`/api/downloads/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse<{ success: boolean }>(res);
  },

  trackDownload: async (id: string) => {
    try {
      await fetch(`/api/downloads/${id}/track`, { method: 'POST' });
    } catch (e) {
      console.error('Download track failed', e);
    }
  },

  // Support Tickets
  getTickets: async () => {
    const res = await fetch('/api/tickets', {
      headers: getAuthHeaders(),
    });
    return handleResponse<SupportTicket[]>(res);
  },

  createTicket: async (payload: { subject: string; category: string; priority: string; message: string }) => {
    const res = await fetch('/api/tickets', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse<SupportTicket>(res);
  },

  replyTicket: async (ticketId: string, message: string) => {
    const res = await fetch(`/api/tickets/${ticketId}/reply`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ message }),
    });
    return handleResponse<SupportTicket>(res);
  },

  updateTicketStatus: async (ticketId: string, status: string, priority?: string) => {
    const res = await fetch(`/api/tickets/${ticketId}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, priority }),
    });
    return handleResponse<SupportTicket>(res);
  },

  // Announcements
  getAnnouncements: async () => {
    const res = await fetch('/api/announcements');
    return handleResponse<Announcement[]>(res);
  },

  createAnnouncement: async (payload: { title: string; content: string; type: string; linkUrl?: string }) => {
    const res = await fetch('/api/announcements', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse<Announcement>(res);
  },

  deleteAnnouncement: async (id: string) => {
    const res = await fetch(`/api/announcements/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse<{ success: boolean }>(res);
  },

  // Settings
  getSettings: async () => {
    const res = await fetch('/api/settings');
    return handleResponse<SiteSettings>(res);
  },

  updateSettings: async (payload: Partial<SiteSettings>) => {
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse<SiteSettings>(res);
  },

  // Coupons Admin
  getCoupons: async () => {
    const res = await fetch('/api/coupons', {
      headers: getAuthHeaders(),
    });
    return handleResponse<Coupon[]>(res);
  },

  createCoupon: async (payload: { code: string; discountPercent: number; maxUses: number; expiresAt: string }) => {
    const res = await fetch('/api/coupons', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse<Coupon>(res);
  },

  deleteCoupon: async (id: string) => {
    const res = await fetch(`/api/coupons/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse<{ success: boolean }>(res);
  },

  // Admin Users & Analytics
  getAdminUsers: async () => {
    const res = await fetch('/api/admin/users', {
      headers: getAuthHeaders(),
    });
    return handleResponse<User[]>(res);
  },

  toggleUserBlock: async (id: string, isBlocked: boolean, role?: string) => {
    const res = await fetch(`/api/admin/users/${id}/block`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ isBlocked, role }),
    });
    return handleResponse<User>(res);
  },

  getAdminStats: async () => {
    const res = await fetch('/api/admin/stats', {
      headers: getAuthHeaders(),
    });
    return handleResponse<{
      totalRevenue: number;
      totalSalesCount: number;
      totalUsersCount: number;
      activeLicensesCount: number;
      pendingVerificationsCount: number;
      openTicketsCount: number;
      recentOrders: Order[];
      recentLogs: AuditLog[];
    }>(res);
  },

  getAdminLogs: async () => {
    const res = await fetch('/api/admin/logs', {
      headers: getAuthHeaders(),
    });
    return handleResponse<AuditLog[]>(res);
  },

  // Redeem Keys
  getRedeemKeys: async () => {
    const res = await fetch('/api/admin/redeem-keys', {
      headers: getAuthHeaders(),
    });
    return handleResponse<RedeemKey[]>(res);
  },

  createRedeemKey: async (payload: {
    productId: string;
    code?: string;
    assignedLicenseKey?: string;
    maxUses?: number;
    validityDays?: number;
    expiryDate?: string;
  }) => {
    const res = await fetch('/api/admin/redeem-keys', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse<RedeemKey>(res);
  },

  deleteRedeemKey: async (id: string) => {
    const res = await fetch(`/api/admin/redeem-keys/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse<{ success: boolean }>(res);
  },

  redeemKey: async (code: string, productId: string) => {
    const res = await fetch('/api/checkout/redeem', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ code, productId }),
    });
    return handleResponse<{ success: boolean; order: Order; license: License }>(res);
  },

  // Notifications
  getNotifications: async () => {
    const res = await fetch('/api/notifications', {
      headers: getAuthHeaders(),
    });
    return handleResponse<{ notifications: UserNotification[]; unreadCount: number }>(res);
  },

  markNotificationRead: async (id: string) => {
    const res = await fetch(`/api/notifications/${id}/read`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });
    return handleResponse<UserNotification>(res);
  },

  markAllNotificationsRead: async () => {
    const res = await fetch('/api/notifications/read-all', {
      method: 'PUT',
      headers: getAuthHeaders(),
    });
    return handleResponse<{ success: boolean }>(res);
  },

  deleteNotification: async (id: string) => {
    const res = await fetch(`/api/notifications/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse<{ success: boolean }>(res);
  },

  sendAdminNotification: async (payload: {
    userId?: string;
    title: string;
    message: string;
    type?: NotificationType;
    linkUrl?: string;
  }) => {
    const res = await fetch('/api/admin/notifications', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse<{ count: number }>(res);
  },

  // Tutorials
  getTutorials: async () => {
    const res = await fetch('/api/tutorials');
    return handleResponse<Tutorial[]>(res);
  },

  createTutorial: async (payload: {
    title: string;
    description?: string;
    videoUrl: string;
    platform?: string;
    category?: string;
    duration?: string;
    thumbnailUrl?: string;
  }) => {
    const res = await fetch('/api/tutorials', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse<Tutorial>(res);
  },

  updateTutorial: async (
    id: string,
    payload: {
      title?: string;
      description?: string;
      videoUrl?: string;
      platform?: string;
      category?: string;
      duration?: string;
      thumbnailUrl?: string;
    }
  ) => {
    const res = await fetch(`/api/tutorials/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse<Tutorial>(res);
  },

  deleteTutorial: async (id: string) => {
    const res = await fetch(`/api/tutorials/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse<{ success: boolean }>(res);
  },

  // Manual Setup Requests
  getAdminManualSetupRequests: async () => {
    const res = await fetch('/api/admin/manual-setup-requests', {
      headers: getAuthHeaders(),
    });
    return handleResponse<ManualSetupRequest[]>(res);
  },

  getUserManualSetupRequests: async () => {
    const res = await fetch('/api/user/manual-setup-requests', {
      headers: getAuthHeaders(),
    });
    return handleResponse<ManualSetupRequest[]>(res);
  },

  createManualSetupRequest: async (payload: {
    licenseId: string;
    productId: string;
    customAnswers: Record<string, string>;
    userPhone?: string;
    hwid?: string;
  }) => {
    const res = await fetch('/api/manual-setup-requests', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse<ManualSetupRequest>(res);
  },

  updateManualSetupRequestStatus: async (id: string, status: ManualSetupStatus, adminNote?: string) => {
    const res = await fetch(`/api/admin/manual-setup-requests/${id}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, adminNote }),
    });
    return handleResponse<ManualSetupRequest>(res);
  },

  deleteManualSetupRequest: async (id: string) => {
    const res = await fetch(`/api/admin/manual-setup-requests/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse<{ success: boolean }>(res);
  },
};
