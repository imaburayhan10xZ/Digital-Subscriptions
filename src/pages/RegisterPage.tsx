import React, { useState } from 'react';
import { Navbar } from '../components/common/Navbar.tsx';
import { Footer } from '../components/common/Footer.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { auth } from '../lib/firebase.js';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { Zap } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleSignup = async () => {
    setLoading(true);
    setError('');

    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      
      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
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
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Create Account</h1>
            <p className="text-xs text-slate-500">Join ApexBoost and claim your software license.</p>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 text-rose-600 border border-rose-200 rounded-xl text-xs font-medium">
              {error}
            </div>
          )}

          <button
            onClick={handleGoogleSignup}
            disabled={loading}
            className="w-full py-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-900 font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <span>{loading ? 'Creating Account...' : 'Continue with Google'}</span>
          </button>

          <p className="text-center text-xs text-slate-500">
            Already registered?{' '}
            <a href="/login" className="text-blue-600 font-bold hover:underline">
              Sign In
            </a>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};
