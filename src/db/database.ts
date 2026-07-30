import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { syncToFirestore } from '../lib/firestoreSync.js';
import {
  User,
  Product,
  Order,
  License,
  DownloadRelease,
  SupportTicket,
  Announcement,
  Coupon,
  Referral,
  SiteSettings,
  AuditLog,
  Category,
  RedeemKey,
  UserNotification,
  Tutorial,
  ManualSetupRequest,
  ManualSetupStatus
} from '../types/index.js';

interface DatabaseSchema {
  users: User[];
  passwords: Record<string, string>; // userId -> hashedPassword
  products: Product[];
  categories: Category[];
  orders: Order[];
  licenses: License[];
  downloads: DownloadRelease[];
  tickets: SupportTicket[];
  announcements: Announcement[];
  coupons: Coupon[];
  redeemKeys: RedeemKey[];
  referrals: Referral[];
  settings: SiteSettings;
  logs: AuditLog[];
  notifications: UserNotification[];
  tutorials: Tutorial[];
  manualSetupRequests: ManualSetupRequest[];
}

const isVercel = Boolean(process.env.VERCEL);
const DB_DIR = isVercel ? '/tmp/data' : path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');

const defaultSettings: SiteSettings = {
  siteName: 'Dude Corporation',
  siteTagline: 'Instant Digital Subscriptions, Software Licenses & Game Utilities',
  supportEmail: 'support@dudecorp.com',
  telegramChannel: 'https://t.me/apexboost_official',
  discordUrl: 'https://discord.gg/apexboost',
  bkashNumber: '01700112233',
  bkashType: 'Personal / Send Money',
  nagadNumber: '01800112233',
  nagadType: 'Personal / Send Money',
  rocketNumber: '01900112233',
  rocketType: 'Personal / Send Money',
  bankDetails: 'Bank: Dutch-Bangla Bank Ltd | AC: 102.120.98231 | Branch: Dhaka',
  cryptoWallet: 'USDT (TRC20): T9zXX...ApexBoostMasterWallet',
  maintenanceMode: false,
  noticeText: '⚡ Instant bKash & Nagad auto-activation for Streaming, AI Tools, VPNs, Software Keys & Game Boosters!',
  currencySymbol: '৳',
  currencyCode: 'BDT',
};

const defaultCategories: Category[] = [
  { id: 'cat_1', name: 'Streaming & Entertainment', slug: 'streaming-entertainment', description: 'Netflix, Spotify, Prime Video & Streaming tools', displayOrder: 1, createdAt: new Date().toISOString() },
  { id: 'cat_2', name: 'AI & Productivity', slug: 'ai-productivity', description: 'ChatGPT Plus, Midjourney, Claude & AI tools', displayOrder: 2, createdAt: new Date().toISOString() },
  { id: 'cat_3', name: 'VPN & Cyber Security', slug: 'vpn-cyber-security', description: 'NordVPN, ExpressVPN & Security Tools', displayOrder: 3, createdAt: new Date().toISOString() },
  { id: 'cat_4', name: 'Software & OS Keys', slug: 'software-os-keys', description: 'Windows 11 Pro, Office 365 & Software Licenses', displayOrder: 4, createdAt: new Date().toISOString() },
  { id: 'cat_5', name: 'Gaming & Boosters', slug: 'gaming-boosters', description: 'ApexBoost Pro, FPS Boosters & Game Utilities', displayOrder: 5, createdAt: new Date().toISOString() },
];

