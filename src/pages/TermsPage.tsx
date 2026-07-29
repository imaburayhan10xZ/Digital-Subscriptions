import React from 'react';
import { Navbar } from '../components/common/Navbar.tsx';
import { Footer } from '../components/common/Footer.tsx';

export const TermsPage: React.FC = () => (
  <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
    <Navbar />
    <div className="max-w-4xl mx-auto py-16 px-4 sm:px-8">
      <h1 className="text-3xl font-black text-slate-900 mb-6">Terms of Service</h1>
      <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-4 text-xs text-slate-600 leading-relaxed">
        <p>Welcome to ApexBoost. By purchasing or using our game booster software and license keys, you agree to comply with the following terms:</p>
        <h3 className="font-bold text-slate-900 text-sm">1. License Usage</h3>
        <p>Each license key is single-user and locked to your computer hardware ID (HWID). Redistribution or sharing of keys is strictly prohibited.</p>
        <h3 className="font-bold text-slate-900 text-sm">2. Payments & Activation</h3>
        <p>Payments made via bKash, Nagad, Rocket, or Bank Wire must include a valid Transaction ID (TrxID). Submitting fraudulent TrxIDs will result in permanent account suspension.</p>
        <h3 className="font-bold text-slate-900 text-sm">3. Maintenance Fees</h3>
        <p>Certain permanent/lifetime software packages require a maintenance fee as specified on the pricing page to sustain kernel driver compatibility with new Windows updates.</p>
      </div>
    </div>
    <Footer />
  </div>
);

export const PrivacyPage: React.FC = () => (
  <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
    <Navbar />
    <div className="max-w-4xl mx-auto py-16 px-4 sm:px-8">
      <h1 className="text-3xl font-black text-slate-900 mb-6">Privacy Policy</h1>
      <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-4 text-xs text-slate-600 leading-relaxed">
        <p>At ApexBoost, we value user data privacy:</p>
        <h3 className="font-bold text-slate-900 text-sm">1. Information We Collect</h3>
        <p>We collect your email address, phone number (for payment verification), and anonymous system HWID hashes purely for software license validation.</p>
        <h3 className="font-bold text-slate-900 text-sm">2. No Personal Scanning</h3>
        <p>ApexBoost never scans, collects, or transmits your personal files, browser history, or passwords.</p>
      </div>
    </div>
    <Footer />
  </div>
);

export const RefundPage: React.FC = () => (
  <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
    <Navbar />
    <div className="max-w-4xl mx-auto py-16 px-4 sm:px-8">
      <h1 className="text-3xl font-black text-slate-900 mb-6">Refund & Cancellation Policy</h1>
      <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-4 text-xs text-slate-600 leading-relaxed">
        <p>Due to the digital nature of software licenses:</p>
        <h3 className="font-bold text-slate-900 text-sm">1. Digital License Non-Refundability</h3>
        <p>Once a license key has been activated or revealed in your dashboard, refunds are generally not offered unless technical defect is proven.</p>
        <h3 className="font-bold text-slate-900 text-sm">2. Duplicate Payments</h3>
        <p>If you accidentally make a duplicate bKash or Nagad payment, contact our support team with both TrxIDs for an immediate refund or credit extension.</p>
      </div>
    </div>
    <Footer />
  </div>
);
