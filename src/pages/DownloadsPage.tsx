import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/common/Navbar.tsx';
import { Footer } from '../components/common/Footer.tsx';
import { DownloadRelease, License } from '../types/index.js';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.tsx';
import { NotificationModal, NotificationState } from '../components/common/NotificationModal.tsx';
import { Download, Lock, Globe, Cpu, Sparkles } from 'lucide-react';

export const DownloadsPage: React.FC = () => {
  const { user } = useAuth();
  const [downloads, setDownloads] = useState<DownloadRelease[]>([]);
  const [userLicenses, setUserLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<'ALL' | 'GLOBAL' | 'MEMBERS'>('ALL');

  const [notifPopup, setNotifPopup] = useState<NotificationState>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dData = await api.getDownloads();
        setDownloads(dData);

        if (user) {
          const lData = await api.getUserLicenses();
          setUserLicenses(lData);
        }
      } catch (e) {
        console.error('Failed to load downloads data:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleDownloadClick = async (d: DownloadRelease, hasAccess: boolean) => {
    if (!hasAccess) {
      if (!user) {
        setNotifPopup({
          isOpen: true,
          type: 'warning',
          title: 'Members-Only Software Build',
          message: `The release "${d.productName}" is reserved for active members. Please log in and purchase a subscription license to download this file.`,
          actionText: 'Log In / Sign Up',
          actionUrl: '/login',
        });
        return;
      }
      setNotifPopup({
        isOpen: true,
        type: 'warning',
        title: 'Active License Required',
        message: `You do not have an active product license for "${d.productName}". Purchase a key or redeem your product code to access this release.`,
        actionText: 'View Product Catalog',
        actionUrl: '/products',
      });
      return;
    }

    // Track download in background
    api.trackDownload(d.id);

    // Direct trigger and UI popup notification
    if (d.fileUrl) {
      setNotifPopup({
        isOpen: true,
        type: 'download',
        title: 'Downloading Software Build',
        message: `Your download for "${d.productName}" (${d.version}) is starting now. If your browser blocks popups, click the direct download button below.`,
        actionText: 'Direct File Download',
        actionUrl: d.fileUrl,
      });

      setTimeout(() => {
        if (d.fileUrl.startsWith('http://') || d.fileUrl.startsWith('https://')) {
          window.open(d.fileUrl, '_blank');
        } else {
          const link = document.createElement('a');
          link.href = d.fileUrl;
          link.download = '';
          link.target = '_blank';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      }, 600);
    } else {
      setNotifPopup({
        isOpen: true,
        type: 'error',
        title: 'Download Link Unconfigured',
        message: `The download link for "${d.productName}" has not been set by Admin yet. Please try again later or contact support.`,
      });
    }
  };

  // Filter to strictly ONLY Global Releases for the public page
  const globalDownloads = downloads.filter((d) => d.accessType === 'GLOBAL' || d.productId === 'global');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Navbar activeTab="downloads" />

      <section className="py-12 sm:py-16 px-4 sm:px-8 max-w-6xl mx-auto space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200 text-xs font-bold">
            <Globe className="w-3.5 h-3.5" />
            <span>Public Global Releases & Diagnostic Tools</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900">
            Global Downloads
          </h1>
          <p className="text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
            Free diagnostic tools, system compatibility checkers, and global software releases open to all visitors.
          </p>
        </div>

        {/* Banner for Members-Only software */}
        <div className="p-4 sm:p-5 bg-purple-900 text-white rounded-2xl shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3 text-xs">
            <div className="w-10 h-10 rounded-xl bg-purple-800 flex items-center justify-center shrink-0 border border-purple-700">
              <Lock className="w-5 h-5 text-purple-300" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">Looking for your Purchased Product Installers?</h4>
              <p className="text-purple-200 text-xs mt-0.5">
                Members-only software releases are hosted securely inside your Customer Dashboard once you purchase a product.
              </p>
            </div>
          </div>
          <a
            href={user ? '/dashboard' : '/login'}
            className="px-4 py-2.5 bg-white hover:bg-purple-50 text-purple-900 font-bold text-xs rounded-xl shadow transition shrink-0 inline-flex items-center space-x-1.5"
          >
            <span>{user ? 'Go to My Dashboard' : 'Log In to Dashboard'}</span>
          </a>
        </div>

        {/* Global Releases List */}
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs font-bold">
            Loading global releases...
          </div>
        ) : globalDownloads.length === 0 ? (
          <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl text-slate-500 text-xs font-medium space-y-2">
            <Globe className="w-8 h-8 text-slate-300 mx-auto" />
            <p>No public global software releases are currently listed.</p>
            <p className="text-[11px] text-slate-400">Please check back soon or log in to access your purchased product downloads.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {globalDownloads.map((d) => (
              <div
                key={d.id}
                className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-xs hover:shadow-md transition flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
              >
                <div className="space-y-2.5 max-w-2xl flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-900">{d.productName}</h3>
                    <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md border border-slate-200">
                      {d.version}
                    </span>

                    <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <Globe className="w-3 h-3" />
                      <span>Global Release</span>
                    </span>

                    {d.isLatest && (
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded">
                        Latest Build
                      </span>
                    )}
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 font-mono leading-relaxed">
                    ⚡ <strong>Changelog:</strong> {d.changelog}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                    <span>File Size: <strong className="text-slate-700 font-mono">{d.fileSize}</strong></span>
                    <span>•</span>
                    <span>Release Date: {d.releaseDate}</span>
                    <span>•</span>
                    <span>Total Downloads: {(d.downloadCount || 0).toLocaleString()}</span>
                  </div>
                </div>

                {/* Download Action Button */}
                <div className="w-full md:w-auto shrink-0 text-center">
                  <button
                    onClick={() => handleDownloadClick(d, true)}
                    className="w-full md:w-auto px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center space-x-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Global Tool ({d.fileSize})</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* System Specifications Info */}
        <div className="p-6 bg-white border border-slate-200/80 rounded-2xl space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <Cpu className="w-4 h-4 text-purple-600" />
            <span>System Requirements & Installation Note</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-600">
            <div>
              <strong className="block text-slate-900 font-bold mb-1">Operating System</strong>
              Windows 10 / 11 (64-bit Edition)
            </div>
            <div>
              <strong className="block text-slate-900 font-bold mb-1">Hardware ID Lock</strong>
              HWID auto-locks on first launch (anti-sharing)
            </div>
            <div>
              <strong className="block text-slate-900 font-bold mb-1">Direct Download Link</strong>
              Opens administrator-verified installer link
            </div>
          </div>
        </div>
      </section>

      <NotificationModal
        {...notifPopup}
        onClose={() => setNotifPopup((prev) => ({ ...prev, isOpen: false }))}
      />

      <Footer />
    </div>
  );
};
