import React, { useState } from 'react';
import { Product, PaymentMethod } from '../../types/index.js';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/api.js';
import { Modal } from './Modal.tsx';
import { Badge } from './Badge.tsx';
import { Check, ShieldCheck, Zap, Copy, AlertCircle, ArrowRight, Key, CreditCard, Gift } from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onSuccessOrder?: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  product,
  onSuccessOrder,
}) => {
  const { user, settings } = useAuth();
  const [activeTab, setActiveTab] = useState<'ONLINE_PAY' | 'REDEEM_KEY'>('ONLINE_PAY');
  
  // Online pay state
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('BKASH');
  const [transactionId, setTransactionId] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; percent: number } | null>(null);
  const [couponError, setCouponError] = useState('');
  const [paymentProofUrl, setPaymentProofUrl] = useState('');
  const [copiedAccount, setCopiedAccount] = useState(false);

  // Redeem key state
  const [redeemCode, setRedeemCode] = useState('');

  // General state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState<{
    orderNumber: string;
    autoActivated: boolean;
    licenseKey?: string;
  } | null>(null);

  if (!product) return null;

  const basePrice = product.salePrice && product.salePrice > 0 ? product.salePrice : product.price;
  const discountAmount = appliedCoupon ? Math.round((basePrice * appliedCoupon.percent) / 100) : 0;
  const finalAmount = Math.max(0, basePrice - discountAmount);
  const currency = settings?.currencySymbol || '৳';

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponError('');
    try {
      const res = await api.validateCoupon(couponCode.trim());
      setAppliedCoupon({
        code: res.coupon.code,
        percent: res.coupon.discountPercent,
      });
    } catch (e: any) {
      setCouponError(e.message || 'Invalid coupon code');
      setAppliedCoupon(null);
    }
  };

  const getNumberForMethod = () => {
    switch (paymentMethod) {
      case 'BKASH':
        return settings?.bkashNumber || '01700112233';
      case 'NAGAD':
        return settings?.nagadNumber || '01800112233';
      case 'ROCKET':
        return settings?.rocketNumber || '01900112233';
      case 'MANUAL_BANK':
        return settings?.bankDetails || 'Bank: DBBL AC 102.120.98231';
      case 'CRYPTO':
        return settings?.cryptoWallet || 'USDT (TRC20): T9zXX...Wallet';
      default:
        return '';
    }
  };

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(getNumberForMethod());
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2000);
  };

  const handleSubmitOnlinePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('Please log in or register an account to complete your purchase.');
      return;
    }
    if (!transactionId.trim()) {
      setError('Transaction ID (TrxID) is required.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.createOrder({
        productId: product.id,
        paymentMethod,
        transactionId: transactionId.trim(),
        accountNumber: accountNumber.trim(),
        couponCode: appliedCoupon?.code,
        paymentProofUrl: paymentProofUrl.trim(),
      });

      setSuccessData({
        orderNumber: res.order.orderNumber,
        autoActivated: res.autoActivated,
      });

      if (onSuccessOrder) onSuccessOrder();
    } catch (e: any) {
      setError(e.message || 'Failed to process order. Please verify your TrxID.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRedeemKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('Please log in or register an account to redeem product.');
      return;
    }
    if (!redeemCode.trim()) {
      setError('Please enter a valid Redeem Key.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.redeemKey(redeemCode.trim(), product.id);
      setSuccessData({
        orderNumber: res.order.orderNumber,
        autoActivated: true,
        licenseKey: res.license.licenseKey,
      });

      if (onSuccessOrder) onSuccessOrder();
    } catch (e: any) {
      setError(e.message || 'Failed to redeem key.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetModal = () => {
    setSuccessData(null);
    setTransactionId('');
    setAccountNumber('');
    setCouponCode('');
    setAppliedCoupon(null);
    setRedeemCode('');
    setError('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleResetModal} maxWidth="max-w-2xl">
      {!successData ? (
        <div>
          {/* Header */}
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Checkout & Product Activation</h2>
              <p className="text-xs text-slate-500">Official Gateway for {product.name}</p>
            </div>
          </div>

          {/* Product Summary Box */}
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl mb-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/60">
              <div className="flex items-center space-x-3">
                <img src={product.image} alt={product.name} className="w-12 h-12 object-cover rounded-lg border border-slate-200" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{product.name}</h4>
                  <div className="flex items-center space-x-2 text-xs text-slate-500 mt-0.5">
                    <span>{product.durationValue} {product.durationUnit.toLowerCase()} plan</span>
                    <span>•</span>
                    <span className="text-blue-600 font-medium">{product.maxDevices} Device HWID Lock</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-extrabold text-slate-900">
                  {currency}{finalAmount.toLocaleString()}
                </div>
                {product.salePrice && product.salePrice > 0 && (
                  <span className="text-xs text-slate-400 line-through">
                    {currency}{product.price.toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* SECTION SWITCHER TABS: ONLINE PAY vs REDEEM KEY */}
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-2xl mb-6 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setActiveTab('ONLINE_PAY');
                setError('');
              }}
              className={`py-3 px-4 rounded-xl transition flex items-center justify-center space-x-2 ${
                activeTab === 'ONLINE_PAY'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>1. Online Pay (bKash / Nagad)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('REDEEM_KEY');
                setError('');
              }}
              className={`py-3 px-4 rounded-xl transition flex items-center justify-center space-x-2 ${
                activeTab === 'REDEEM_KEY'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Gift className="w-4 h-4" />
              <span>2. Redeem Key</span>
            </button>
          </div>

          {/* SECTION 1: ONLINE PAY */}
          {activeTab === 'ONLINE_PAY' && (
            <div className="space-y-5">
              {/* Coupon Code input */}
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Promo / Coupon Code (e.g. BOOST20)"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="flex-1 px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 uppercase font-mono"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition"
                >
                  Apply
                </button>
              </div>
              {appliedCoupon && (
                <p className="text-xs text-emerald-600 font-medium flex items-center space-x-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>Coupon '{appliedCoupon.code}' applied! Saved {appliedCoupon.percent}% ({currency}{discountAmount.toLocaleString()})</span>
                </p>
              )}
              {couponError && <p className="text-xs text-rose-500">{couponError}</p>}

              {/* Payment Method Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Select Payment Method
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'BKASH', label: 'bKash', color: 'bg-pink-50 border-pink-200 text-pink-700' },
                    { id: 'NAGAD', label: 'Nagad', color: 'bg-orange-50 border-orange-200 text-orange-700' },
                    { id: 'ROCKET', label: 'Rocket', color: 'bg-purple-50 border-purple-200 text-purple-700' },
                    { id: 'MANUAL_BANK', label: 'Bank / Cards', color: 'bg-blue-50 border-blue-200 text-blue-700' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id as PaymentMethod)}
                      className={`p-3 text-xs font-bold rounded-xl border text-center transition flex flex-col items-center justify-center space-y-1 ${
                        paymentMethod === m.id
                          ? `${m.color} ring-2 ring-blue-500 ring-offset-1`
                          : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
                      }`}
                    >
                      <span>{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Instruction Banner */}
              <div className="p-4 bg-slate-900 text-white rounded-2xl shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-400 uppercase font-semibold">
                    Send Money / Transfer to:
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyNumber}
                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center space-x-1 font-medium"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedAccount ? 'Copied!' : 'Copy Info'}</span>
                  </button>
                </div>
                <div className="text-base font-mono font-bold text-blue-300 break-all select-all">
                  {getNumberForMethod()}
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Send total amount <strong className="text-white">{currency}{finalAmount.toLocaleString()}</strong> to the above account, then copy the <strong>Transaction ID (TrxID)</strong> and paste below.
                </p>
              </div>

              {/* Form Fields */}
              <form onSubmit={handleSubmitOnlinePay} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Transaction ID (TrxID) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BK98X7721A0 or Bank Reference"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none uppercase font-mono"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Your Sender Account / Phone Number
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 01711XXXXXX"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      className="w-full px-4 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Payment Proof Link (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="https://imgur.com/... or image link"
                      value={paymentProofUrl}
                      onChange={(e) => setPaymentProofUrl(e.target.value)}
                      className="w-full px-4 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/25 transition flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {loading ? (
                    <span>Verifying & Generating License...</span>
                  ) : (
                    <>
                      <ShieldCheck className="w-5 h-5" />
                      <span>Submit Payment & Claim License ({currency}{finalAmount.toLocaleString()})</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* SECTION 2: REDEEM KEY */}
          {activeTab === 'REDEEM_KEY' && (
            <form onSubmit={handleSubmitRedeemKey} className="space-y-5">
              <div className="p-4 bg-indigo-50/70 border border-indigo-200 text-indigo-900 rounded-2xl text-xs space-y-1">
                <div className="font-bold flex items-center space-x-1.5 text-indigo-800">
                  <Key className="w-4 h-4 text-indigo-600" />
                  <span>Product Specific Redeem Key Activation</span>
                </div>
                <p className="text-indigo-700 leading-relaxed">
                  Enter the pre-generated Redeem Key for <strong>{product.name}</strong>. Note that a redeem key created for another product will not be accepted.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Redeem Key Code <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DUDE-882A-990B"
                  value={redeemCode}
                  onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 text-base bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none uppercase font-mono tracking-wider font-bold text-slate-800"
                />
              </div>

              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-500/25 transition flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {loading ? (
                  <span>Validating Key & Activating...</span>
                ) : (
                  <>
                    <Zap className="w-5 h-5 fill-current" />
                    <span>Redeem & Instantly Activate Product</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      ) : (
        /* Order Complete Screen */
        <div className="text-center py-4">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-1">
            {activeTab === 'REDEEM_KEY' ? 'Redeem Key Activated!' : 'Order Submitted Successfully!'}
          </h3>
          <p className="text-xs text-slate-500 mb-6">
            Reference Number: <strong className="text-slate-800 font-mono">{successData.orderNumber}</strong>
          </p>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl mb-6 text-left space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Status:</span>
              <Badge variant={successData.autoActivated ? 'active' : 'pending'}>
                {successData.autoActivated ? 'ACTIVATED & READY' : 'PENDING VERIFICATION'}
              </Badge>
            </div>
            {successData.autoActivated ? (
              <p className="text-slate-600">
                ⚡ Product activated! Your active license key is now available in your <strong>User Dashboard</strong> under <strong>My Subscriptions</strong>.
              </p>
            ) : (
              <p className="text-slate-600">
                🕒 Our admin team is manually reviewing your payment details. Approval typically takes 5–15 minutes.
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="/dashboard"
              className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition flex items-center justify-center space-x-2"
            >
              <span>Go to My Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </a>
            <button
              onClick={handleResetModal}
              className="py-3 px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};
