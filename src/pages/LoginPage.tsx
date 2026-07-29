import React, { useState } from 'react';
import { Navbar } from '../components/common/Navbar.tsx';
import { Footer } from '../components/common/Footer.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.js';
import { Zap, Lock, Mail, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.login({ email, password });
      login(res.token, res.user);
      if (res.user.role === 'ADMIN') {
        window.location.href = '/admin';
      } else {
        window.location.href = '/dashboard';
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillTestAdmin = () => {
    setEmail('admin@apexboost.io');
    setPassword('admin123');
  };

  const fillTestCustomer = () => {
    setEmail('user@apexboost.io');
    setPassword('user123');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col justify-between">
      <Navbar />

      <main className="py-16 px-4 sm:px-8 max-w-md mx-auto w-full">
        <div className="bg-white border border-slate-200/80 p-8 rounded-3xl shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-blue-500/20">
              <Zap className="w-6 h-6 fill-current" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Welcome Back</h1>
            <p className="text-xs text-slate-500">Access your ApexBoost licenses, downloads, and tickets.</p>
          </div>

          {/* Quick Demo Credentials Box */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              ⚡ Quick Demo One-Click Fill
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={fillTestAdmin}
                className="py-1.5 px-2.5 bg-purple-100 hover:bg-purple-200 text-purple-700 font-bold rounded-lg text-[11px] transition flex items-center justify-center space-x-1"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Fill Admin</span>
              </button>
              <button
                type="button"
                onClick={fillTestCustomer}
                className="py-1.5 px-2.5 bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold rounded-lg text-[11px] transition flex items-center justify-center space-x-1"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Fill Customer</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 text-rose-600 border border-rose-200 rounded-xl text-xs font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="text-center text-xs text-slate-500">
            Don't have an account?{' '}
            <a href="/register" className="text-blue-600 font-bold hover:underline">
              Create Account
            </a>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};
