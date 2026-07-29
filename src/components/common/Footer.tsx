import React from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { Zap, ShieldCheck, Send, MessageSquare } from 'lucide-react';

export const Footer: React.FC = () => {
  const { settings } = useAuth();

  return (
    <footer className="bg-slate-900 text-slate-400 py-12 px-4 sm:px-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 pb-8 border-b border-slate-800">
        {/* Brand Info */}
        <div className="space-y-3 text-center md:text-left max-w-md">
          <a href="/" className="inline-flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <span className="text-xl font-black tracking-tight text-white">
              {settings?.siteName || 'ApexBoost'}
            </span>
          </a>
          <p className="text-xs leading-relaxed text-slate-400">
            {settings?.siteTagline || 'Instant Digital Subscriptions & License Keys Store.'} Official Warranty & Auto-Delivery.
          </p>
        </div>

        {/* Links */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-slate-300">
          <a href="/" className="hover:text-white transition">Home</a>
          <a href="/downloads" className="hover:text-white transition">Downloads</a>
          <a href="/faq" className="hover:text-white transition">FAQ</a>
          <a href="/contact" className="hover:text-white transition">Contact Us</a>
          <a href="/terms" className="hover:text-white transition">Terms & Privacy</a>
        </div>

        {/* Social / Support Links */}
        <div className="flex items-center space-x-3">
          <a
            href={settings?.telegramChannel || 'https://t.me/apexboost'}
            target="_blank"
            rel="noreferrer"
            className="p-2.5 bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white rounded-xl transition"
            title="Telegram Channel"
          >
            <Send className="w-4 h-4" />
          </a>
          <a
            href={settings?.discordUrl || 'https://discord.gg/apexboost'}
            target="_blank"
            rel="noreferrer"
            className="p-2.5 bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white rounded-xl transition"
            title="Discord Community"
          >
            <MessageSquare className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-blue-400" />
          <span>© {new Date().getFullYear()} {settings?.siteName || 'ApexBoost'}. All rights reserved.</span>
        </div>

        <div className="flex items-center space-x-3">
          <span className="text-[11px] bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md font-mono">bKash</span>
          <span className="text-[11px] bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md font-mono">Nagad</span>
          <span className="text-[11px] bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md font-mono">Rocket</span>
          <span className="text-[11px] bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md font-mono">Bank Wire</span>
        </div>
      </div>
    </footer>
  );
};
