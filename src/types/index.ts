export type UserRole = 'ADMIN' | 'CUSTOMER';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  role: UserRole;
  isVerified: boolean;
  isBlocked: boolean;
  hwid?: string;
  hwidLocked?: boolean;
  hwidSetAt?: string;
  createdAt: string;
  lastLoginAt?: string;
}

export type BillingType = 'ONE_TIME' | 'SUBSCRIPTION' | 'PERMANENT';
export type DurationUnit = 'DAYS' | 'MONTHS' | 'YEARS' | 'LIFETIME';
export type ProductStatus = 'ACTIVE' | 'HIDDEN' | 'DISABLED';

export type SubscriptionTier = 'BASIC' | 'STANDARD' | 'PRO' | 'ULTRA' | 'ENTERPRISE' | 'FAMILY' | 'INDIVIDUAL';
export type ResourceType = 'ACCOUNT_CREDENTIALS' | 'LICENSE_KEY' | 'INVITE_LINK' | 'INSTALLER_BUILD' | 'API_KEY';

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  subscriptionTier?: SubscriptionTier | string;
  resourceType?: ResourceType | string;
  shortDescription: string;
  longDescription: string;
  image: string;
  gallery: string[];
  price: number; // e.g., in BDT / USD
  salePrice?: number;
  billingType: BillingType;
  durationValue: number; // e.g. 30
  durationUnit: DurationUnit; // e.g. 'DAYS'
  durationText?: string; // e.g. '1 Month', 'Permanent / Lifetime', '1 Year'
  maintenanceFee: number; // maintenance cost
  maintenanceIntervalDays: number; // e.g. 30
  renewPrice: number;
  downloadUrl: string;
  fileSize: string; // e.g. '24.5 MB'
  version: string; // e.g. 'v3.4.2'
  changelog: string;
  maxDevices: number;
  hwidLock: boolean;
  autoActivation: boolean;
  featured: boolean;
  popular: boolean;
  newBadge: boolean;
  displayOrder: number;
  status: ProductStatus;
  features: string[];
  seoTitle?: string;
  seoDescription?: string;
  manualSetupRequired?: boolean;
  setupCustomFields?: { id: string; label: string; placeholder?: string; required?: boolean }[];
  setupExternalLink?: string;
  setupExternalLinkLabel?: string;
  tutorialVideoUrl?: string;
  tutorialId?: string;
  maintenanceFeeEnabled?: boolean;
  maintenanceFeeAmount?: number;
  maintenanceFeePeriodDays?: number;
  maintenanceFeeNoticeDays?: number;
  createdAt: string;
  updatedAt: string;
}

export type ManualSetupStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED';

export interface ManualSetupRequest {
  id: string;
  requestNumber: string;
  userId: string;
  userEmail: string;
  userName: string;
  userPhone?: string;
  productId: string;
  productName: string;
  licenseId: string;
  licenseKey: string;
  hwid?: string;
  customAnswers: Record<string, string>;
  status: ManualSetupStatus;
  adminNote?: string;
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
export type PaymentMethod = 'BKASH' | 'NAGAD' | 'ROCKET' | 'MANUAL_BANK' | 'CRYPTO';

export interface Order {
  id: string;
  orderNumber: string; // e.g., 'APX-98231'
  userId: string;
  userEmail: string;
  userName: string;
  productId: string;
  productName: string;
  amount: number;
  discountAmount: number;
  couponCode?: string;
  finalAmount: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  transactionId: string;
  accountNumber?: string; // Sender phone or account
  paymentProofUrl?: string; // Screenshot link or base64
  adminNote?: string;
  licenseId?: string;
  createdAt: string;
  updatedAt: string;
}

export type LicenseStatus = 'ACTIVE' | 'EXPIRED' | 'SUSPENDED';

export interface License {
  id: string;
  licenseKey: string; // e.g., 'APEX-88F2-9901-XK92-PRO'
  userId: string;
  userEmail: string;
  userName: string;
  productId: string;
  productName: string;
  activationDate: string;
  expiryDate: string; // ISO date or 'LIFETIME'
  maintenanceDate: string; // Next maintenance due date
  renewDate?: string;
  maxDevices: number;
  hwidLock: boolean;
  currentHwid?: string;
  activeDeviceName?: string;
  status: LicenseStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type DownloadAccessType = 'GLOBAL' | 'MEMBERS_ONLY';

export interface DownloadRelease {
  id: string;
  productId: string;
  productName: string;
  version: string;
  fileSize: string;
  fileUrl: string;
  changelog: string;
  releaseDate: string;
  isLatest: boolean;
  downloadCount: number;
  accessType?: DownloadAccessType; // 'GLOBAL' or 'MEMBERS_ONLY'
}

export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export interface TicketMessage {
  id: string;
  ticketId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  message: string;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string; // e.g. 'TCK-4012'
  userId: string;
  userName: string;
  userEmail: string;
  category: string; // e.g. 'License Issue', 'Payment Verification', 'HWID Reset', 'Software Bug'
  subject: string;
  priority: TicketPriority;
  status: TicketStatus;
  messages: TicketMessage[];
  createdAt: string;
  updatedAt: string;
}

export type AnnouncementType = 'BANNER' | 'POPUP' | 'DASHBOARD_NOTICE';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: AnnouncementType;
  targetRole?: 'ALL' | 'CUSTOMER';
  isActive: boolean;
  linkUrl?: string;
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string; // e.g. 'BOOST20'
  discountPercent: number; // e.g. 20
  discountFixed?: number;
  maxUses: number;
  usedCount: number;
  isActive: boolean;
  expiresAt: string;
}

export interface RedeemKey {
  id: string;
  code: string; // e.g. 'DUDE-9X21-A87F'
  productId: string;
  productName: string;
  assignedLicenseKey?: string;
  maxUses: number;
  usedCount: number;
  validityDays?: number;
  expiryDate?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Referral {
  id: string;
  referrerUserId: string;
  referredUserId: string;
  referredUserEmail: string;
  commissionEarned: number;
  status: 'PENDING' | 'PAID';
  createdAt: string;
}

export interface SiteSettings {
  siteName: string;
  siteTagline: string;
  supportEmail: string;
  telegramChannel: string;
  discordUrl: string;
  bkashNumber: string;
  bkashType: string; // Personal or Merchant
  nagadNumber: string;
  nagadType: string;
  rocketNumber: string;
  rocketType: string;
  bankDetails: string;
  cryptoWallet: string;
  maintenanceMode: boolean;
  noticeText: string;
  currencySymbol: string; // e.g. '৳' or '$'
  currencyCode: string; // 'BDT' or 'USD'
  promoPrefix: string; // Add this field
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  displayOrder: number;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  action: string;
  actorEmail: string;
  details: string;
  ipAddress?: string;
  createdAt: string;
}

export type NotificationType = 'LICENSE_ACTIVATED' | 'PAYMENT_STATUS' | 'SECURITY' | 'SYSTEM' | 'MAINTENANCE_DUE';

export interface UserNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  linkUrl?: string;
  createdAt: string;
}

export type VideoPlatform = 'YOUTUBE' | 'FACEBOOK' | 'VIMEO' | 'TIKTOK' | 'OTHER';

export interface Tutorial {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  platform: VideoPlatform;
  category: string;
  thumbnailUrl?: string;
  duration?: string;
  createdAt: string;
}
