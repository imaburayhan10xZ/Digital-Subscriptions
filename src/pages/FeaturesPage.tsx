import React from 'react';
import { Navbar } from '../components/common/Navbar.tsx';
import { Footer } from '../components/common/Footer.tsx';
import {
  Zap,
  Cpu,
  Activity,
  Gauge,
  Shield,
  RefreshCw,
  Sliders,
  HardDrive,
  Wifi,
  Cloud,
  Lock,
  CheckCircle2
} from 'lucide-react';

export const FeaturesPage: React.FC = () => {
  const featureList = [
    {
      title: 'FPS Kernel Optimization',
      desc: 'Bypasses legacy Windows thread throttles and forces high-priority DirectX/Vulkan scheduling for smooth frame delivery.',
      icon: Gauge,
      badge: 'Kernel Level',
    },
    {
      title: 'RAM Auto-Cleaner & Compactor',
      desc: 'Dynamically flushes standby memory caches before frame drops occur without crashing background apps.',
      icon: Activity,
      badge: 'Zero Latency',
    },
    {
      title: 'CPU Core Unparker & Isolation',
      desc: 'Unparks all physical CPU cores and assigns dedicated process priorities for P-cores vs E-cores.',
      icon: Cpu,
      badge: 'Hardware Sync',
    },
    {
      title: 'PingZero ISP Network Tunnel',
      desc: 'Optimizes TCP AckFrequency, Nagle Algorithm, and Asian ISP routing paths to reduce ping jitter by up to 40ms.',
      icon: Wifi,
      badge: 'Smart Routing',
    },
    {
      title: 'Auto Update & Cloud Sync',
      desc: 'Seamless silent background updates and instant cloud config backup across multiple PCs.',
      icon: RefreshCw,
      badge: 'Automated',
    },
    {
      title: '100% Anti-Cheat Safe Mode',
      desc: 'Operates without memory injection or registry corruption. Tested with Riot Vanguard, EAC, and BattlEye.',
      icon: Shield,
      badge: 'Zero Risk',
    },
    {
      title: 'Real-Time Performance Monitor',
      desc: 'Overlay stats showing real-time FPS, frame times, CPU temperatures, and network latency jitter.',
      icon: Sliders,
      badge: 'Live HUD',
    },
    {
      title: 'ApexHWID Protection Shield',
      desc: 'In-memory Hardware ID masking for Motherboard serials, GPU UUIDs, and MAC addresses.',
      icon: Lock,
      badge: 'Privacy Shield',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Navbar activeTab="features" />

      <section className="py-16 px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold mb-3">
            <Zap className="w-3.5 h-3.5" />
            <span>Architecture & Capabilities</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900">
            Engineered for Competitive Esports Performance
          </h1>
          <p className="text-sm text-slate-600 mt-3 leading-relaxed">
            Every feature in ApexBoost is designed to eliminate frame pacing stutter, input lag, and network packet loss.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featureList.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-sm hover:shadow-md transition group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {f.badge}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      <Footer />
    </div>
  );
};
