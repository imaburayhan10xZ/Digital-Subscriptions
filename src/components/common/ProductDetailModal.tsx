import React, { useState } from 'react';
import { Product } from '../../types/index.js';
import { Modal } from './Modal.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import { useCart } from '../../context/CartContext.tsx';
import { Zap, CheckCircle2, Shield, ShoppingCart, Check, HardDrive, Cpu } from 'lucide-react';

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  isOpen,
  onClose,
  product,
}) => {
  const { settings } = useAuth();
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  if (!product) return null;

  const currency = settings?.currencySymbol || '৳';
  const basePrice = product.salePrice && product.salePrice > 0 ? product.salePrice : product.price;
  const durationDisplay = product.durationText || `${product.durationValue} ${product.durationUnit.toLowerCase()}`;

  const handleAddToCart = () => {
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-3xl">
      <div className="space-y-6">
        {/* Top Header info */}
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/2 aspect-video md:aspect-square bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 shrink-0 relative">
            <img
              src={product.image || 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&q=80&w=800'}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {product.popular && (
              <span className="absolute top-3 left-3 px-3 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-extrabold uppercase rounded-full shadow-md">
                Popular Choice
              </span>
            )}
          </div>

          <div className="w-full md:w-1/2 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg uppercase tracking-wider">
                  {product.category}
                </span>
                {product.subscriptionTier && (
                  <span className="text-xs font-extrabold text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-0.5 rounded-lg uppercase">
                    {product.subscriptionTier}
                  </span>
                )}
                {product.version && (
                  <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg">
                    {product.version}
                  </span>
                )}
              </div>

              <h2 className="text-2xl font-black text-slate-900 leading-tight">{product.name}</h2>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">{product.shortDescription}</p>

              <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-black text-slate-900">
                    {currency}{basePrice.toLocaleString()}
                  </span>
                  {product.salePrice && product.salePrice > 0 && (
                    <span className="text-sm text-slate-400 line-through font-semibold">
                      {currency}{product.price.toLocaleString()}
                    </span>
                  )}
                  <span className="text-xs font-bold text-blue-600 bg-blue-100/70 px-2.5 py-1 rounded-lg ml-auto">
                    {durationDisplay}
                  </span>
                </div>
                {product.maintenanceFee > 0 && (
                  <div className="text-[11px] text-amber-600 font-medium mt-1">
                    Maintenance Fee: {currency}{product.maintenanceFee} / {product.maintenanceIntervalDays} days
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-slate-100/70 rounded-xl flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-blue-600 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 font-medium block">Warranty</span>
                    <span className="font-bold text-slate-800">24/7 Guaranteed</span>
                  </div>
                </div>
                <div className="p-2.5 bg-slate-100/70 rounded-xl flex items-center space-x-2">
                  <HardDrive className="w-4 h-4 text-indigo-600 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 font-medium block">HWID Lock</span>
                    <span className="font-bold text-slate-800">{product.maxDevices} Device(s)</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                className={`w-full py-3.5 rounded-xl text-xs font-bold transition shadow-lg flex items-center justify-center space-x-2 ${
                  added
                    ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/25'
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Added to Cart!</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    <span>Add to Cart ({currency}{basePrice.toLocaleString()})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Detailed Description & Features */}
        <div className="border-t border-slate-200/80 pt-5 space-y-4 text-xs">
          {product.longDescription && (
            <div>
              <h4 className="font-extrabold text-slate-900 text-sm mb-1.5">Product Description</h4>
              <p className="text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200/60">
                {product.longDescription}
              </p>
            </div>
          )}

          {product.features && product.features.length > 0 && (
            <div>
              <h4 className="font-extrabold text-slate-900 text-sm mb-2">Key Highlights & Features</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {product.features.map((feat, i) => (
                  <div key={i} className="flex items-start space-x-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200/50">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-slate-700 font-medium">{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
