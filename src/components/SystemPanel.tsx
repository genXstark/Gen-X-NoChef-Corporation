import React from 'react';
import { Activity, Shield, Zap, AlertCircle, X } from 'lucide-react';
import { clsx } from 'clsx';

const logs = [
  { time: '23:45:12', msg: 'Server Node 4 connected', type: 'success' },
  { time: '23:45:13', msg: 'Database backup completed', type: 'info' },
  { time: '23:48:55', msg: 'High latency detected in EU-West', type: 'warning' },
  { time: '23:50:10', msg: 'New reseller application: NovaStream', type: 'info' },
  { time: '23:52:04', msg: 'DDOS mitigation active on Node 7', type: 'error' },
  { time: '23:55:30', msg: 'System update v4.2.1 deployed', type: 'success' },
];

export function SystemPanel({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  return (
    <div className={clsx(
      "fixed right-0 top-0 h-screen w-80 glass-panel border-l border-border-glow z-30 transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]",
      isOpen ? "translate-x-0" : "translate-x-full"
    )}>
      <div className="p-6 h-full flex flex-col">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            <h3 className="font-display font-bold text-white tracking-wider">System Intelligence</h3>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6 flex-1 overflow-y-auto pr-2">
          <section>
            <h4 className="text-xs font-mono text-text-muted uppercase tracking-widest mb-4">Server Health</h4>
            <div className="space-y-3">
              {[
                { label: 'CPU Load', val: '12%', color: 'bg-green-400' },
                { label: 'Memory', val: '45%', color: 'bg-cyan-400' },
                { label: 'Network', val: '890Mbps', color: 'bg-violet-400' },
              ].map((stat, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-text-muted">{stat.label}</span>
                    <span className="text-white">{stat.val}</span>
                  </div>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className={clsx("h-full rounded-full", stat.color)} style={{ width: stat.val.includes('%') ? stat.val : '70%' }} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h4 className="text-xs font-mono text-text-muted uppercase tracking-widest mb-4">AI Insights</h4>
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-cyan-400/5 border border-cyan-400/20">
                <div className="flex gap-2 mb-1">
                  <Zap className="w-3 h-3 text-cyan-400 mt-0.5" />
                  <p className="text-xs font-medium text-cyan-400">Optimization Tip</p>
                </div>
                <p className="text-xs text-text-muted leading-relaxed">Server load increased 12% in the last hour. Consider scaling Node 4.</p>
              </div>
              <div className="p-3 rounded-lg bg-pink-400/5 border border-pink-400/20">
                <div className="flex gap-2 mb-1">
                  <AlertCircle className="w-3 h-3 text-pink-400 mt-0.5" />
                  <p className="text-xs font-medium text-pink-400">Urgent Alert</p>
                </div>
                <p className="text-xs text-text-muted leading-relaxed">8 subscriptions expire in 24h. Send automated reminders?</p>
              </div>
            </div>
          </section>

          <section className="flex-1">
            <h4 className="text-xs font-mono text-text-muted uppercase tracking-widest mb-4">Live System Logs</h4>
            <div className="space-y-3 font-mono text-[10px]">
              {logs.map((log, i) => (
                <div key={i} className="flex gap-2">
                  <span className="text-text-muted">[{log.time}]</span>
                  <span className={clsx(
                    log.type === 'success' ? 'text-green-400' :
                    log.type === 'warning' ? 'text-orange-400' :
                    log.type === 'error' ? 'text-pink-400' : 'text-cyan-400'
                  )}>
                    {log.msg}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="mt-6 pt-6 border-t border-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-[0_0_8px_rgba(0,230,118,0.8)]" />
              <span className="text-xs font-mono text-text-muted uppercase tracking-widest">Live Sync Active</span>
            </div>
            <Shield className="w-4 h-4 text-cyan-400" />
          </div>
        </div>
      </div>
    </div>
  );
}
