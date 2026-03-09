import React from 'react';
import { Shield, Wallet, Clock, Zap, RefreshCw, Key, Plus, Activity, Layout, Eye, History } from 'lucide-react';
import { clsx } from 'clsx';

interface ProfileAPIProps {
  isGlassmorphic: boolean;
  setIsGlassmorphic: (val: boolean) => void;
}

export function ProfileAPI({ isGlassmorphic, setIsGlassmorphic }: ProfileAPIProps) {
  const stats = [
    { label: 'Total Subscriptions', value: '375', icon: Activity, color: 'text-cyan' },
    { label: 'Total Online', value: '5', icon: Zap, color: 'text-violet' },
    { label: 'Total Resellers', value: '0', icon: Shield, color: 'text-pink' },
    { label: 'Expires Tomorrow', value: '1', icon: Clock, color: 'text-orange' },
  ];

  const subscriptions = [
    { user: 'user_8821', date: '2026-02-27', credits: '3.0', type: 'New', duration: '3 Month', system: 'M3U' },
    { user: 'user_5512', date: '2026-02-27', credits: '0.0', type: 'Demo', duration: '1 Day', system: 'M3U' },
    { user: 'user_1190', date: '2026-02-27', credits: '6.0', type: 'Renew', duration: '6 Month', system: 'M3U' },
  ];

  const ispLockHistory = [
    { user: 'user_8821', date: '2026-02-20', reason: 'Travel', status: 'Cleared' },
    { user: 'user_1190', date: '2026-01-15', reason: 'ISP Change', status: 'Cleared' },
  ];

  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-display font-black text-white tracking-tighter uppercase italic">Profile</h1>
          <p className="text-text-muted font-mono text-xs uppercase tracking-[0.2em] mt-2">Manage your account and system preferences</p>
        </div>
        <div className="flex gap-4">
          <button className="px-6 py-2 rounded-lg bg-cyan/10 text-cyan border border-cyan/30 text-xs font-bold uppercase tracking-wider hover:bg-cyan/20 transition-all">
            Settings
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel rounded-2xl p-8 border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Shield className="w-32 h-32 text-cyan" />
            </div>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan to-violet p-1">
                <div className="w-full h-full rounded-full bg-void flex items-center justify-center">
                  <span className="text-2xl font-display font-bold text-white">CX</span>
                </div>
              </div>
              <div>
                <h2 className="text-xl font-display font-bold text-white">codexcipher</h2>
                <span className="px-2 py-0.5 rounded bg-green/10 text-green text-[10px] font-bold uppercase border border-green/20">Active</span>
              </div>
            </div>

            <div className="space-y-4">
              {stats.map((stat, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                  <div className="flex items-center gap-3">
                    <stat.icon className={clsx("w-4 h-4", stat.color)} />
                    <span className="text-xs text-text-muted uppercase font-mono">{stat.label}</span>
                  </div>
                  <span className="text-sm font-bold text-white">{stat.value}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 p-4 bg-cyan/5 border border-cyan/20 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Wallet className="w-5 h-5 text-cyan" />
                <div>
                  <p className="text-[10px] font-mono text-text-muted uppercase">Credits</p>
                  <p className="text-lg font-display font-bold text-white">91.0</p>
                </div>
              </div>
              <button className="p-2 rounded-lg bg-cyan/20 text-cyan hover:bg-cyan/30 transition-all">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* System Toggles */}
          <div className="glass-panel rounded-2xl p-6 border-white/5 space-y-6">
            <h3 className="text-sm font-display font-bold text-white uppercase tracking-widest flex items-center gap-2">
              <Layout className="w-4 h-4 text-cyan" /> System Preferences
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                <div>
                  <p className="text-xs font-bold text-white">Glassmorphism UI</p>
                  <p className="text-[10px] text-text-muted font-mono uppercase">Premium frosted aesthetic</p>
                </div>
                <button 
                  onClick={() => setIsGlassmorphic(!isGlassmorphic)}
                  className={clsx(
                    "w-10 h-5 rounded-full relative transition-all duration-300",
                    isGlassmorphic ? "bg-cyan" : "bg-white/10"
                  )}
                >
                  <div className={clsx(
                    "absolute top-1 w-3 h-3 rounded-full bg-white transition-all duration-300",
                    isGlassmorphic ? "left-6" : "left-1"
                  )} />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                <div>
                  <p className="text-xs font-bold text-white">Auto-Update VOD</p>
                  <p className="text-[10px] text-text-muted font-mono uppercase">Push new content automatically</p>
                </div>
                <button className="w-10 h-5 rounded-full bg-cyan relative">
                  <div className="absolute top-1 left-6 w-3 h-3 rounded-full bg-white" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tables Area */}
        <div className="lg:col-span-8 space-y-8">
          <div className="glass-panel rounded-2xl overflow-hidden border-white/5">
            <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center">
              <h3 className="text-lg font-display font-bold text-white uppercase tracking-wider">Latest Subscriptions</h3>
              <div className="flex gap-2">
                <button className="px-3 py-1 rounded bg-cyan/10 text-cyan text-[10px] font-bold">View All</button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5">
                    <th className="px-8 py-4 text-[10px] font-mono text-text-muted uppercase tracking-widest">Username</th>
                    <th className="px-8 py-4 text-[10px] font-mono text-text-muted uppercase tracking-widest">Date</th>
                    <th className="px-8 py-4 text-[10px] font-mono text-text-muted uppercase tracking-widest">Credits</th>
                    <th className="px-8 py-4 text-[10px] font-mono text-text-muted uppercase tracking-widest">Type</th>
                    <th className="px-8 py-4 text-[10px] font-mono text-text-muted uppercase tracking-widest">Duration</th>
                    <th className="px-8 py-4 text-[10px] font-mono text-text-muted uppercase tracking-widest">System</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {subscriptions.map((sub, i) => (
                    <tr key={i} className="hover:bg-white/5 transition-colors">
                      <td className="px-8 py-4 font-mono text-xs text-white">{sub.user}</td>
                      <td className="px-8 py-4 font-mono text-xs text-text-muted">{sub.date}</td>
                      <td className="px-8 py-4 font-mono text-xs text-cyan">{sub.credits}</td>
                      <td className="px-8 py-4">
                        <span className={clsx(
                          "px-2 py-0.5 rounded text-[8px] font-bold uppercase",
                          sub.type === 'New' ? 'bg-green/10 text-green' : 'bg-orange/10 text-orange'
                        )}>{sub.type}</span>
                      </td>
                      <td className="px-8 py-4 text-xs text-text-primary">{sub.duration}</td>
                      <td className="px-8 py-4">
                        <span className="px-2 py-0.5 rounded bg-white/5 text-text-muted text-[8px] font-bold uppercase">{sub.system}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="glass-panel rounded-2xl p-6 border-white/5">
              <div className="flex items-center gap-2 mb-6">
                <History className="w-5 h-5 text-pink" />
                <h3 className="text-lg font-display font-bold text-white uppercase tracking-wider">ISP Lock History</h3>
              </div>
              <div className="space-y-4">
                {ispLockHistory.map((log, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                    <div>
                      <p className="text-xs font-bold text-white">{log.user}</p>
                      <p className="text-[10px] text-text-muted font-mono uppercase">{log.reason}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-mono text-cyan font-bold uppercase">{log.status}</p>
                      <p className="text-[8px] text-text-muted font-mono">{log.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="glass-panel rounded-2xl p-6 border-white/5">
              <h3 className="text-lg font-display font-bold text-white uppercase tracking-wider mb-6">Latest Activities</h3>
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                    <div className="w-8 h-8 rounded-lg bg-cyan/10 flex items-center justify-center">
                      <Zap className="w-4 h-4 text-cyan" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Login detected</p>
                      <p className="text-[10px] text-text-muted font-mono">IP: 45.44.250.167</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
