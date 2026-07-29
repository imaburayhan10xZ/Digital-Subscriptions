import React, { useState } from 'react';
import { Navbar } from '../components/common/Navbar.tsx';
import { Footer } from '../components/common/Footer.tsx';
import { Search, ChevronDown, HelpCircle, Shield, CreditCard, Key } from 'lucide-react';

export const FAQPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How do I activate my license key?',
      a: 'After completing payment via bKash, Nagad, or Rocket, navigate to your User Dashboard under "My Licenses". Copy your unique key, open the ApexBoost launcher, paste the key, and click Activate.',
      cat: 'License',
    },
    {
      q: 'What is an HWID Lock and how do I reset it?',
      a: 'To prevent license sharing, your license is locked to your computer hardware ID (HWID). If you buy a new PC or upgrade components, you can click "Reset HWID" in your Dashboard under My Licenses.',
      cat: 'Hardware ID',
    },
    {
      q: 'How does payment verification work in Bangladesh?',
      a: 'When paying with bKash / Nagad / Rocket, send the exact amount to our merchant/personal number listed during checkout. Copy the 10-character TrxID (e.g. BK98X7721A0) and enter it during checkout for verification.',
      cat: 'Payments',
    },
    {
      q: 'Is ApexBoost permanent or subscription-based?',
      a: 'We offer both monthly subscriptions and lifetime permanent licenses depending on the product you select.',
      cat: 'Pricing',
    },
    {
      q: 'What is the maintenance fee?',
      a: 'Certain lifetime licenses include a nominal maintenance fee (e.g., ৳100 every 30 days) to cover ongoing kernel driver updates against new Windows builds.',
      cat: 'Maintenance',
    },
  ];

  const filtered = faqs.filter(
    (f) =>
      f.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.a.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Navbar activeTab="faq" />

      <section className="py-16 px-4 sm:px-8 max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900">Knowledge Base & FAQ</h1>
          <p className="text-xs text-slate-500 mt-2">Find instant answers to common software and payment questions.</p>

          <div className="mt-6 relative max-w-md mx-auto">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search FAQ keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="space-y-3">
          {filtered.map((faq, idx) => (
            <div key={idx} className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
              <button
                onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                className="w-full p-4 text-left text-sm font-bold text-slate-900 flex items-center justify-between hover:bg-slate-50 transition"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openIdx === idx ? 'rotate-180' : ''}`} />
              </button>
              {openIdx === idx && (
                <div className="px-4 pb-4 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
};
