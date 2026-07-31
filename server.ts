import express from 'express';
import path from 'path';
import urlMetadata from 'url-metadata';
import { createServer as createViteServer } from 'vite';
import { db } from './src/db/database.js';
import { syncToFirestore } from './src/lib/firestoreSync.js';
import { authMiddleware, adminMiddleware, AuthRequest } from './src/server/auth.js';
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
  Category,
  RedeemKey,
  UserNotification,
  NotificationType,
  Tutorial,
  ManualSetupRequest,
  ManualSetupStatus
} from './src/types/index.js';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Helper to generate key: APEX-XXXX-XXXX-XXXX-PRO
function generateLicenseKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const randPart = (len: number) =>
    Array.from({ length: len }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
  return `APEX-${randPart(4)}-${randPart(4)}-${randPart(4)}-PRO`;
}

  // ==================== AUTH ROUTES REMOVED ====================

  app.get('/api/auth/me', authMiddleware, (req: AuthRequest, res) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthenticated' });
    const user = db.getUserById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json({ user });
  });

  app.post('/api/video-metadata', async (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'URL is required' });
    try {
      const metadata = await urlMetadata(url);
      res.json({
        title: metadata.title,
        description: metadata.description,
        thumbnail: metadata.image,
      });
    } catch (e) {
      console.error('Failed to fetch metadata', e);
      res.status(500).json({ error: 'Failed to fetch metadata' });
    }
  });

  app.put('/api/auth/profile', authMiddleware, (req: AuthRequest, res) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthenticated' });
    const { name, phone, currentPassword, newPassword } = req.body;

    const user = db.getUserById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const updates: Partial<User> = {};
    if (name) updates.name = name;
    if (phone !== undefined) updates.phone = phone;

    const updated = db.updateUser(user.id, updates);
    db.addLog('USER_UPDATE_PROFILE', user.email, 'Updated profile information');

    // Trigger security notification
    db.createNotification({
      id: 'ntf_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      userId: user.id,
      title: 'Security Alert: Account Updated',
      message: newPassword 
        ? 'Security Notice: Your account password was changed successfully.' 
        : 'Your account profile details were updated.',
      type: 'SECURITY',
      isRead: false,
      linkUrl: '/dashboard',
      createdAt: new Date().toISOString(),
    });

    return res.json({ user: updated });
  });

  app.post('/api/user/hwid', authMiddleware, (req: AuthRequest, res) => {
    try {
      const { hwid } = req.body;
      if (!hwid || typeof hwid !== 'string' || !hwid.trim()) {
        return res.status(400).json({ error: 'Valid Hardware ID (HWID) string is required.' });
      }

      const user = db.getUserById(req.user!.id);
      if (!user) return res.status(404).json({ error: 'User not found' });

      if (user.hwidLocked && user.hwid) {
        return res.status(400).json({ error: 'Your HWID is locked to your account. Only Admin can reset your HWID lock.' });
      }

      const formattedHwid = hwid.trim().toUpperCase();
      const updated = db.updateUser(user.id, {
        hwid: formattedHwid,
        hwidLocked: true,
        hwidSetAt: new Date().toISOString(),
      });

      // Update currentHwid on user's active licenses
      const userLicenses = db.getLicensesByUserId(user.id);
      userLicenses.forEach((lic) => {
        db.updateLicense(lic.id, { currentHwid: formattedHwid });
      });

      db.addLog('USER_SET_HWID', user.email, `Set and locked HWID to ${formattedHwid}`);

      db.createNotification({
        id: 'ntf_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        userId: user.id,
        title: 'Hardware ID Locked 🔒',
        message: `Your account device HWID (${formattedHwid}) has been successfully set and locked.`,
        type: 'SECURITY',
        isRead: false,
        linkUrl: '/dashboard',
        createdAt: new Date().toISOString(),
      });

      return res.json({ user: updated, success: true });
    } catch (e: any) {
      return res.status(500).json({ error: e.message || 'Failed to update HWID' });
    }
  });

  // ==================== CATEGORIES ROUTES ====================
  app.get('/api/categories', (req, res) => {
    const categories = db.getCategories();
    return res.json(categories);
  });

  app.post('/api/categories', authMiddleware, adminMiddleware, (req: AuthRequest, res) => {
    try {
      const { name, slug, description, displayOrder } = req.body;
      if (!name) {
        return res.status(400).json({ error: 'Category name is required' });
      }

      const id = 'cat_' + Date.now();
      const catSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

      const newCat: Category = {
        id,
        name,
        slug: catSlug,
        description: description || '',
        displayOrder: Number(displayOrder) || 1,
        createdAt: new Date().toISOString(),
      };

      db.createCategory(newCat);
      db.addLog('CREATE_CATEGORY', req.user!.email, `Created new category: ${name}`);
      return res.json(newCat);
    } catch (e: any) {
      return res.status(500).json({ error: e.message || 'Failed to create category' });
    }
  });

  app.put('/api/categories/:id', authMiddleware, adminMiddleware, (req: AuthRequest, res) => {
    try {
      const { name, slug, description, displayOrder } = req.body;
      const id = req.params.id;
      const existing = db.getCategoryById(id);
      if (!existing) return res.status(404).json({ error: 'Category not found' });

      const updates: Partial<Category> = {};
      if (name !== undefined) updates.name = name;
      if (slug !== undefined) updates.slug = slug || name?.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      if (description !== undefined) updates.description = description;
      if (displayOrder !== undefined) updates.displayOrder = Number(displayOrder);

      const updated = db.updateCategory(id, updates);
      db.addLog('UPDATE_CATEGORY', req.user!.email, `Updated category: ${id}`);
      return res.json(updated);
    } catch (e: any) {
      return res.status(500).json({ error: e.message || 'Failed to update category' });
    }
  });

  app.delete('/api/categories/:id', authMiddleware, adminMiddleware, (req: AuthRequest, res) => {
    try {
      const id = req.params.id;
      const existing = db.getCategoryById(id);
      if (!existing) return res.status(404).json({ error: 'Category not found' });

      db.deleteCategory(id);
      db.addLog('DELETE_CATEGORY', req.user!.email, `Deleted category: ${existing.name}`);
      return res.json({ success: true });
    } catch (e: any) {
      return res.status(500).json({ error: e.message || 'Failed to delete category' });
    }
  });

  // ==================== PRODUCTS ROUTES ====================
  app.get('/api/products', (req, res) => {
    const products = db.getProducts();
    const isPublic = req.query.admin !== 'true';
    if (isPublic) {
      return res.json(products.filter((p) => p.status === 'ACTIVE').sort((a, b) => a.displayOrder - b.displayOrder));
    }
    return res.json(products);
  });

  app.get('/api/products/:id', (req, res) => {
    const product = db.getProductById(req.params.id) || db.getProductBySlug(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    return res.json(product);
  });

  app.post('/api/products', authMiddleware, adminMiddleware, (req: AuthRequest, res) => {
    try {
      const data = req.body;
      const id = 'prod_' + Date.now();
      const slug = (data.name || 'product').toLowerCase().replace(/[^a-z0-9]+/g, '-');

      const newProduct: Product = {
        id,
        name: data.name || 'New Software Booster',
        slug: data.slug || slug,
        category: data.category || 'All-In-One Suite',
        shortDescription: data.shortDescription || '',
        longDescription: data.longDescription || '',
        image: data.image || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800',
        gallery: data.gallery || [],
        price: Number(data.price) || 1000,
        salePrice: data.salePrice ? Number(data.salePrice) : undefined,
        billingType: data.billingType || 'SUBSCRIPTION',
        durationValue: Number(data.durationValue) || 30,
        durationUnit: data.durationUnit || 'DAYS',
        maintenanceFee: Number(data.maintenanceFee) || 0,
        maintenanceIntervalDays: Number(data.maintenanceIntervalDays) || 30,
        renewPrice: Number(data.renewPrice) || Number(data.price) || 1000,
        downloadUrl: data.downloadUrl || '/downloads/installer.exe',
        fileSize: data.fileSize || '25 MB',
        version: data.version || 'v1.0.0',
        changelog: data.changelog || 'Initial Release',
        maxDevices: Number(data.maxDevices) || 1,
        hwidLock: Boolean(data.hwidLock ?? true),
        autoActivation: Boolean(data.autoActivation ?? true),
        featured: Boolean(data.featured),
        popular: Boolean(data.popular),
        newBadge: Boolean(data.newBadge),
        displayOrder: Number(data.displayOrder) || 1,
        status: data.status || 'ACTIVE',
        features: Array.isArray(data.features) ? data.features : [],
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        manualSetupRequired: Boolean(data.manualSetupRequired),
        setupCustomFields: Array.isArray(data.setupCustomFields) ? data.setupCustomFields : [],
        setupExternalLink: data.setupExternalLink || '',
        setupExternalLinkLabel: data.setupExternalLinkLabel || '',
        tutorialVideoUrl: data.tutorialVideoUrl || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      db.createProduct(newProduct);
      db.addLog('PRODUCT_CREATE', req.user!.email, `Created product ${newProduct.name}`);
      return res.json(newProduct);
    } catch (e: any) {
      return res.status(500).json({ error: e.message || 'Failed to create product' });
    }
  });

  app.put('/api/products/:id', authMiddleware, adminMiddleware, (req: AuthRequest, res) => {
    try {
      const updated = db.updateProduct(req.params.id, req.body);
      if (!updated) return res.status(404).json({ error: 'Product not found' });
      db.addLog('PRODUCT_UPDATE', req.user!.email, `Updated product ${updated.name}`);
      return res.json(updated);
    } catch (e: any) {
      return res.status(500).json({ error: e.message || 'Failed to update product' });
    }
  });

  app.post('/api/products/:id/clone', authMiddleware, adminMiddleware, (req: AuthRequest, res) => {
    const orig = db.getProductById(req.params.id);
    if (!orig) return res.status(404).json({ error: 'Product not found' });

    const clonedId = 'prod_' + Date.now();
    const cloned: Product = {
      ...orig,
      id: clonedId,
      name: `${orig.name} (Copy)`,
      slug: `${orig.slug}-copy-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.createProduct(cloned);
    db.addLog('PRODUCT_CLONE', req.user!.email, `Cloned product ${orig.name}`);
    return res.json(cloned);
  });

  app.delete('/api/products/:id', authMiddleware, adminMiddleware, (req: AuthRequest, res) => {
    db.deleteProduct(req.params.id);
    db.addLog('PRODUCT_DELETE', req.user!.email, `Deleted product ${req.params.id}`);
    return res.json({ success: true });
  });

  // ==================== COUPONS ====================
  app.get('/api/coupons', authMiddleware, adminMiddleware, (req, res) => {
    return res.json(db.getCoupons());
  });

  app.post('/api/coupons', authMiddleware, adminMiddleware, (req: AuthRequest, res) => {
    const { code, discountPercent, maxUses, expiresAt } = req.body;
    if (!code || !discountPercent) {
      return res.status(400).json({ error: 'Code and discount percentage required' });
    }
    const newCoupon: Coupon = {
      id: 'cpn_' + Date.now(),
      code: code.toUpperCase().trim(),
      discountPercent: Number(discountPercent),
      maxUses: Number(maxUses) || 100,
      usedCount: 0,
      isActive: true,
      expiresAt: expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };
    db.createCoupon(newCoupon);
    db.addLog('COUPON_CREATE', req.user!.email, `Created promo coupon ${newCoupon.code}`);
    return res.json(newCoupon);
  });

  app.delete('/api/coupons/:id', authMiddleware, adminMiddleware, (req: AuthRequest, res) => {
    db.deleteCoupon(req.params.id);
    return res.json({ success: true });
  });

  app.post('/api/coupons/validate', (req, res) => {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: 'Coupon code required' });

    const coupon = db.getCouponByCode(code);
    if (!coupon) return res.status(404).json({ error: 'Invalid or expired promo code.' });

    if (new Date(coupon.expiresAt) < new Date()) {
      return res.status(400).json({ error: 'Coupon code has expired.' });
    }

    if (coupon.usedCount >= coupon.maxUses) {
      return res.status(400).json({ error: 'Coupon usage limit reached.' });
    }

    return res.json({ coupon });
  });

  // ==================== REDEEM KEYS ====================
  app.get('/api/admin/redeem-keys', authMiddleware, adminMiddleware, (req, res) => {
    return res.json(db.getRedeemKeys());
  });

  app.post('/api/admin/redeem-keys', authMiddleware, adminMiddleware, (req: AuthRequest, res) => {
    try {
      const { productId, code, assignedLicenseKey, maxUses, validityDays, expiryDate } = req.body;
      if (!productId) {
        return res.status(400).json({ error: 'Product ID is required to generate a redeem key.' });
      }

      const product = db.getProductById(productId);
      if (!product) return res.status(404).json({ error: 'Selected product not found.' });

      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      const randPart = (len: number) =>
        Array.from({ length: len }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
      const finalCode = (code && code.trim().length > 0)
        ? code.trim().toUpperCase()
        : `DUDE-${randPart(4)}-${randPart(4)}-${randPart(4)}`;

      let computedExpiry = expiryDate;
      if (!computedExpiry && validityDays && Number(validityDays) > 0) {
        const d = new Date();
        d.setDate(d.getDate() + Number(validityDays));
        computedExpiry = d.toISOString();
      }

      const newKey: RedeemKey = {
        id: 'rdm_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        code: finalCode,
        productId: product.id,
        productName: product.name,
        assignedLicenseKey: assignedLicenseKey ? assignedLicenseKey.trim().toUpperCase() : undefined,
        maxUses: Number(maxUses) > 0 ? Number(maxUses) : 1,
        usedCount: 0,
        validityDays: Number(validityDays) || undefined,
        expiryDate: computedExpiry,
        isActive: true,
        createdAt: new Date().toISOString(),
      };

      db.createRedeemKey(newKey);
      db.addLog('REDEEM_KEY_CREATE', req.user!.email, `Generated redeem key ${newKey.code} for product ${product.name}`);
      return res.json(newKey);
    } catch (e: any) {
      return res.status(500).json({ error: e.message || 'Failed to generate redeem key' });
    }
  });

  app.delete('/api/admin/redeem-keys/:id', authMiddleware, adminMiddleware, (req: AuthRequest, res) => {
    db.deleteRedeemKey(req.params.id);
    db.addLog('REDEEM_KEY_DELETE', req.user!.email, `Deleted redeem key ${req.params.id}`);
    return res.json({ success: true });
  });

  app.post('/api/checkout/redeem', authMiddleware, (req: AuthRequest, res) => {
    try {
      const { code, productId } = req.body;
      if (!code || !productId) {
        return res.status(400).json({ error: 'Redeem code and product ID are required.' });
      }

      const result = db.redeemKey(code, req.user!.id, productId);
      return res.json({ success: true, ...result });
    } catch (e: any) {
      return res.status(400).json({ error: e.message || 'Redemption failed' });
    }
  });

  // ==================== ORDERS & PAYMENTS ====================
  app.post('/api/orders', authMiddleware, (req: AuthRequest, res) => {
    try {
      const { productId, paymentMethod, transactionId, accountNumber, couponCode, paymentProofUrl } = req.body;
      if (!productId || !paymentMethod || !transactionId) {
        return res.status(400).json({ error: 'Product ID, Payment Method, and Transaction ID are required.' });
      }

      const product = db.getProductById(productId);
      if (!product) return res.status(404).json({ error: 'Product not found' });

      let basePrice = product.salePrice && product.salePrice > 0 ? product.salePrice : product.price;
      let discountAmount = 0;

      if (couponCode) {
        const coupon = db.getCouponByCode(couponCode);
        if (coupon && coupon.discountPercent > 0) {
          discountAmount = Math.round((basePrice * coupon.discountPercent) / 100);
          db.updateCoupon(coupon.id, { usedCount: coupon.usedCount + 1 });
        }
      }

      const finalAmount = Math.max(0, basePrice - discountAmount);
      const orderId = 'ord_' + Date.now();
      const orderNumber = 'APX-' + Math.floor(10000 + Math.random() * 90000);

      // All customer checkout orders MUST require Admin manual verification
      const initialStatus = 'PENDING';
      const licenseId: string | undefined = undefined;

      const newOrder: Order = {
        id: orderId,
        orderNumber,
        userId: req.user!.id,
        userEmail: req.user!.email,
        userName: req.user!.name,
        productId: product.id,
        productName: product.name,
        amount: basePrice,
        discountAmount,
        couponCode,
        finalAmount,
        status: initialStatus,
        paymentMethod,
        transactionId,
        accountNumber,
        paymentProofUrl,
        licenseId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      db.createOrder(newOrder);

      // Create notification for customer
      db.createNotification({
        id: 'ntf_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        userId: req.user!.id,
        title: 'Order Received (Pending Verification) ⏳',
        message: `Order ${orderNumber} for ${product.name} submitted with ${paymentMethod} TrxID: ${transactionId}. Awaiting Admin verification.`,
        type: 'PAYMENT_STATUS',
        isRead: false,
        linkUrl: '/dashboard',
        createdAt: new Date().toISOString(),
      });

      db.addLog(
        'ORDER_CREATE',
        req.user!.email,
        `Placed order ${orderNumber} for ${product.name} (${paymentMethod} TrxID: ${transactionId}) - Pending Admin Verification`
      );

      return res.json({ order: newOrder, autoActivated: false });
    } catch (e: any) {
      return res.status(500).json({ error: e.message || 'Order creation failed' });
    }
  });

  app.get('/api/orders/user', authMiddleware, (req: AuthRequest, res) => {
    const orders = db.getOrdersByUserId(req.user!.id);
    return res.json(orders);
  });

  app.get('/api/orders', authMiddleware, adminMiddleware, (req, res) => {
    return res.json(db.getOrders());
  });

  app.put('/api/orders/:id/status', authMiddleware, adminMiddleware, (req: AuthRequest, res) => {
    const { status, adminNote, customLicenseKey } = req.body;
    const order = db.getOrderById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    let licenseId = order.licenseId;

    if (status === 'APPROVED' && !licenseId) {
      const product = db.getProductById(order.productId);
      const user = db.getUserById(order.userId);

      licenseId = 'lic_' + Date.now();
      const durationDays = product
        ? product.durationUnit === 'LIFETIME'
          ? 3650
          : product.durationUnit === 'YEARS'
          ? product.durationValue * 365
          : product.durationUnit === 'MONTHS'
          ? product.durationValue * 30
          : product.durationValue
        : 30;

      const activationDate = new Date();
      const expiryDate = new Date(activationDate.getTime() + durationDays * 24 * 60 * 60 * 1000);

      const finalKey = (customLicenseKey && customLicenseKey.trim().length > 0)
        ? customLicenseKey.trim().toUpperCase()
        : generateLicenseKey();

      const newLicense: License = {
        id: licenseId,
        licenseKey: finalKey,
        userId: order.userId,
        userEmail: order.userEmail,
        userName: user ? user.name : order.userName,
        productId: order.productId,
        productName: order.productName,
        activationDate: activationDate.toISOString(),
        expiryDate: product && product.durationUnit === 'LIFETIME' ? 'LIFETIME' : expiryDate.toISOString(),
        maintenanceDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        renewDate: expiryDate.toISOString(),
        maxDevices: product ? product.maxDevices : 1,
        hwidLock: product ? product.hwidLock : true,
        status: 'ACTIVE',
        notes: adminNote || `Generated upon admin manual verification of ${order.paymentMethod} payment.`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      db.createLicense(newLicense);

      // Notify customer of license activation
      db.createNotification({
        id: 'ntf_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        userId: order.userId,
        title: 'Payment Verified & License Activated! 🎉',
        message: `Your order ${order.orderNumber} for ${order.productName} has been verified and approved by Admin. License key: ${newLicense.licenseKey}`,
        type: 'LICENSE_ACTIVATED',
        isRead: false,
        linkUrl: '/dashboard',
        createdAt: new Date().toISOString(),
      });
    } else if (status === 'REJECTED') {
      db.createNotification({
        id: 'ntf_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        userId: order.userId,
        title: 'Payment Status Update ⚠️',
        message: `Order ${order.orderNumber} (${order.productName}) was rejected by Admin. ${adminNote ? `Note: ${adminNote}` : 'Please verify your payment transaction details.'}`,
        type: 'PAYMENT_STATUS',
        isRead: false,
        linkUrl: '/dashboard',
        createdAt: new Date().toISOString(),
      });
    }

    const updated = db.updateOrder(order.id, {
      status,
      adminNote: adminNote || order.adminNote,
      licenseId,
    });

    db.addLog('ORDER_STATUS_CHANGE', req.user!.email, `Updated order ${order.orderNumber} status to ${status}`);
    return res.json(updated);
  });

  // ==================== LICENSES ====================
  app.get('/api/licenses/user', authMiddleware, (req: AuthRequest, res) => {
    const licenses = db.getLicensesByUserId(req.user!.id);
    const now = Date.now();

    const updatedLicenses = licenses.map((lic) => {
      const product = db.getProductById(lic.productId);
      if (!product || !product.maintenanceFeeEnabled) return lic;

      const maintenanceDateMs = lic.maintenanceDate
        ? new Date(lic.maintenanceDate).getTime()
        : now + (product.maintenanceFeePeriodDays || 30) * 86400000;
      const noticeDays = product.maintenanceFeeNoticeDays || 7;
      const noticeMs = noticeDays * 86400000;
      const amount = product.maintenanceFeeAmount || 50;

      // Check if maintenance period expired
      if (now >= maintenanceDateMs && lic.status === 'ACTIVE') {
        const updated = db.updateLicense(lic.id, { status: 'EXPIRED' }) || lic;
        db.createNotification({
          id: 'ntf_maint_exp_' + lic.id + '_' + Math.floor(now / 86400000),
          userId: req.user!.id,
          title: 'Subscription Paused ⚠️ Maintenance Fee Due',
          message: `Your subscription for ${lic.productName} has been automatically paused because the maintenance fee (৳${amount}) was due on ${new Date(maintenanceDateMs).toLocaleDateString()}. Please contact Admin or submit a setup request to reactivate.`,
          type: 'MAINTENANCE_DUE',
          isRead: false,
          linkUrl: '/dashboard',
          createdAt: new Date().toISOString(),
        });
        return updated;
      } else if (now < maintenanceDateMs && (maintenanceDateMs - now) <= noticeMs && lic.status === 'ACTIVE') {
        const daysLeft = Math.ceil((maintenanceDateMs - now) / 86400000);
        const notifId = 'ntf_maint_notice_' + lic.id + '_' + Math.floor(now / 86400000);
        const existingNotif = db.getNotifications(req.user!.id).find(n => n.id === notifId);
        if (!existingNotif) {
          db.createNotification({
            id: notifId,
            userId: req.user!.id,
            title: 'Maintenance Fee Reminder 🔔',
            message: `Maintenance fee of ৳${amount} for ${lic.productName} is due in ${daysLeft} day(s) on ${new Date(maintenanceDateMs).toLocaleDateString()}.`,
            type: 'MAINTENANCE_DUE',
            isRead: false,
            linkUrl: '/dashboard',
            createdAt: new Date().toISOString(),
          });
        }
      }
      return lic;
    });

    return res.json(updatedLicenses);
  });

  app.post('/api/licenses/reset-hwid/:id', authMiddleware, (req: AuthRequest, res) => {
    const license = db.getLicenseById(req.params.id);
    if (!license) return res.status(404).json({ error: 'License not found' });

    if (req.user!.role !== 'ADMIN' && license.userId !== req.user!.id) {
      return res.status(403).json({ error: 'Unauthorized to reset this HWID' });
    }

    const updated = db.updateLicense(license.id, {
      currentHwid: undefined,
      activeDeviceName: undefined,
      notes: `HWID reset on ${new Date().toLocaleDateString()} by ${req.user!.email}`,
    });

    db.addLog('HWID_RESET', req.user!.email, `Reset HWID for license ${license.licenseKey}`);
    return res.json({ success: true, license: updated });
  });

  app.get('/api/licenses', authMiddleware, adminMiddleware, (req, res) => {
    return res.json(db.getLicenses());
  });

  app.post('/api/licenses', authMiddleware, adminMiddleware, (req: AuthRequest, res) => {
    try {
      const { userEmail, productId, durationDays, notes, customKey, maxDevices, hwidLock } = req.body;
      if (!userEmail || !productId) {
        return res.status(400).json({ error: 'User email and product ID are required.' });
      }

      const targetUser = db.getUserByEmail(userEmail);
      if (!targetUser) return res.status(404).json({ error: `User with email '${userEmail}' not found. Ensure customer is registered.` });

      const product = db.getProductById(productId);
      if (!product) return res.status(404).json({ error: 'Product not found.' });

      const days = Number(durationDays) || 30;
      const activationDate = new Date();
      const expiryDate = new Date(activationDate.getTime() + days * 24 * 60 * 60 * 1000);

      const finalLicenseKey = (customKey && customKey.trim().length > 0)
        ? customKey.trim().toUpperCase()
        : generateLicenseKey();

      const newLicense: License = {
        id: 'lic_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        licenseKey: finalLicenseKey,
        userId: targetUser.id,
        userEmail: targetUser.email,
        userName: targetUser.name,
        productId: product.id,
        productName: product.name,
        activationDate: activationDate.toISOString(),
        expiryDate: days >= 3650 ? 'LIFETIME' : expiryDate.toISOString(),
        maintenanceDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        renewDate: expiryDate.toISOString(),
        maxDevices: maxDevices !== undefined ? Number(maxDevices) : (product.maxDevices || 1),
        hwidLock: hwidLock !== undefined ? Boolean(hwidLock) : (product.hwidLock ?? true),
        status: 'ACTIVE',
        notes: notes || 'Manually issued subscription license by Admin',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      db.createLicense(newLicense);

      // Create instant user notification
      db.createNotification({
        id: 'ntf_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        userId: targetUser.id,
        title: 'Subscription License Issued! 🔑',
        message: `Admin issued a manual subscription license key for ${product.name}. Key: ${newLicense.licenseKey}`,
        type: 'LICENSE_ACTIVATED',
        isRead: false,
        linkUrl: '/dashboard',
        createdAt: new Date().toISOString(),
      });

      db.addLog('LICENSE_GENERATE', req.user!.email, `Manually issued license ${newLicense.licenseKey} to ${targetUser.email} (${product.name})`);
      return res.json(newLicense);
    } catch (e: any) {
      return res.status(500).json({ error: e.message || 'Failed to create license' });
    }
  });

  app.put('/api/licenses/:id', authMiddleware, adminMiddleware, (req: AuthRequest, res) => {
    const updated = db.updateLicense(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'License not found' });
    db.addLog('LICENSE_UPDATE', req.user!.email, `Updated license ${updated.licenseKey}`);
    return res.json(updated);
  });

  app.delete('/api/licenses/:id', authMiddleware, adminMiddleware, (req: AuthRequest, res) => {
    db.deleteLicense(req.params.id);
    db.addLog('LICENSE_DELETE', req.user!.email, `Deleted license ${req.params.id}`);
    return res.json({ success: true });
  });

  // ==================== DOWNLOADS ====================
  app.get('/api/downloads', (req, res) => {
    return res.json(db.getDownloads());
  });

  app.post('/api/downloads', authMiddleware, adminMiddleware, (req: AuthRequest, res) => {
    const { productId, version, fileSize, fileUrl, changelog, isLatest, accessType } = req.body;
    const isGlobal = accessType === 'GLOBAL' || productId === 'global';
    const product = isGlobal ? null : db.getProductById(productId);

    const newDownload: DownloadRelease = {
      id: 'dl_' + Date.now(),
      productId: isGlobal ? 'global' : (productId || 'global'),
      productName: isGlobal ? (req.body.productName || 'Global Software Release') : (product ? product.name : 'Software Release'),
      version: version || 'v1.0.0',
      fileSize: fileSize || '25 MB',
      fileUrl: fileUrl || '/downloads/installer.exe',
      changelog: changelog || 'Maintenance updates',
      releaseDate: new Date().toISOString().split('T')[0],
      isLatest: isLatest !== undefined ? Boolean(isLatest) : true,
      downloadCount: 0,
      accessType: isGlobal ? 'GLOBAL' : 'MEMBERS_ONLY',
    };

    db.createDownload(newDownload);
    db.addLog('DOWNLOAD_RELEASE', req.user!.email, `Uploaded software release ${version} (${newDownload.accessType})`);
    return res.json(newDownload);
  });

  app.delete('/api/downloads/:id', authMiddleware, adminMiddleware, (req: AuthRequest, res) => {
    db.deleteDownload(req.params.id);
    db.addLog('DOWNLOAD_DELETE', req.user!.email, `Deleted download release ${req.params.id}`);
    return res.json({ success: true });
  });

  app.post('/api/downloads/:id/track', (req, res) => {
    const downloads = db.getDownloads();
    const d = downloads.find((item) => item.id === req.params.id);
    if (d) {
      db.updateDownload(d.id, { downloadCount: (d.downloadCount || 0) + 1 });
    }
    return res.json({ success: true });
  });

  // ==================== SUPPORT TICKETS ====================
  app.get('/api/tickets', authMiddleware, (req: AuthRequest, res) => {
    if (req.user!.role === 'ADMIN') {
      return res.json(db.getTickets());
    }
    return res.json(db.getTicketsByUserId(req.user!.id));
  });

  app.post('/api/tickets', authMiddleware, (req: AuthRequest, res) => {
    const { subject, category, priority, message } = req.body;
    if (!subject || !message) {
      return res.status(400).json({ error: 'Subject and message are required.' });
    }

    const ticketId = 'tck_' + Date.now();
    const ticketNumber = 'TCK-' + Math.floor(1000 + Math.random() * 9000);

    const newTicket: SupportTicket = {
      id: ticketId,
      ticketNumber,
      userId: req.user!.id,
      userName: req.user!.name,
      userEmail: req.user!.email,
      category: category || 'General Inquiry',
      subject,
      priority: priority || 'MEDIUM',
      status: 'OPEN',
      messages: [
        {
          id: 'msg_' + Date.now(),
          ticketId,
          senderId: req.user!.id,
          senderName: req.user!.name,
          senderRole: req.user!.role,
          message,
          createdAt: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.createTicket(newTicket);
    db.addLog('TICKET_CREATE', req.user!.email, `Opened support ticket ${ticketNumber}`);
    return res.json(newTicket);
  });

  app.post('/api/tickets/:id/reply', authMiddleware, (req: AuthRequest, res) => {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Message cannot be empty.' });

    const ticket = db.getTicketById(req.params.id);
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

    if (req.user!.role !== 'ADMIN' && ticket.userId !== req.user!.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const newMessage = {
      id: 'msg_' + Date.now(),
      ticketId: ticket.id,
      senderId: req.user!.id,
      senderName: req.user!.name,
      senderRole: req.user!.role,
      message,
      createdAt: new Date().toISOString(),
    };

    ticket.messages.push(newMessage);
    const updated = db.updateTicket(ticket.id, {
      messages: ticket.messages,
      status: req.user!.role === 'ADMIN' ? 'IN_PROGRESS' : 'OPEN',
    });

    return res.json(updated);
  });

  app.put('/api/tickets/:id/status', authMiddleware, adminMiddleware, (req: AuthRequest, res) => {
    const { status, priority } = req.body;
    const updated = db.updateTicket(req.params.id, { status, priority });
    if (!updated) return res.status(404).json({ error: 'Ticket not found' });
    return res.json(updated);
  });

  // ==================== ANNOUNCEMENTS ====================
  app.get('/api/announcements', (req, res) => {
    return res.json(db.getAnnouncements().filter((a) => a.isActive));
  });

  app.post('/api/announcements', authMiddleware, adminMiddleware, (req: AuthRequest, res) => {
    const { title, content, type, linkUrl } = req.body;
    const newAnc: Announcement = {
      id: 'anc_' + Date.now(),
      title,
      content,
      type: type || 'BANNER',
      targetRole: 'ALL',
      isActive: true,
      linkUrl,
      createdAt: new Date().toISOString(),
    };
    db.createAnnouncement(newAnc);
    db.addLog('ANNOUNCEMENT_CREATE', req.user!.email, `Created announcement ${title}`);
    return res.json(newAnc);
  });

  app.delete('/api/announcements/:id', authMiddleware, adminMiddleware, (req: AuthRequest, res) => {
    db.deleteAnnouncement(req.params.id);
    return res.json({ success: true });
  });

  // ==================== VIDEO TUTORIALS ====================
  app.get('/api/tutorials', (req, res) => {
    return res.json(db.getTutorials());
  });

  app.post('/api/tutorials', authMiddleware, adminMiddleware, (req: AuthRequest, res) => {
    const { title, description, videoUrl, platform, category, duration, thumbnailUrl } = req.body;
    if (!title || !videoUrl) {
      return res.status(400).json({ error: 'Title and Video URL are required.' });
    }

    let detectedPlatform = platform;
    if (!detectedPlatform || detectedPlatform === 'AUTO') {
      const lower = videoUrl.toLowerCase();
      if (lower.includes('youtube.com') || lower.includes('youtu.be')) {
        detectedPlatform = 'YOUTUBE';
      } else if (lower.includes('facebook.com') || lower.includes('fb.watch') || lower.includes('fb.gg')) {
        detectedPlatform = 'FACEBOOK';
      } else if (lower.includes('vimeo.com')) {
        detectedPlatform = 'VIMEO';
      } else if (lower.includes('tiktok.com')) {
        detectedPlatform = 'TIKTOK';
      } else {
        detectedPlatform = 'OTHER';
      }
    }

    const newTut: Tutorial = {
      id: 'tut_' + Date.now(),
      title,
      description: description || '',
      videoUrl,
      platform: detectedPlatform,
      category: category || 'General Guide',
      duration: duration || '',
      thumbnailUrl: thumbnailUrl || '',
      createdAt: new Date().toISOString(),
    };

    db.createTutorial(newTut);
    db.addLog('TUTORIAL_CREATE', req.user!.email, `Created tutorial video: ${title}`);
    return res.json(newTut);
  });

  app.put('/api/tutorials/:id', authMiddleware, adminMiddleware, (req: AuthRequest, res) => {
    const { title, description, videoUrl, platform, category, duration, thumbnailUrl } = req.body;
    const existing = db.getTutorialById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Tutorial not found' });

    let detectedPlatform = platform;
    if (videoUrl && (!detectedPlatform || detectedPlatform === 'AUTO')) {
      const lower = videoUrl.toLowerCase();
      if (lower.includes('youtube.com') || lower.includes('youtu.be')) {
        detectedPlatform = 'YOUTUBE';
      } else if (lower.includes('facebook.com') || lower.includes('fb.watch') || lower.includes('fb.gg')) {
        detectedPlatform = 'FACEBOOK';
      } else if (lower.includes('vimeo.com')) {
        detectedPlatform = 'VIMEO';
      } else if (lower.includes('tiktok.com')) {
        detectedPlatform = 'TIKTOK';
      } else {
        detectedPlatform = 'OTHER';
      }
    }

    const updated = db.updateTutorial(req.params.id, {
      ...(title && { title }),
      ...(description !== undefined && { description }),
      ...(videoUrl && { videoUrl }),
      ...(detectedPlatform && { platform: detectedPlatform }),
      ...(category && { category }),
      ...(duration !== undefined && { duration }),
      ...(thumbnailUrl !== undefined && { thumbnailUrl }),
    });

    db.addLog('TUTORIAL_UPDATE', req.user!.email, `Updated tutorial video ${req.params.id}`);
    return res.json(updated);
  });

  app.delete('/api/tutorials/:id', authMiddleware, adminMiddleware, (req: AuthRequest, res) => {
    db.deleteTutorial(req.params.id);
    db.addLog('TUTORIAL_DELETE', req.user!.email, `Deleted tutorial video ${req.params.id}`);
    return res.json({ success: true });
  });

  // ==================== MANUAL SETUP REQUESTS ====================
  app.get('/api/admin/manual-setup-requests', authMiddleware, adminMiddleware, (req, res) => {
    return res.json(db.getManualSetupRequests());
  });

  app.get('/api/user/manual-setup-requests', authMiddleware, (req: AuthRequest, res) => {
    return res.json(db.getUserManualSetupRequests(req.user!.id));
  });

  app.post('/api/manual-setup-requests', authMiddleware, (req: AuthRequest, res) => {
    const { licenseId, productId, customAnswers, userPhone, hwid } = req.body;
    if (!licenseId || !productId) {
      return res.status(400).json({ error: 'License ID and Product ID are required.' });
    }

    const license = db.getLicenseById(licenseId);
    if (!license || license.userId !== req.user!.id) {
      return res.status(403).json({ error: 'License not found or access denied.' });
    }

    const product = db.getProductById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    const fullUser = db.getUserById(req.user!.id);

    const newReq: ManualSetupRequest = {
      id: 'mset_' + Date.now(),
      requestNumber: 'MSET-' + Math.floor(100000 + Math.random() * 900000),
      userId: req.user!.id,
      userEmail: req.user!.email,
      userName: req.user!.name,
      userPhone: userPhone || fullUser?.phone || '',
      productId: product.id,
      productName: product.name,
      licenseId: license.id,
      licenseKey: license.licenseKey,
      hwid: hwid || license.currentHwid || fullUser?.hwid || 'N/A',
      customAnswers: customAnswers || {},
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.createManualSetupRequest(newReq);
    db.addLog('MANUAL_SETUP_CREATE', req.user!.email, `Submitted manual setup request ${newReq.requestNumber} for ${product.name}`);
    return res.json(newReq);
  });

  app.put('/api/admin/manual-setup-requests/:id/status', authMiddleware, adminMiddleware, (req: AuthRequest, res) => {
    const { status, adminNote } = req.body;
    if (!status) return res.status(400).json({ error: 'Status is required.' });

    const updated = db.updateManualSetupRequestStatus(req.params.id, status as ManualSetupStatus, adminNote);
    if (!updated) return res.status(404).json({ error: 'Setup request not found.' });

    // Send user notification if updated
    db.createNotification({
      id: 'notif_' + Date.now(),
      userId: updated.userId,
      title: `Manual Setup Request ${updated.requestNumber} ${status}`,
      message: `Your manual setup request for ${updated.productName} has been marked as ${status}.${adminNote ? ` Note: ${adminNote}` : ''}`,
      type: 'SYSTEM',
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    db.addLog('MANUAL_SETUP_STATUS', req.user!.email, `Updated manual setup request ${req.params.id} to ${status}`);
    return res.json(updated);
  });

  app.delete('/api/admin/manual-setup-requests/:id', authMiddleware, adminMiddleware, (req: AuthRequest, res) => {
    db.deleteManualSetupRequest(req.params.id);
    db.addLog('MANUAL_SETUP_DELETE', req.user!.email, `Deleted setup request ${req.params.id}`);
    return res.json({ success: true });
  });

  // ==================== SITE SETTINGS ====================
  app.get('/api/settings', (req, res) => {
    return res.json(db.getSettings());
  });

  app.put('/api/settings', authMiddleware, adminMiddleware, (req: AuthRequest, res) => {
    const updated = db.updateSettings(req.body);
    db.addLog('SETTINGS_UPDATE', req.user!.email, 'Updated platform site settings');
    return res.json(updated);
  });

  // ==================== ADMIN USERS & STATS ====================
  app.get('/api/admin/users', authMiddleware, adminMiddleware, (req, res) => {
    return res.json(db.getUsers());
  });

  app.put('/api/admin/users/:id/block', authMiddleware, adminMiddleware, (req: AuthRequest, res) => {
    const { isBlocked, role } = req.body;
    const updates: Partial<User> = {};
    if (isBlocked !== undefined) updates.isBlocked = isBlocked;
    if (role) updates.role = role;

    const updated = db.updateUser(req.params.id, updates);
    if (!updated) return res.status(404).json({ error: 'User not found' });
    return res.json(updated);
  });

  app.post('/api/admin/users/:id/reset-hwid', authMiddleware, adminMiddleware, (req: AuthRequest, res) => {
    try {
      const targetUserId = req.params.id;
      const targetUser = db.getUserById(targetUserId);
      if (!targetUser) return res.status(404).json({ error: 'User not found' });

      const updated = db.updateUser(targetUserId, {
        hwid: undefined,
        hwidLocked: false,
        hwidSetAt: undefined,
      });

      // Clear currentHwid on licenses
      const userLicenses = db.getLicensesByUserId(targetUserId);
      userLicenses.forEach((lic) => {
        db.updateLicense(lic.id, { currentHwid: undefined });
      });

      db.addLog('ADMIN_RESET_HWID', req.user!.email, `Reset HWID for user ${targetUser.email}`);

      db.createNotification({
        id: 'ntf_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        userId: targetUserId,
        title: 'HWID Lock Reset by Admin 🔓',
        message: 'Admin has reset your Hardware ID lock. You can now configure a new HWID in your dashboard.',
        type: 'SECURITY',
        isRead: false,
        linkUrl: '/dashboard',
        createdAt: new Date().toISOString(),
      });

      return res.json({ user: updated, success: true });
    } catch (e: any) {
      return res.status(500).json({ error: e.message || 'Failed to reset HWID' });
    }
  });

  app.post('/api/licenses/reset-hwid/:id', authMiddleware, adminMiddleware, (req: AuthRequest, res) => {
    try {
      const licenseId = req.params.id;
      const license = db.getLicenseById(licenseId);
      if (!license) return res.status(404).json({ error: 'License not found' });

      const updated = db.updateLicense(licenseId, { currentHwid: undefined });

      // Also reset user profile HWID lock
      const user = db.getUserById(license.userId);
      if (user) {
        db.updateUser(user.id, { hwid: undefined, hwidLocked: false, hwidSetAt: undefined });
        db.createNotification({
          id: 'ntf_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
          userId: user.id,
          title: 'License HWID Lock Reset 🔓',
          message: `Hardware lock reset by Admin for ${license.productName}. You can set a new HWID now.`,
          type: 'SECURITY',
          isRead: false,
          linkUrl: '/dashboard',
          createdAt: new Date().toISOString(),
        });
      }

      db.addLog('LICENSE_RESET_HWID', req.user!.email, `Reset HWID lock for license ${license.licenseKey}`);
      return res.json({ success: true, license: updated });
    } catch (e: any) {
      return res.status(500).json({ error: e.message || 'Failed to reset license HWID' });
    }
  });

  app.get('/api/admin/stats', authMiddleware, adminMiddleware, (req, res) => {
    const orders = db.getOrders();
    const approvedOrders = orders.filter((o) => o.status === 'APPROVED');
    const totalRevenue = approvedOrders.reduce((sum, o) => sum + o.finalAmount, 0);
    const users = db.getUsers();
    const activeLicenses = db.getLicenses().filter((l) => l.status === 'ACTIVE');
    const pendingOrders = orders.filter((o) => o.status === 'PENDING');
    const openTickets = db.getTickets().filter((t) => t.status === 'OPEN' || t.status === 'IN_PROGRESS');

    return res.json({
      totalRevenue,
      totalSalesCount: approvedOrders.length,
      totalUsersCount: users.length,
      activeLicensesCount: activeLicenses.length,
      pendingVerificationsCount: pendingOrders.length,
      openTicketsCount: openTickets.length,
      recentOrders: orders.slice(0, 10),
      recentLogs: db.getLogs().slice(0, 15),
    });
  });

  app.get('/api/admin/logs', authMiddleware, adminMiddleware, (req, res) => {
    return res.json(db.getLogs());
  });

  // ==================== NOTIFICATIONS ROUTES ====================
  app.get('/api/notifications', authMiddleware, (req: AuthRequest, res) => {
    console.log('GET /api/notifications called');
    if (!req.user) {
      console.log('No user in req');
      return res.status(401).json({ error: 'Unauthenticated' });
    }
    const notifications = db.getNotifications(req.user.id);
    const unreadCount = notifications.filter((n) => !n.isRead).length;
    console.log(`Found ${notifications.length} notifications for user ${req.user.id}`);
    return res.json({ notifications, unreadCount });
  });

  app.put('/api/notifications/:id/read', authMiddleware, (req: AuthRequest, res) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthenticated' });
    const updated = db.markNotificationRead(req.params.id, req.user.id);
    if (!updated) return res.status(404).json({ error: 'Notification not found' });
    return res.json(updated);
  });

  app.put('/api/notifications/read-all', authMiddleware, (req: AuthRequest, res) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthenticated' });
    db.markAllNotificationsRead(req.user.id);
    return res.json({ success: true });
  });

  app.delete('/api/notifications/:id', authMiddleware, (req: AuthRequest, res) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthenticated' });
    db.deleteNotification(req.params.id, req.user.id);
    return res.json({ success: true });
  });

  app.post('/api/admin/notifications', authMiddleware, adminMiddleware, (req: AuthRequest, res) => {
    try {
      const { userId, title, message, type, linkUrl } = req.body;
      if (!title || !message) {
        return res.status(400).json({ error: 'Title and message are required' });
      }

      const notifType: NotificationType = type || 'SYSTEM';

      if (userId && userId !== 'ALL') {
        const notif: UserNotification = {
          id: 'ntf_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
          userId,
          title,
          message,
          type: notifType,
          isRead: false,
          linkUrl,
          createdAt: new Date().toISOString(),
        };
        db.createNotification(notif);
        db.addLog('ADMIN_NOTIFICATION', req.user!.email, `Sent notification to user ${userId}`);
        return res.json({ count: 1 });
      } else {
        const allUsers = db.getUsers().filter((u) => u.role === 'CUSTOMER');
        let count = 0;
        allUsers.forEach((u) => {
          db.createNotification({
            id: 'ntf_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4) + '_' + count,
            userId: u.id,
            title,
            message,
            type: notifType,
            isRead: false,
            linkUrl,
            createdAt: new Date().toISOString(),
          });
          count++;
        });
        db.addLog('ADMIN_BROADCAST', req.user!.email, `Broadcasted notification to ${count} users`);
        return res.json({ count });
      }
    } catch (e: any) {
      return res.status(500).json({ error: e.message || 'Failed to send notification' });
    }
  });

  app.post('/api/admin/sync-firestore', authMiddleware, adminMiddleware, async (req: AuthRequest, res) => {
    try {
      const fullDb = db.state;
      await syncToFirestore(fullDb);
      return res.json({ success: true, message: 'Sync to Firestore initiated' });
    } catch (e: any) {
      return res.status(500).json({ error: e.message || 'Firestore sync failed' });
    }
  });

async function startServer() {
  // Serve static files / Vite middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ApexBoost SaaS Server running on http://0.0.0.0:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export { app };
