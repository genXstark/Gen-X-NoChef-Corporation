import React, { useState, useEffect } from 'react';
import { Bell, Search, User, LogOut, Settings, UserCircle, Zap, Command } from 'lucide-react';

interface TopbarProps {
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
}

export function Topbar({ setActiveTab, onLogout }: TopbarProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('global-search')?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      clearInterval(timer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className="h-16 flex items-center justify-between px-8 bg-panel/50 backdrop-blur-lg border-b border-border-glow z-20 relative sticky top-0">
      <div className="flex items-center gap-6 flex-1">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan animate-pulse shadow-[0_0_8px_#00f5ff]" />
          <span className="font-mono text-[10px] font-bold text-cyan uppercase tracking-[0.2em]">
            Panda_Network_Status: <span className="text-white">Optimal</span>
          </span>
        </div>
        
        {/* News Ticker */}
        <div className="flex-1 max-w-xl overflow-hidden bg-void/50 rounded-lg px-4 py-1.5 border border-white/5 hidden md:flex items-center gap-3">
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[8px] font-black bg-pink text-white px-1.5 py-0.5 rounded uppercase tracking-tighter animate-pulse">Live Feed</span>
            <div className="w-px h-3 bg-white/10" />
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="animate-marquee whitespace-nowrap text-[10px] font-mono text-text-muted uppercase tracking-[0.2em]">
              Maintenance scheduled for March 15th • New 4K Sports channels added • 50% Cashback on first top-up of the month • Server optimization complete • New API endpoints available •
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* System Time */}
        <div className="hidden xl:flex flex-col items-end">
          <span className="text-[10px] font-mono text-cyan font-bold uppercase tracking-widest">System Time</span>
          <span className="text-xs font-mono text-white font-black">{currentTime.toLocaleTimeString()}</span>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setActiveTab('mag-add')}
            className="px-4 py-1.5 bg-cyan/10 border border-cyan/30 rounded-lg text-cyan hover:bg-cyan/20 transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest shadow-lg"
          >
            <Zap className="w-3 h-3" /> 24h Trial
          </button>
        </div>

        <div className="relative group">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-cyan-400 transition-colors" />
          <input
            id="global-search"
            type="text"
            placeholder="Search (Ctrl+K)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-full pl-10 pr-12 py-1.5 text-sm text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition-all w-48 lg:w-64"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-white/10 border border-white/10 opacity-50">
            <Command className="w-2.5 h-2.5 text-white" />
            <span className="text-[8px] font-bold text-white">K</span>
          </div>
        </div>

        <button className="relative text-text-muted hover:text-white transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-pink-500 rounded-full shadow-[0_0_8px_rgba(255,0,128,0.8)]" />
        </button>

        <div className="relative">
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-3 pl-6 border-l border-white/10 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-violet-500 flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-medium text-white">Reseller Admin</span>
          </button>

          {isProfileOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setIsProfileOpen(false)} />
              <div className="absolute right-0 mt-2 w-48 glass-panel rounded-xl border-white/10 shadow-2xl z-40 py-2 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <button 
                  onClick={() => {
                    setActiveTab('profile');
                    setIsProfileOpen(false);
                  }}
                  className="w-full px-4 py-2 flex items-center gap-3 hover:bg-white/5 transition-all text-left group"
                >
                  <UserCircle className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold text-text-muted group-hover:text-white uppercase tracking-wider">Profile</span>
                </button>
                <button 
                  onClick={() => {
                    setActiveTab('profile');
                    setIsProfileOpen(false);
                  }}
                  className="w-full px-4 py-2 flex items-center gap-3 hover:bg-white/5 transition-all text-left group"
                >
                  <Settings className="w-4 h-4 text-violet-400" />
                  <span className="text-xs font-bold text-text-muted group-hover:text-white uppercase tracking-wider">Settings</span>
                </button>
                <div className="h-px bg-white/5 my-1" />
                <button 
                  onClick={onLogout}
                  className="w-full px-4 py-2 flex items-center gap-3 hover:bg-red/10 transition-all text-left group"
                >
                  <LogOut className="w-4 h-4 text-red" />
                  <span className="text-xs font-bold text-red uppercase tracking-wider">Logout</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
