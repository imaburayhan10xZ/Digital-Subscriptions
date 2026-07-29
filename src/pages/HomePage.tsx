import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/common/Navbar.tsx';
import { Footer } from '../components/common/Footer.tsx';
import { ProductDetailModal } from '../components/common/ProductDetailModal.tsx';
import { Product, Category } from '../types/index.js';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.tsx';
import { useCart } from '../context/CartContext.tsx';
import { motion } from 'motion/react';
import {
  Zap,
  Sparkles,
  CheckCircle2,
  ShoppingCart,
  Eye,
  Search,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { settings } = useAuth();
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prods, cats] = await Promise.all([api.getProducts(), api.getCategories()]);
        setProducts(prods);
        setCategories(cats);
      } catch (e) {
        console.error('Failed to load data:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      selectedCategory === 'All' ||
      p.category.toLowerCase().includes(selectedCategory.toLowerCase());
    const matchesSearch =
      !searchQuery.trim() ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.shortDescription.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const currency = settings?.currencySymbol || '৳';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-500 selection:text-white flex flex-col justify-between">
      <div>
        <Navbar activeTab="home" />

        {/* HERO SECTION */}
        <section className="relative pt-12 pb-12 px-4 sm:px-8 overflow-hidden text-center">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-blue-400/20 via-indigo-400/15 to-purple-400/10 blur-[120px] rounded-full pointer-events-none" />

          <div className="max-w-4xl mx-auto relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-4"
            >
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-semibold shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-spin" />
                <span>Instant Digital Subscriptions & License Keys Store</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-[1.1]">
                Official <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">Digital Products</span> & Subscriptions
              </h1>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl mx-auto">
                Explore premium accounts, software keys, and digital subscriptions. Select any product to view details or add directly to your cart for instant checkout.
              </p>

              {/* Search Bar */}
              <div className="max-w-md mx-auto relative pt-2">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-5 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search products by title or keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm"
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* CATEGORIES & PRODUCTS GRID SECTION */}
        <section className="pb-20 px-4 sm:px-8 max-w-7xl mx-auto">
          {/* Category Filter Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8 text-xs font-bold">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`px-4 py-2 rounded-xl transition shadow-sm ${
                selectedCategory === 'All'
                  ? 'bg-blue-600 text-white shadow-blue-500/20'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-4 py-2 rounded-xl transition shadow-sm ${
                  selectedCategory.toLowerCase() === cat.name.toLowerCase()
                    ? 'bg-blue-600 text-white shadow-blue-500/20'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-80 bg-white rounded-3xl animate-pulse border border-slate-200" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-16 text-center text-slate-400 bg-white rounded-3xl border border-slate-200">
              <p className="font-bold text-slate-600 text-sm">No products found in this category</p>
              <p className="text-xs mt-1">Try selecting a different category or clear search query.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filteredProducts.map((p) => {
                const basePrice = p.salePrice && p.salePrice > 0 ? p.salePrice : p.price;
                const durationDisplay = p.durationText || `${p.durationValue} ${p.durationUnit.toLowerCase()}`;

                return (
                  <div
                    key={p.id}
                    className={`group relative p-6 rounded-3xl bg-white border transition-all flex flex-col justify-between shadow-sm hover:shadow-xl ${
                      p.popular
                        ? 'border-blue-400 ring-2 ring-blue-500/10'
                        : 'border-slate-200/80 hover:border-blue-300'
                    }`}
                  >
                    {p.popular && (
                      <div className="absolute -top-3 left-6 px-3 py-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-extrabold uppercase tracking-wider rounded-full shadow-md">
                        Popular
                      </div>
                    )}

                    <div>
                      {/* Thumbnail & Clickable Header */}
                      <div
                        onClick={() => setDetailProduct(p)}
                        className="cursor-pointer mb-4 space-y-3"
                      >
                        <div className="w-full h-44 bg-slate-100 rounded-2xl overflow-hidden border border-slate-200/60 relative">
                          <img
                            src={p.image || 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&q=80&w=800'}
                            alt={p.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-slate-900/0 transition" />
                          <span className="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-bold text-slate-700 shadow-sm border border-slate-200">
                            {p.category}
                          </span>
                        </div>

                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-base font-black text-slate-900 leading-tight group-hover:text-blue-600 transition">
                            {p.name}
                          </h3>
                        </div>

                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                          {p.shortDescription}
                        </p>
                      </div>

                      {/* Pricing & Duration info */}
                      <div className="mb-4 pb-4 border-b border-slate-100 flex items-baseline justify-between">
                        <div>
                          <div className="flex items-baseline space-x-1.5">
                            <span className="text-2xl font-black text-slate-900">
                              {currency}{basePrice.toLocaleString()}
                            </span>
                            {p.salePrice && p.salePrice > 0 && (
                              <span className="text-xs text-slate-400 line-through">
                                {currency}{p.price.toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Manual Duration string display */}
                        <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200/80 px-2.5 py-1 rounded-xl uppercase tracking-wide">
                          {durationDisplay}
                        </span>
                      </div>

                      {/* Features list (top 3) */}
                      {p.features && p.features.length > 0 && (
                        <ul className="space-y-2 mb-6 text-xs text-slate-600">
                          {p.features.slice(0, 3).map((feat, i) => (
                            <li key={i} className="flex items-center space-x-2">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                              <span className="truncate">{feat}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                      <button
                        onClick={() => setDetailProduct(p)}
                        className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center justify-center space-x-1.5"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-500" />
                        <span>View Info</span>
                      </button>

                      <button
                        onClick={() => addToCart(p)}
                        className="py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition flex items-center justify-center space-x-1.5"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>Add to Cart</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      <Footer />

      {/* Product Detail Modal */}
      <ProductDetailModal
        isOpen={!!detailProduct}
        onClose={() => setDetailProduct(null)}
        product={detailProduct}
      />
    </div>
  );
};
