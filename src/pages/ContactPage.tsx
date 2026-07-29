import React, { useState } from 'react';
import { Navbar } from '../components/common/Navbar.tsx';
import { Footer } from '../components/common/Footer.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { Send, MessageSquare, Mail, Phone, CheckCircle2 } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const { settings } = useAuth();
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Navbar activeTab="contact" />

      <section className="py-16 px-4 sm:px-8 max-w-5xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900">Get in Touch</h1>
          <p className="text-xs text-slate-500 mt-2">Our support team is active 24/7 on Telegram, Discord, and Ticket Portal.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Direct channels */}
          <div className="md:col-span-5 space-y-4">
            <div className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-4">Official Channels</h3>
              <div className="space-y-3 text-xs">
                <a
                  href={settings?.telegramChannel || 'https://t.me/apexboost'}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center space-x-3 p-3 bg-slate-50 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition border border-slate-100"
                >
                  <Send className="w-5 h-5 text-blue-500" />
                  <div>
                    <strong className="block font-bold">Telegram Support</strong>
                    <span className="text-[11px] text-slate-400">@apexboost_support</span>
                  </div>
                </a>

                <a
                  href={settings?.discordUrl || 'https://discord.gg/apexboost'}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center space-x-3 p-3 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition border border-slate-100"
                >
                  <MessageSquare className="w-5 h-5 text-indigo-500" />
                  <div>
                    <strong className="block font-bold">Discord Server</strong>
                    <span className="text-[11px] text-slate-400">discord.gg/apexboost</span>
                  </div>
                </a>

                <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <Mail className="w-5 h-5 text-emerald-500" />
                  <div>
                    <strong className="block font-bold">Support Email</strong>
                    <span className="text-[11px] text-slate-400">{settings?.supportEmail || 'support@apexboost.io'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="md:col-span-7 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900 mb-2">Send Direct Inquiry</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Your Name</label>
                    <input
                      type="text"
                      required
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Payment inquiry / Custom license"
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Message</label>
                  <textarea
                    rows={4}
                    required
                    className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition"
                >
                  Send Message
                </button>
              </form>
            ) : (
              <div className="text-center py-8 space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <h4 className="text-base font-bold text-slate-900">Message Received!</h4>
                <p className="text-xs text-slate-500">Our support staff will reply to your email within 1 hour.</p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="text-xs text-blue-600 font-bold hover:underline"
                >
                  Send Another Message
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
