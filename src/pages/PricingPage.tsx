import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/common/Navbar.tsx';
import { Footer } from '../components/common/Footer.tsx';
import { CheckoutModal } from '../components/common/CheckoutModal.tsx';
import { Product } from '../types/index.js';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.tsx';
import { Zap, CheckCircle2, Shield } from 'lucide-react';

export const PricingPage: React.FC = () => {
  const { settings } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await api.getProducts();
        setProducts(data);
      } catch (e) {
        console.error('Failed to load products:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleOpenBuy = (p: Product) => {
    setSelectedProduct(p);
    setIsCheckoutOpen(true);
  };

  const currency = settings?.currencySymbol || '৳';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Navbar activeTab="pricing" />

      <section className="py-16 px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900">
            Software Plans & License Pricing
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            No recurring auto-debit surprise. Pay easily via bKash, Nagad, Rocket, or Bank Wire.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-96 bg-slate-100 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {products.map((p) => {
              const basePrice = p.salePrice && p.salePrice > 0 ? p.salePrice : p.price;
              return (
                <div
                  key={p.id}
                  className={`p-8 bg-white border rounded-3xl shadow-lg flex flex-col justify-between ${
                    p.popular ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-200'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg inline-block mb-3">
                      {p.category}
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{p.name}</h3>
                    <p className="text-xs text-slate-500 mb-6 leading-relaxed">{p.shortDescription}</p>

                    <div className="pb-6 border-b border-slate-100 mb-6">
                      <div className="text-3xl font-black text-slate-900">
                        {currency}{basePrice.toLocaleString()}
                      </div>
                      <span className="text-xs text-slate-400 font-medium">
                        / {p.durationValue} {p.durationUnit.toLowerCase()} plan ({p.maxDevices} Device HWID Lock)
                      </span>
                    </div>

                    <ul className="space-y-3 mb-8">
                      {p.features.map((feat, i) => (
                        <li key={i} className="flex items-start text-xs text-slate-600 space-x-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => handleOpenBuy(p)}
                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center space-x-2"
                  >
                    <Zap className="w-4 h-4 fill-current" />
                    <span>Purchase License ({currency}{basePrice.toLocaleString()})</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <Footer />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        product={selectedProduct}
      />
    </div>
  );
};