function ensureDbExists(): DatabaseSchema {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
  } catch (e) {
    console.warn('Could not create DB_DIR:', e);
  }

  if (fs.existsSync(DB_FILE)) {
    try {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (
        parsed &&
        Array.isArray(parsed.users) &&
        parsed.users.length > 0 &&
        parsed.passwords &&
        typeof parsed.passwords === 'object'
      ) {
        if (!parsed.settings) parsed.settings = defaultSettings;
        if (!parsed.categories || parsed.categories.length === 0) parsed.categories = defaultCategories;
        if (!parsed.products) parsed.products = [];
        if (!parsed.orders) parsed.orders = [];
        if (!parsed.licenses) parsed.licenses = [];
        if (!parsed.downloads) parsed.downloads = [];
        if (!parsed.tickets) parsed.tickets = [];
        if (!parsed.announcements) parsed.announcements = [];
        if (!parsed.coupons) parsed.coupons = [];
        if (!parsed.redeemKeys) parsed.redeemKeys = [];
        if (!parsed.referrals) parsed.referrals = [];
        if (!parsed.logs) parsed.logs = [];
        if (!parsed.notifications) parsed.notifications = [];
        if (!parsed.tutorials) parsed.tutorials = [];
        if (!parsed.manualSetupRequests) parsed.manualSetupRequests = [];
        return parsed as DatabaseSchema;
      }
    } catch (e) {
      console.error('Failed to parse database, generating new database state', e);
    }
  }

  // Seed default dataset
  const adminId = 'usr_admin_001';
  const customerId = 'usr_cust_001';

  const defaultUsers: User[] = [
    {
      id: adminId,
      name: 'System Admin',
      email: 'admin@apexboost.io',
      phone: '+8801700000000',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      role: 'ADMIN',
      isVerified: true,
      isBlocked: false,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    },
    {
      id: customerId,
      name: 'Tanvir Hossain',
      email: 'user@apexboost.io',
      phone: '+8801800000000',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
      role: 'CUSTOMER',
      isVerified: true,
      isBlocked: false,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    },
  ];

  const adminHash = bcrypt.hashSync('admin123', 10);
  const customerHash = bcrypt.hashSync('user123', 10);

  const defaultPasswords: Record<string, string> = {
    [adminId]: adminHash,
    [customerId]: customerHash,
  };

  const defaultProducts: Product[] = [
    {
      id: 'prod_001',
      name: 'Netflix Premium 4K UHD (1-Month)',
      slug: 'netflix-premium-4k-1-month',
      category: 'Streaming & Entertainment',
      subscriptionTier: 'ULTRA',
      resourceType: 'ACCOUNT_CREDENTIALS',
      shortDescription: 'Private/Shared 4K Ultra HD Ultra-fast Netflix subscription with full warranty.',
      longDescription: 'Get 30 days instant 4K UHD Netflix access. Compatible with TV, Mobile, PC, and Tablet. Comes with full auto-renewal support and instant credential delivery upon bKash/Nagad payment.',
      image: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&q=80&w=800',
      gallery: ['https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&q=80&w=800'],
      price: 450,
      salePrice: 350,
      billingType: 'SUBSCRIPTION',
      durationValue: 30,
      durationUnit: 'DAYS',
      maintenanceFee: 0,
      maintenanceIntervalDays: 30,
      renewPrice: 350,
      downloadUrl: '',
      fileSize: 'N/A',
      version: '4K Ultra HD',
      changelog: 'Direct profile credentials delivered with PIN protection.',
      maxDevices: 1,
      hwidLock: false,
      autoActivation: true,
      featured: true,
      popular: true,
      newBadge: true,
      displayOrder: 1,
      status: 'ACTIVE',
      features: [
        '4K Ultra HD + HDR Streaming Quality',
        '30 Days Guaranteed Service Warranty',
        'TV, Mobile, PC & Laptop Compatible',
        'Instant Credential Delivery',
        '24/7 Dedicated Support',
      ],
      seoTitle: 'Buy Netflix Premium 4K UHD Subscription Bangladesh',
      seoDescription: 'Buy cheap Netflix Premium 4K account in BD with bKash, Nagad & Rocket.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'prod_002',
      name: 'ChatGPT Plus Private Account (1-Month)',
      slug: 'chatgpt-plus-private-account',
      category: 'AI & Productivity',
      subscriptionTier: 'PRO',
      resourceType: 'ACCOUNT_CREDENTIALS',
      shortDescription: 'GPT-4o, OpenAI o1, Canvas, Sora access, and DALL-E 3 image generation.',
      longDescription: 'Full 1-Month subscription to official ChatGPT Plus on your own email or private account. Instant access to custom GPTs, advanced web search, reasoning models, and voice interface.',
      image: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&q=80&w=800',
      gallery: ['https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&q=80&w=800'],
      price: 2500,
      salePrice: 2200,
      billingType: 'SUBSCRIPTION',
      durationValue: 30,
      durationUnit: 'DAYS',
      maintenanceFee: 0,
      maintenanceIntervalDays: 30,
      renewPrice: 2200,
      downloadUrl: '',
      fileSize: 'N/A',
      version: 'ChatGPT Plus v4.0',
      changelog: 'Includes GPT-4o, o1-preview, and Sora early preview access.',
      maxDevices: 3,
      hwidLock: false,
      autoActivation: true,
      featured: true,
      popular: true,
      newBadge: true,
      displayOrder: 2,
      status: 'ACTIVE',
      features: [
        'Access to GPT-4o & OpenAI o1 Reasoning',
        'DALL-E 3 High-Res Image Generator',
        'Data Analysis & Python Code Interpreter',
        'Custom GPTs & Memory Persistence',
        'Fastest Priority Response Rate',
      ],
      seoTitle: 'ChatGPT Plus Subscription BD - Buy OpenAI Account',
      seoDescription: 'Buy ChatGPT Plus subscription in BD using bKash, Nagad or Rocket.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'prod_003',
      name: 'NordVPN Ultra Security (1-Year Key)',
      slug: 'nordvpn-ultra-security-1-year',
      category: 'VPN & Cyber Security',
      subscriptionTier: 'ULTRA',
      resourceType: 'LICENSE_KEY',
      shortDescription: 'High-speed encrypted VPN with 6000+ global servers & Threat Protection.',
      longDescription: 'Protect your internet privacy, bypass ISP throttling, unblock international streaming catalogs, and secure public Wi-Fi networks with NordVPN Ultra 1-Year license.',
      image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=800',
      gallery: ['https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=800'],
      price: 1200,
      salePrice: 450,
      billingType: 'SUBSCRIPTION',
      durationValue: 365,
      durationUnit: 'DAYS',
      maintenanceFee: 0,
      maintenanceIntervalDays: 365,
      renewPrice: 450,
      downloadUrl: 'https://nordvpn.com/download',
      fileSize: '45 MB',
      version: 'v7.12.0',
      changelog: 'NordLynx WireGuard protocol update.',
      maxDevices: 6,
      hwidLock: false,
      autoActivation: true,
      featured: false,
      popular: true,
      newBadge: false,
      displayOrder: 3,
      status: 'ACTIVE',
      features: [
        '6000+ Fast Servers in 111 Countries',
        'NordLynx Ultra-Fast WireGuard Speed',
        'Built-in Malware & Threat Protection',
        'Unblock Netflix US, Hulu, BBC iPlayer',
        'Supports Windows, Mac, Android, iOS',
      ],
      seoTitle: 'NordVPN BD Buy - Cheap 1-Year Subscription Key',
      seoDescription: 'Buy NordVPN license key in Bangladesh at lowest price.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'prod_004',
      name: 'Canva Pro Lifetime License (Edu/Team)',
      slug: 'canva-pro-lifetime-license',
      category: 'Software & Productivity',
      subscriptionTier: 'PRO',
      resourceType: 'INVITE_LINK',
      shortDescription: 'Unlimited graphic design assets, AI Magic Studio & background remover.',
      longDescription: 'Upgrade your personal email to Canva Pro status. Access 100M+ premium stock photos, video templates, Magic Resize, Brand Kits, and AI Magic Eraser.',
      image: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&q=80&w=800',
      gallery: ['https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&q=80&w=800'],
      price: 990,
      salePrice: 290,
      billingType: 'PERMANENT',
      durationValue: 3650,
      durationUnit: 'LIFETIME',
      maintenanceFee: 0,
      maintenanceIntervalDays: 3650,
      renewPrice: 290,
      downloadUrl: 'https://canva.com',
      fileSize: 'Web App',
      version: 'Pro Enterprise',
      changelog: 'Added Magic Studio AI vector suite.',
      maxDevices: 5,
      hwidLock: false,
      autoActivation: true,
      featured: true,
      popular: true,
      newBadge: false,
      displayOrder: 4,
      status: 'ACTIVE',
      features: [
        '100M+ Premium Stock Photos & Videos',
        '1-Click AI Background Remover',
        'Canva Magic Studio & AI Writer',
        'Custom Brand Kit Fonts & Logos',
        'Upgrade on your existing personal account',
      ],
      seoTitle: 'Canva Pro Lifetime Subscription BD Price',
      seoDescription: 'Buy Canva Pro subscription in Bangladesh using bKash or Nagad.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'prod_005',
      name: 'ApexBoost Pro Ultimate Game Optimizer',
      slug: 'apexboost-pro-ultimate',
      category: 'Gaming & Boosters',
      subscriptionTier: 'PRO',
      resourceType: 'INSTALLER_BUILD',
      shortDescription: 'Low-level Kernel FPS Optimizer & RAM Cleaner for competitive gaming.',
      longDescription: 'ApexBoost Pro Ultimate combines low-level Windows kernel optimization, custom registry tweaks, real-time CPU thread unparking, dynamic memory compaction, and direct network TCP stack tuning for 240+ FPS competitive gaming.',
      image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800',
      gallery: ['https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800'],
      price: 1500,
      salePrice: 1200,
      billingType: 'SUBSCRIPTION',
      durationValue: 30,
      durationUnit: 'DAYS',
      maintenanceFee: 100,
      maintenanceIntervalDays: 30,
      renewPrice: 1000,
      downloadUrl: '/downloads/ApexBoost_Pro_v3.4.2_Installer.exe',
      fileSize: '28.4 MB',
      version: 'v3.4.2',
      changelog: 'Valorant Vanguard & CS2 zero-jitter kernel updates.',
      maxDevices: 1,
      hwidLock: true,
      autoActivation: true,
      featured: true,
      popular: true,
      newBadge: false,
      displayOrder: 5,
      status: 'ACTIVE',
      features: [
        'Low-Level Kernel FPS Optimizer',
        'Real-time CPU Unparking & Core Isolation',
        'Zero-Latency RAM Compaction (Auto-Clean)',
        'Registry Latency & Input Lag Tweak',
        'Vanguard & EasyAntiCheat 100% Safe Mode',
      ],
      seoTitle: 'ApexBoost Pro Ultimate - Best Game Optimizer 2026',
      seoDescription: 'Boost FPS by up to 60%, reduce input latency, and remove frame drops safely with ApexBoost Pro.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'prod_006',
      name: 'Windows 11 Pro Lifetime Retail Key',
      slug: 'windows-11-pro-lifetime-retail-key',
      category: 'Software & OS Keys',
      subscriptionTier: 'STANDARD',
      resourceType: 'LICENSE_KEY',
      shortDescription: 'Official Microsoft Windows 11 Professional 32/64-Bit lifetime digital license key.',
      longDescription: 'Genuine online digital activation license key for Windows 11 Professional. Supports re-installation on same PC and link to Microsoft Account.',
      image: 'https://images.unsplash.com/photo-1624555130581-1891c63c89b7?auto=format&fit=crop&q=80&w=800',
      gallery: ['https://images.unsplash.com/photo-1624555130581-1891c63c89b7?auto=format&fit=crop&q=80&w=800'],
      price: 1500,
      salePrice: 490,
      billingType: 'PERMANENT',
      durationValue: 3650,
      durationUnit: 'LIFETIME',
      maintenanceFee: 0,
      maintenanceIntervalDays: 3650,
      renewPrice: 490,
      downloadUrl: 'https://www.microsoft.com/software-download/windows11',
      fileSize: 'ISO Tool',
      version: 'Win 11 Pro 24H2',
      changelog: 'Official Microsoft retail key.',
      maxDevices: 1,
      hwidLock: false,
      autoActivation: true,
      featured: false,
      popular: true,
      newBadge: false,
      displayOrder: 6,
      status: 'ACTIVE',
      features: [
        '100% Genuine Microsoft Digital License',
        'Lifetime Validity with Re-installation support',
        'BitLocker Drive Encryption Enabled',
        'Supports All Languages Worldwide',
        'Instant Auto-Activation Key Delivery',
      ],
      seoTitle: 'Buy Windows 11 Pro Key BD - Cheap Original License',
      seoDescription: 'Buy original Windows 11 Pro product key in BD with bKash and Nagad.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const defaultLicenses: License[] = [
    {
      id: 'lic_001',
      licenseKey: 'APEX-88F2-9901-XK92-PRO',
      userId: customerId,
      userEmail: 'user@apexboost.io',
      userName: 'Tanvir Hossain',
      productId: 'prod_001',
      productName: 'ApexBoost Pro Ultimate',
      activationDate: new Date().toISOString(),
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      maintenanceDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
      renewDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      maxDevices: 1,
      hwidLock: true,
      currentHwid: 'HWID-BFEBFBFF000906EA-80001292',
      activeDeviceName: 'DESKTOP-APEX991 (Intel i9-14900K)',
      status: 'ACTIVE',
      notes: 'Activated automatically upon bKash payment verification.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const defaultOrders: Order[] = [
    {
      id: 'ord_001',
      orderNumber: 'APX-98231',
      userId: customerId,
      userEmail: 'user@apexboost.io',
      userName: 'Tanvir Hossain',
      productId: 'prod_001',
      productName: 'ApexBoost Pro Ultimate',
      amount: 1500,
      discountAmount: 300,
      couponCode: 'BOOST20',
      finalAmount: 1200,
      status: 'APPROVED',
      paymentMethod: 'BKASH',
      transactionId: 'BK98X7721A0',
      accountNumber: '01711223344',
      adminNote: 'Payment verified via bKash TrxID.',
      licenseId: 'lic_001',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const defaultDownloads: DownloadRelease[] = [
    {
      id: 'dl_001',
      productId: 'prod_001',
      productName: 'ApexBoost Pro Ultimate',
      version: 'v3.4.2',
      fileSize: '28.4 MB',
      fileUrl: 'https://cdn.example.com/downloads/ApexBoost_Pro_v3.4.2_Installer.exe',
      changelog: 'Added Intel 14th gen P-Core/E-Core scheduling optimization & CS2 frame-pacing fix.',
      releaseDate: '2026-07-20',
      isLatest: true,
      downloadCount: 1420,
      accessType: 'MEMBERS_ONLY',
    },
    {
      id: 'dl_002',
      productId: 'global',
      productName: 'ApexBoost System Cleaner & HWID Checker (Global Tool)',
      version: 'v1.2.0',
      fileSize: '8.5 MB',
      fileUrl: 'https://cdn.example.com/downloads/ApexBoost_HWID_Checker.exe',
      changelog: 'Free global diagnostic utility for all users to check system compatibility and HWID.',
      releaseDate: '2026-07-25',
      isLatest: true,
      downloadCount: 3450,
      accessType: 'GLOBAL',
    },
    {
      id: 'dl_003',
      productId: 'prod_003',
      productName: 'NordVPN Ultra Security (1-Year Key)',
      version: 'v7.12.0',
      fileSize: '45.0 MB',
      fileUrl: 'https://nordvpn.com/download',
      changelog: 'Official NordLynx protocol Windows & macOS installer build.',
      releaseDate: '2026-07-15',
      isLatest: true,
      downloadCount: 920,
      accessType: 'MEMBERS_ONLY',
    },
  ];

  const defaultTickets: SupportTicket[] = [
    {
      id: 'tck_001',
      ticketNumber: 'TCK-4012',
      userId: customerId,
      userName: 'Tanvir Hossain',
      userEmail: 'user@apexboost.io',
      category: 'HWID Reset',
      subject: 'Replaced Motherboard - Need HWID Reset',
      priority: 'HIGH',
      status: 'RESOLVED',
      messages: [
        {
          id: 'msg_001',
          ticketId: 'tck_001',
          senderId: customerId,
          senderName: 'Tanvir Hossain',
          senderRole: 'CUSTOMER',
          message: 'Hello Team, I upgraded my motherboard from ASUS B660 to ROG Z790. Now ApexBoost says HWID Mismatch. Please reset my registered HWID.',
          createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        },
        {
          id: 'msg_002',
          ticketId: 'tck_001',
          senderId: adminId,
          senderName: 'System Admin',
          senderRole: 'ADMIN',
          message: 'Hello Tanvir! Your HWID lock has been successfully reset. You can now launch ApexBoost on your new PC.',
          createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
        },
      ],
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    },
  ];

  const defaultAnnouncements: Announcement[] = [
    {
      id: 'anc_001',
      title: '🔥 ApexBoost v3.4.2 Kernel Patch Live!',
      content: 'All subscribers receive automatic Vanguard Anti-Cheat stealth hooks and zero-latency RAM cleaner updates.',
      type: 'BANNER',
      targetRole: 'ALL',
      isActive: true,
      linkUrl: '/downloads',
      createdAt: new Date().toISOString(),
    },
  ];

  const defaultCoupons: Coupon[] = [
    {
      id: 'cpn_001',
      code: 'BOOST20',
      discountPercent: 20,
      maxUses: 100,
      usedCount: 1,
      isActive: true,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'cpn_002',
      code: 'APEX50',
      discountPercent: 50,
      maxUses: 20,
      usedCount: 0,
      isActive: true,
      expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  const defaultLogs: AuditLog[] = [
    {
      id: 'log_001',
      action: 'INITIALIZE_SYSTEM',
      actorEmail: 'admin@apexboost.io',
      details: 'Database seeded with default ApexBoost SaaS schema.',
      createdAt: new Date().toISOString(),
    },
  ];

  const defaultTutorials: Tutorial[] = [
    {
      id: 'tut_001',
      title: 'How to Redeem Product License Key & Activate Software',
      description: 'Step-by-step video guide on redeeming your purchased license code and linking it to your customer account.',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      platform: 'YOUTUBE',
      category: 'License Activation',
      duration: '03:45',
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
    {
      id: 'tut_002',
      title: 'HWID Reset & Hardware Replacement Guide',
      description: 'Learn how to reset your registered Hardware ID when switching motherboards, GPUs, or upgrading your computer.',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      platform: 'YOUTUBE',
      category: 'HWID Management',
      duration: '02:15',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: 'tut_003',
      title: 'bKash & Nagad Payment Verification Video Tutorial',
      description: 'Complete walkthrough on entering your bKash/Nagad Transaction ID to get instant automated license key delivery.',
      videoUrl: 'https://www.facebook.com/watch/?v=101582234000',
      platform: 'FACEBOOK',
      category: 'Payment Guide',
      duration: '04:10',
      createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    },
  ];

  const initialSchema: DatabaseSchema = {
    users: defaultUsers,
    passwords: defaultPasswords,
    products: defaultProducts,
    categories: defaultCategories,
    orders: defaultOrders,
    licenses: defaultLicenses,
    downloads: defaultDownloads,
    tickets: defaultTickets,
    announcements: defaultAnnouncements,
    coupons: defaultCoupons,
    referrals: [],
    settings: defaultSettings,
    logs: defaultLogs,
    redeemKeys: [],
    notifications: [],
    tutorials: defaultTutorials,
    manualSetupRequests: [],
  };

  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(initialSchema, null, 2), 'utf-8');
  } catch (e) {
    console.warn('Could not write initial schema to file system:', e);
  }
  return initialSchema;
}

let dbCache = ensureDbExists();

export function saveDb() {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(dbCache, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Failed to save DB file to disk:', err);
  }
}

export const db = {
  get state() {
    return dbCache;
  },
  // Users
  getUsers: () => dbCache.users,
  getUserById: (id: string) => dbCache.users.find((u) => u.id === id),
  getUserByEmail: (email: string) => dbCache.users.find((u) => u.email.toLowerCase() === email.toLowerCase()),
  createUser: (user: User, passwordHash: string) => {
    dbCache.users.push(user);
    dbCache.passwords[user.id] = passwordHash;
    saveDb();
    return user;
  },
  updateUser: (id: string, updates: Partial<User>) => {
    const idx = dbCache.users.findIndex((u) => u.id === id);
    if (idx !== -1) {
      dbCache.users[idx] = { ...dbCache.users[idx], ...updates };
      saveDb();
      return dbCache.users[idx];
    }
    return null;
  },
  getUserPasswordHash: (id: string) => dbCache.passwords[id],
  setUserPasswordHash: (id: string, passwordHash: string) => {
    dbCache.passwords[id] = passwordHash;
    saveDb();
  },

  // Products
  getProducts: () =>
    dbCache.products.map((p) => ({
      ...p,
      subscriptionTier: p.subscriptionTier || 'PRO',
      resourceType: p.resourceType || 'LICENSE_KEY',
    })),
  getProductById: (id: string) => {
    const p = dbCache.products.find((p) => p.id === id);
    if (!p) return undefined;
    return {
      ...p,
      subscriptionTier: p.subscriptionTier || 'PRO',
      resourceType: p.resourceType || 'LICENSE_KEY',
    };
  },
  getProductBySlug: (slug: string) => {
    const p = dbCache.products.find((p) => p.slug === slug);
    if (!p) return undefined;
    return {
      ...p,
      subscriptionTier: p.subscriptionTier || 'PRO',
      resourceType: p.resourceType || 'LICENSE_KEY',
    };
  },
  createProduct: (product: Product) => {
    dbCache.products.push(product);
    saveDb();
    return product;
  },
  updateProduct: (id: string, updates: Partial<Product>) => {
    const idx = dbCache.products.findIndex((p) => p.id === id);
    if (idx !== -1) {
      dbCache.products[idx] = { ...dbCache.products[idx], ...updates, updatedAt: new Date().toISOString() };
      saveDb();
      return dbCache.products[idx];
    }
    return null;
  },
  deleteProduct: (id: string) => {
    dbCache.products = dbCache.products.filter((p) => p.id !== id);
    saveDb();
  },

  // Orders
  getOrders: () => dbCache.orders,
  getOrderById: (id: string) => dbCache.orders.find((o) => o.id === id),
  getOrdersByUserId: (userId: string) => dbCache.orders.filter((o) => o.userId === userId),
  createOrder: (order: Order) => {
    dbCache.orders.unshift(order);
    
    // Auto-notify user of new order status
    if (!dbCache.notifications) dbCache.notifications = [];
    dbCache.notifications.unshift({
      id: 'ntf_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      userId: order.userId,
      title: order.status === 'APPROVED' ? 'Order Approved & License Active' : 'Order Submitted - Payment Pending',
      message: order.status === 'APPROVED' 
        ? `Order #${order.orderNumber} for ${order.productName} has been approved and activated.`
        : `Order #${order.orderNumber} for ${order.productName} received. Verification in progress.`,
      type: order.status === 'APPROVED' ? 'LICENSE_ACTIVATED' : 'PAYMENT_STATUS',
      isRead: false,
      linkUrl: '/dashboard',
      createdAt: new Date().toISOString(),
    });

    saveDb();
    return order;
  },
  updateOrder: (id: string, updates: Partial<Order>) => {
    const idx = dbCache.orders.findIndex((o) => o.id === id);
    if (idx !== -1) {
      const prevOrder = dbCache.orders[idx];
      dbCache.orders[idx] = { ...dbCache.orders[idx], ...updates, updatedAt: new Date().toISOString() };
      const updatedOrder = dbCache.orders[idx];

      // Notify on status change
      if (updates.status && updates.status !== prevOrder.status) {
        if (!dbCache.notifications) dbCache.notifications = [];
        if (updates.status === 'APPROVED') {
          dbCache.notifications.unshift({
            id: 'ntf_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
            userId: updatedOrder.userId,
            title: 'Payment Verified & License Active',
            message: `Your payment for Order #${updatedOrder.orderNumber} (${updatedOrder.productName}) was approved! Your product subscription is active now.`,
            type: 'LICENSE_ACTIVATED',
            isRead: false,
            linkUrl: '/dashboard',
            createdAt: new Date().toISOString(),
          });
        } else if (updates.status === 'REJECTED') {
          dbCache.notifications.unshift({
            id: 'ntf_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
            userId: updatedOrder.userId,
            title: 'Payment Verification Update',
            message: `Order #${updatedOrder.orderNumber} payment could not be verified. Please check admin notes or submit a support ticket.`,
            type: 'PAYMENT_STATUS',
            isRead: false,
            linkUrl: '/dashboard',
            createdAt: new Date().toISOString(),
          });
        }
      }

      saveDb();
      return dbCache.orders[idx];
    }
    return null;
  },

  // Licenses
  getLicenses: () => dbCache.licenses,
  getLicenseById: (id: string) => dbCache.licenses.find((l) => l.id === id),
  getLicensesByUserId: (userId: string) => dbCache.licenses.filter((l) => l.userId === userId),
  getLicenseByKey: (key: string) => dbCache.licenses.find((l) => l.licenseKey.toUpperCase() === key.toUpperCase()),
  createLicense: (license: License) => {
    dbCache.licenses.unshift(license);
    saveDb();
    return license;
  },
  updateLicense: (id: string, updates: Partial<License>) => {
    const idx = dbCache.licenses.findIndex((l) => l.id === id);
    if (idx !== -1) {
      dbCache.licenses[idx] = { ...dbCache.licenses[idx], ...updates, updatedAt: new Date().toISOString() };
      saveDb();
      return dbCache.licenses[idx];
    }
    return null;
  },
  deleteLicense: (id: string) => {
    dbCache.licenses = dbCache.licenses.filter((l) => l.id !== id);
    saveDb();
  },

  // Downloads
  getDownloads: () => dbCache.downloads,
  createDownload: (download: DownloadRelease) => {
    dbCache.downloads.unshift(download);
    saveDb();
    return download;
  },
  updateDownload: (id: string, updates: Partial<DownloadRelease>) => {
    const idx = dbCache.downloads.findIndex((d) => d.id === id);
    if (idx !== -1) {
      dbCache.downloads[idx] = { ...dbCache.downloads[idx], ...updates };
      saveDb();
      return dbCache.downloads[idx];
    }
    return null;
  },
  deleteDownload: (id: string) => {
    dbCache.downloads = dbCache.downloads.filter((d) => d.id !== id);
    saveDb();
  },

  // Support Tickets
  getTickets: () => dbCache.tickets,
  getTicketById: (id: string) => dbCache.tickets.find((t) => t.id === id),
  getTicketsByUserId: (userId: string) => dbCache.tickets.filter((t) => t.userId === userId),
  createTicket: (ticket: SupportTicket) => {
    dbCache.tickets.unshift(ticket);
    saveDb();
    return ticket;
  },
  updateTicket: (id: string, updates: Partial<SupportTicket>) => {
    const idx = dbCache.tickets.findIndex((t) => t.id === id);
    if (idx !== -1) {
      dbCache.tickets[idx] = { ...dbCache.tickets[idx], ...updates, updatedAt: new Date().toISOString() };
      saveDb();
      return dbCache.tickets[idx];
    }
    return null;
  },

  // Announcements
  getAnnouncements: () => dbCache.announcements,
  createAnnouncement: (announcement: Announcement) => {
    dbCache.announcements.unshift(announcement);
    saveDb();
    return announcement;
  },
  updateAnnouncement: (id: string, updates: Partial<Announcement>) => {
    const idx = dbCache.announcements.findIndex((a) => a.id === id);
    if (idx !== -1) {
      dbCache.announcements[idx] = { ...dbCache.announcements[idx], ...updates };
      saveDb();
      return dbCache.announcements[idx];
    }
    return null;
  },
  deleteAnnouncement: (id: string) => {
    dbCache.announcements = dbCache.announcements.filter((a) => a.id !== id);
    saveDb();
  },

  // Coupons
  getCoupons: () => dbCache.coupons,
  getCouponByCode: (code: string) => dbCache.coupons.find((c) => c.code.toUpperCase() === code.toUpperCase() && c.isActive),
  createCoupon: (coupon: Coupon) => {
    dbCache.coupons.push(coupon);
    saveDb();
    return coupon;
  },
  updateCoupon: (id: string, updates: Partial<Coupon>) => {
    const idx = dbCache.coupons.findIndex((c) => c.id === id);
    if (idx !== -1) {
      dbCache.coupons[idx] = { ...dbCache.coupons[idx], ...updates };
      saveDb();
      return dbCache.coupons[idx];
    }
    return null;
  },
  deleteCoupon: (id: string) => {
    dbCache.coupons = dbCache.coupons.filter((c) => c.id !== id);
    saveDb();
  },

  // Settings
  getSettings: () => dbCache.settings,
  updateSettings: (newSettings: Partial<SiteSettings>) => {
    dbCache.settings = { ...dbCache.settings, ...newSettings };
    saveDb();
    return dbCache.settings;
  },

  // Categories
  getCategories: () => (dbCache.categories || []).sort((a, b) => a.displayOrder - b.displayOrder),
  getCategoryById: (id: string) => (dbCache.categories || []).find((c) => c.id === id),
  createCategory: (cat: Category) => {
    if (!dbCache.categories) dbCache.categories = [];
    dbCache.categories.push(cat);
    saveDb();
    return cat;
  },
  updateCategory: (id: string, updates: Partial<Category>) => {
    if (!dbCache.categories) dbCache.categories = [];
    const idx = dbCache.categories.findIndex((c) => c.id === id);
    if (idx !== -1) {
      const oldName = dbCache.categories[idx].name;
      dbCache.categories[idx] = { ...dbCache.categories[idx], ...updates };
      // If category name was updated, update products using this category
      if (updates.name && updates.name !== oldName) {
        dbCache.products.forEach((p) => {
          if (p.category === oldName) {
            p.category = updates.name!;
          }
        });
      }
      saveDb();
      return dbCache.categories[idx];
    }
    return null;
  },
  deleteCategory: (id: string) => {
    if (!dbCache.categories) dbCache.categories = [];
    dbCache.categories = dbCache.categories.filter((c) => c.id !== id);
    saveDb();
    return true;
  },

  // Audit Logs
  getLogs: () => dbCache.logs,
  addLog: (action: string, actorEmail: string, details: string) => {
    const log: AuditLog = {
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      action,
      actorEmail,
      details,
      createdAt: new Date().toISOString(),
    };
    dbCache.logs.unshift(log);
    saveDb();
    return log;
  },

  // Redeem Keys
  getRedeemKeys: () => dbCache.redeemKeys || [],
  createRedeemKey: (key: RedeemKey) => {
    if (!dbCache.redeemKeys) dbCache.redeemKeys = [];
    dbCache.redeemKeys.unshift(key);
    saveDb();
    return key;
  },
  deleteRedeemKey: (id: string) => {
    if (!dbCache.redeemKeys) dbCache.redeemKeys = [];
    dbCache.redeemKeys = dbCache.redeemKeys.filter((k) => k.id !== id);
    saveDb();
    return true;
  },
  redeemKey: (code: string, userId: string, productId: string) => {
    if (!dbCache.redeemKeys) dbCache.redeemKeys = [];
    const formattedCode = code.trim().toUpperCase();
    const key = dbCache.redeemKeys.find((k) => k.code.trim().toUpperCase() === formattedCode && k.isActive);

    if (!key) {
      throw new Error('Invalid or inactive redeem key code.');
    }

    if (key.productId !== productId) {
      throw new Error(`This redeem key is valid ONLY for "${key.productName}", not for the selected product.`);
    }

    if (key.usedCount >= key.maxUses) {
      throw new Error('This redeem key has reached its maximum usage limit.');
    }

    if (key.expiryDate && new Date() > new Date(key.expiryDate)) {
      throw new Error('This redeem key has expired.');
    }

    const user = dbCache.users.find((u) => u.id === userId);
    if (!user) throw new Error('User account not found.');

    const product = dbCache.products.find((p) => p.id === productId);
    if (!product) throw new Error('Product not found.');

    // Increment usage
    key.usedCount += 1;
    if (key.usedCount >= key.maxUses) {
      key.isActive = false;
    }

    // Create approved order
    const orderId = 'ord_' + Date.now();
    const orderNum = 'RDM-' + Math.floor(10000 + Math.random() * 90000);
    const amount = product.salePrice && product.salePrice > 0 ? product.salePrice : product.price;

    const newOrder: Order = {
      id: orderId,
      orderNumber: orderNum,
      userId: user.id,
      userEmail: user.email,
      userName: user.name,
      productId: product.id,
      productName: product.name,
      amount,
      discountAmount: amount, // 100% redeemed via key
      couponCode: `REDEEM:${key.code}`,
      finalAmount: 0,
      status: 'APPROVED',
      paymentMethod: 'BKASH',
      transactionId: `REDEEM-${key.code}`,
      accountNumber: user.phone || 'REDEEM-KEY',
      adminNote: `Auto-approved via Redeem Key ${key.code}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Create license directly
    const licenseId = 'lic_' + Date.now();
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const randPart = (len: number) =>
      Array.from({ length: len }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
    const genKey = `DUDE-${randPart(4)}-${randPart(4)}-${randPart(4)}-PRO`;

    let finalLicenseKey = '';
    if (key.maxUses === 1) {
      finalLicenseKey = key.assignedLicenseKey && key.assignedLicenseKey.trim().length > 0
        ? key.assignedLicenseKey.trim().toUpperCase()
        : genKey;
    } else {
      // For multi-usage redeem keys, leave license key blank until admin manually issues key
      finalLicenseKey = key.assignedLicenseKey && key.assignedLicenseKey.trim().length > 0
        ? key.assignedLicenseKey.trim().toUpperCase()
        : '';
    }

    let expiryDateStr = 'LIFETIME';
    if (product.billingType !== 'PERMANENT' && product.durationUnit !== 'LIFETIME') {
      const d = new Date();
      if (product.durationUnit === 'DAYS') d.setDate(d.getDate() + product.durationValue);
      else if (product.durationUnit === 'MONTHS') d.setMonth(d.getMonth() + product.durationValue);
      else if (product.durationUnit === 'YEARS') d.setFullYear(d.getFullYear() + product.durationValue);
      expiryDateStr = d.toISOString();
    }

    const newLicense: License = {
      id: licenseId,
      licenseKey: finalLicenseKey,
      userId: user.id,
      userEmail: user.email,
      userName: user.name,
      productId: product.id,
      productName: product.name,
      activationDate: new Date().toISOString(),
      expiryDate: expiryDateStr,
      maintenanceDate: new Date().toISOString(),
      maxDevices: product.maxDevices,
      hwidLock: product.hwidLock,
      status: 'ACTIVE',
      notes: finalLicenseKey ? `Activated via Redeem Key ${key.code}` : `Redeemed via Multi-use Key ${key.code} (Pending Admin Key Assignment)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    newOrder.licenseId = newLicense.id;

    dbCache.orders.unshift(newOrder);
    dbCache.licenses.unshift(newLicense);

    const logMsg = `Redeemed key ${key.code} for product ${product.name} by user ${user.email}`;
    const logObj: AuditLog = {
      id: 'log_' + Date.now(),
      action: 'REDEEM_KEY_USED',
      actorEmail: user.email,
      details: logMsg,
      createdAt: new Date().toISOString(),
    };
    dbCache.logs.unshift(logObj);

    if (!dbCache.notifications) dbCache.notifications = [];
    dbCache.notifications.unshift({
      id: 'ntf_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      userId: user.id,
      title: 'Redeem Key Activated!',
      message: `Redeem code "${key.code}" was successfully redeemed for ${product.name}. License key: ${genKey}`,
      type: 'LICENSE_ACTIVATED',
      isRead: false,
      linkUrl: '/dashboard',
      createdAt: new Date().toISOString(),
    });

    saveDb();

    return { order: newOrder, license: newLicense, key };
  },

  // Notifications
  getNotifications: (userId: string) => {
    if (!dbCache.notifications) dbCache.notifications = [];
    let userNotifs = dbCache.notifications.filter((n) => n.userId === userId);

    // If no notifications exist yet for user, generate initial notifications from user's orders, licenses & security logs
    if (userNotifs.length === 0) {
      const userOrders = dbCache.orders.filter((o) => o.userId === userId);
      const userLicenses = dbCache.licenses.filter((l) => l.userId === userId);

      userLicenses.forEach((lic) => {
        dbCache.notifications.unshift({
          id: 'ntf_' + Math.random().toString(36).substr(2, 9),
          userId,
          title: 'License Key Activated',
          message: `Your license for "${lic.productName}" is active and ready. Key: ${lic.licenseKey}`,
          type: 'LICENSE_ACTIVATED',
          isRead: true,
          linkUrl: '/dashboard',
          createdAt: lic.activationDate || new Date().toISOString(),
        });
      });

      userOrders.forEach((ord) => {
        dbCache.notifications.unshift({
          id: 'ntf_' + Math.random().toString(36).substr(2, 9),
          userId,
          title: `Order #${ord.orderNumber} ${ord.status}`,
          message: `Order for ${ord.productName} via ${ord.paymentMethod}. Amount: ৳${ord.finalAmount}`,
          type: 'PAYMENT_STATUS',
          isRead: true,
          linkUrl: '/dashboard',
          createdAt: ord.createdAt || new Date().toISOString(),
        });
      });

      dbCache.notifications.unshift({
        id: 'ntf_' + Math.random().toString(36).substr(2, 9),
        userId,
        title: 'Account Security Active',
        message: 'Your account hardware lock & session security protocols are fully active.',
        type: 'SECURITY',
        isRead: false,
        createdAt: new Date().toISOString(),
      });

      saveDb();
      userNotifs = dbCache.notifications.filter((n) => n.userId === userId);
    }

    return userNotifs;
  },

  createNotification: (notif: UserNotification) => {
    if (!dbCache.notifications) dbCache.notifications = [];
    dbCache.notifications.unshift(notif);
    saveDb();
    return notif;
  },

  markNotificationRead: (id: string, userId: string) => {
    if (!dbCache.notifications) dbCache.notifications = [];
    const idx = dbCache.notifications.findIndex((n) => n.id === id && n.userId === userId);
    if (idx !== -1) {
      dbCache.notifications[idx].isRead = true;
      saveDb();
      return dbCache.notifications[idx];
    }
    return null;
  },

  markAllNotificationsRead: (userId: string) => {
    if (!dbCache.notifications) dbCache.notifications = [];
    let updated = false;
    dbCache.notifications.forEach((n) => {
      if (n.userId === userId && !n.isRead) {
        n.isRead = true;
        updated = true;
      }
    });
    if (updated) saveDb();
    return true;
  },

  deleteNotification: (id: string, userId: string) => {
    if (!dbCache.notifications) dbCache.notifications = [];
    dbCache.notifications = dbCache.notifications.filter((n) => !(n.id === id && n.userId === userId));
    saveDb();
    return true;
  },

  // Tutorials
  getTutorials: () => {
    if (!dbCache.tutorials) dbCache.tutorials = [];
    return dbCache.tutorials;
  },
  getTutorialById: (id: string) => {
    if (!dbCache.tutorials) dbCache.tutorials = [];
    return dbCache.tutorials.find((t) => t.id === id);
  },
  createTutorial: (tut: Tutorial) => {
    if (!dbCache.tutorials) dbCache.tutorials = [];
    dbCache.tutorials.unshift(tut);
    saveDb();
    return tut;
  },
  updateTutorial: (id: string, payload: Partial<Tutorial>) => {
    if (!dbCache.tutorials) dbCache.tutorials = [];
    const idx = dbCache.tutorials.findIndex((t) => t.id === id);
    if (idx !== -1) {
      dbCache.tutorials[idx] = { ...dbCache.tutorials[idx], ...payload };
      saveDb();
      return dbCache.tutorials[idx];
    }
    return null;
  },
  deleteTutorial: (id: string) => {
    if (!dbCache.tutorials) dbCache.tutorials = [];
    dbCache.tutorials = dbCache.tutorials.filter((t) => t.id !== id);
    saveDb();
    return true;
  },

  // Manual Setup Requests
  getManualSetupRequests: () => {
    if (!dbCache.manualSetupRequests) dbCache.manualSetupRequests = [];
    return dbCache.manualSetupRequests;
  },
  getUserManualSetupRequests: (userId: string) => {
    if (!dbCache.manualSetupRequests) dbCache.manualSetupRequests = [];
    return dbCache.manualSetupRequests.filter((r) => r.userId === userId);
  },
  getManualSetupRequestById: (id: string) => {
    if (!dbCache.manualSetupRequests) dbCache.manualSetupRequests = [];
    return dbCache.manualSetupRequests.find((r) => r.id === id);
  },
  createManualSetupRequest: (reqItem: ManualSetupRequest) => {
    if (!dbCache.manualSetupRequests) dbCache.manualSetupRequests = [];
    dbCache.manualSetupRequests.unshift(reqItem);
    saveDb();
    return reqItem;
  },
  updateManualSetupRequestStatus: (id: string, status: ManualSetupStatus, adminNote?: string) => {
    if (!dbCache.manualSetupRequests) dbCache.manualSetupRequests = [];
    const idx = dbCache.manualSetupRequests.findIndex((r) => r.id === id);
    if (idx !== -1) {
      dbCache.manualSetupRequests[idx].status = status;
      if (adminNote !== undefined) dbCache.manualSetupRequests[idx].adminNote = adminNote;
      dbCache.manualSetupRequests[idx].updatedAt = new Date().toISOString();
      saveDb();
      return dbCache.manualSetupRequests[idx];
    }
    return null;
  },
  deleteManualSetupRequest: (id: string) => {
    if (!dbCache.manualSetupRequests) dbCache.manualSetupRequests = [];
    dbCache.manualSetupRequests = dbCache.manualSetupRequests.filter((r) => r.id !== id);
    saveDb();
    return true;
  },
};
