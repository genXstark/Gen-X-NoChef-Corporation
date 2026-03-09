import React, { useState, useEffect } from 'react';
import { Server, Shield, Clock, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { iptvService } from '../services/iptvService';
import { clsx } from 'clsx';

export function ToolsServices() {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const info = await iptvService.getResellerInfo();
      setStatus(info);
    } catch (error) {
      console.error('Error fetching service status:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-display font-black text-white uppercase italic tracking-tighter">
          My <span className="text-cyan">Services</span>
        </h1>
        <p className="text-text-muted font-mono text-xs uppercase tracking-widest">Master Panel Connectivity Status</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass-panel p-8 rounded-3xl border-white/5 space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan/5 blur-3xl -mr-16 -mt-16" />
          
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan/10 border border-cyan/30 flex items-center justify-center text-cyan shadow-inner">
              <Server className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-display font-bold text-white uppercase tracking-wider">Activation Panel</h3>
              <p className="text-xs text-text-muted font-mono">activationpanel.net</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
              <span className="text-xs font-mono text-text-muted uppercase">Connection</span>
              <div className="flex items-center gap-2">
                <div className={clsx("w-2 h-2 rounded-full animate-pulse", status ? "bg-emerald-400 shadow-[0_0_8px_#34d399]" : "bg-red shadow-[0_0_8px_#ff3060]")} />
                <span className={clsx("text-xs font-bold uppercase", status ? "text-emerald-400" : "text-red")}>
                  {status ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
              <span className="text-xs font-mono text-text-muted uppercase">API Key Status</span>
              <div className="flex items-center gap-2">
                <Shield className="w-3 h-3 text-cyan" />
                <span className="text-xs font-mono text-white">••••••••••••••••</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
              <span className="text-xs font-mono text-text-muted uppercase">Last Sync</span>
              <div className="flex items-center gap-2">
                <Clock className="w-3 h-3 text-text-muted" />
                <span className="text-xs font-mono text-text-muted">{new Date().toLocaleTimeString()}</span>
              </div>
            </div>
          </div>

          <button 
            onClick={fetchStatus}
            disabled={loading}
            className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-xs font-mono text-text-muted uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw className={clsx("w-4 h-4", loading && "animate-spin")} />
            Sync Now
          </button>
        </div>

        <div className="glass-panel p-8 rounded-3xl border-white/5 space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-violet/5 blur-3xl -mr-16 -mt-16" />
          
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-violet/10 border border-violet/30 flex items-center justify-center text-violet shadow-inner">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-display font-bold text-white uppercase tracking-wider">Security Profile</h3>
              <p className="text-xs text-text-muted font-mono">Encrypted Tunnel Active</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-emerald-400/5 border border-emerald-400/10 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">SSL Verified</span>
              </div>
              <p className="text-[10px] text-emerald-400/60 leading-relaxed">All API requests are routed through an encrypted proxy tunnel to protect master credentials.</p>
            </div>

            <div className="p-4 bg-cyan/5 border border-cyan/10 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-cyan">
                <AlertCircle className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">IP Whitelist</span>
              </div>
              <p className="text-[10px] text-cyan/60 leading-relaxed">Your current server IP is authorized for master panel access.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
