import React, { useState } from 'react';
import { Modal } from './Modal.tsx';
import { useCart } from '../../context/CartContext.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import { CheckoutModal } from './CheckoutModal.tsx';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, ShieldCheck, Lock, AlertCircle, LogIn, UserPlus } from 'lucide-react';
import { Product } from '../../types/index.js';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartModal: React.FC<CartModalProps> = ({ isOpen, onClose }) => {
  const { cart, removeFromCart, updateQuantity, clearCart, totalAmount, totalCount } = useCart();
  const { user, settings } = useAuth();
  const [selectedProductForCheckout, setSelectedProductForCheckout] = useState<Product | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [authNotice, setAuthNotice] = useState(false);

  const currency = settings?.currencySymbol || '৳';

  const handleProceedToCheckout = () => {
    if (!user) {
      setAuthNotice(true);
      return;
    }
    if (cart.length === 0) return;
    // Checkout first product or summary
    setSelectedProductForCheckout(cart[0].product);
    setIsCheckoutOpen(true);
  };

  return (
    <>
      <Modal isOpen={isOpen && !isCheckoutOpen} onClose={onClose} maxWidth="max-w-xl">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">Your Shopping Cart</h3>
                <p className="text-xs text-slate-500">
                  {totalCount} item{totalCount !== 1 ? 's' : ''} in your cart
                </p>
              </div>
            </div>
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2.5 py-1 rounded-lg transition"
              >
                Clear Cart
              </button>
            )}
          </div>

          {/* Auth Notice (if user clicked Checkout while logged out) */}
          {authNotice && !user && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs space-y-3">
              <div className="flex items-start space-x-2.5 text-amber-800 font-bold">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>Account Login or Registration Required</span>
              </div>
              <p className="text-amber-700 leading-relaxed">
                Please log in or register a new account to attach your digital software licenses & warranties securely.
              </p>
              <div className="flex items-center space-x-3 pt-1">
                <a
                  href="/login"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl flex items-center space-x-1.5 transition"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Log In</span>
                </a>
                <a
                  href="/register"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center space-x-1.5 transition"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Sign Up Account</span>
                </a>
              </div>
            </div>
          )}

          {/* Cart List */}
          {cart.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-3">
              <ShoppingBag className="w-12 h-12 mx-auto text-slate-300" />
              <p className="font-bold text-slate-600 text-sm">Your cart is currently empty</p>
              <p className="text-xs">Browse our categories to select digital subscriptions or software keys.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {cart.map((item) => {
                const p = item.product;
                const price = p.salePrice && p.salePrice > 0 ? p.salePrice : p.price;
                const duration = p.durationText || `${p.durationValue} ${p.durationUnit.toLowerCase()}`;

                return (
                  <div
                    key={p.id}
                    className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <img
                        src={p.image || 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&q=80&w=200'}
                        alt={p.name}
                        className="w-12 h-12 object-cover rounded-xl border border-slate-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 truncate">{p.name}</h4>
                        <div className="flex items-center space-x-2 text-[10px] text-slate-500 mt-0.5">
                          <span className="bg-blue-100/70 text-blue-700 font-bold px-1.5 py-0.5 rounded">
                            {duration}
                          </span>
                          <span>•</span>
                          <span className="font-semibold text-slate-700">
                            {currency}{price.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 shrink-0">
                      <div className="flex items-center space-x-1 bg-white border border-slate-200 rounded-lg p-0.5">
                        <button
                          onClick={() => updateQuantity(p.id, item.quantity - 1)}
                          className="p-1 hover:bg-slate-100 text-slate-600 rounded"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-extrabold text-slate-800">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(p.id, item.quantity + 1)}
                          className="p-1 hover:bg-slate-100 text-slate-600 rounded"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(p.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Cart Footer Total & Checkout */}
          {cart.length > 0 && (
            <div className="pt-4 border-t border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">Total Amount:</span>
                <span className="text-2xl font-black text-slate-900">
                  {currency}{totalAmount.toLocaleString()}
                </span>
              </div>

              <button
                onClick={handleProceedToCheckout}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/25 transition flex items-center justify-center space-x-2"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </Modal>

      {/* Checkout Modal Trigger */}
      {selectedProductForCheckout && (
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => {
            setIsCheckoutOpen(false);
            setSelectedProductForCheckout(null);
          }}
          product={selectedProductForCheckout}
        />
      )}
    </>
  );
};
