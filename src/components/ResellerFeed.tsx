import React, { useState, useEffect } from 'react';
import { Zap, CreditCard, UserPlus, RefreshCw } from 'lucide-react';
import { clsx } from 'clsx';

interface FeedItem {
  id: string;
  user: string;
  action: string;
  amount: string;
  time: string;
  type: 'recharge' | 'sale' | 'new_reseller';
}

const ACTIONS = [
  { action: 'recharged', type: 'recharge' as const, icon: CreditCard, color: 'text-cyan' },
  { action: 'sold', type: 'sale' as const, icon: Zap, color: 'text-violet' },
  { action: 'provisioned', type: 'sale' as const, icon: RefreshCw, color: 'text-pink' },
  { action: 'joined the network', type: 'new_reseller' as const, icon: UserPlus, color: 'text-emerald-400' },
];

const NAMES = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Sigma', 'Omega', 'Zeta', 'Theta', 'Nova', 'Cyber'];

export function ResellerFeed() {
  const [items, setItems] = useState<FeedItem[]>([]);

  useEffect(() => {
    // Initial data
    const initialItems: FeedItem[] = Array.from({ length: 5 }).map((_, i) => generateItem());
    setItems(initialItems);

    const interval = setInterval(() => {
      setItems(prev => [generateItem(), ...prev.slice(0, 4)]);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  function generateItem(): FeedItem {
    const actionObj = ACTIONS[Math.floor(Math.random() * ACTIONS.length)];
    const name = NAMES[Math.floor(Math.random() * NAMES.length)];
    const amount = Math.floor(Math.random() * 20) + 1;
    
    return {
      id: Math.random().toString(36).substr(2, 9),
      user: `${name}***`,
      action: actionObj.action,
      amount: actionObj.type === 'new_reseller' ? '' : `${amount} Credits`,
      time: 'Just now',
      type: actionObj.type,
    };
  }

  return (
    <div className="glass-panel rounded-2xl p-6 border-white/5 relative overflow-hidden h-full">
      <div className="absolute inset-0 scanline-cyber opacity-20" />
      
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-5 h-5 text-cyan animate-spin-slow" />
          <h3 className="text-lg font-display font-bold text-white uppercase tracking-wider">Live Network Feed</h3>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold">Live</span>
        </div>
      </div>

      <div className="space-y-4 relative z-10">
        {items.map((item) => {
          const actionConfig = ACTIONS.find(a => a.action === item.action)!;
          return (
            <div 
              key={item.id} 
              className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/5 animate-in slide-in-from-top-4 fade-in duration-500"
            >
              <div className={clsx("w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0", actionConfig.color)}>
                <actionConfig.icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-text-primary font-bold truncate">
                  <span className="text-cyan">{item.user}</span> {item.action} {item.amount && <span className="text-white">{item.amount}</span>}
                </p>
                <p className="text-[10px] text-text-muted font-mono uppercase mt-0.5">{item.time}</p>
              </div>
              <div className="shrink-0">
                <div className={clsx("w-1.5 h-1.5 rounded-full", actionConfig.color.replace('text-', 'bg-'))} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-6 border-t border-white/5 relative z-10">
        <div className="flex justify-between items-center text-[10px] font-mono text-text-muted uppercase">
          <span>Global Activity</span>
          <span className="text-cyan">High Velocity</span>
        </div>
        <div className="w-full h-1 bg-white/5 rounded-full mt-2 overflow-hidden">
          <div className="h-full bg-cyan animate-[shimmer_2s_infinite]" style={{ width: '75%' }} />
        </div>
      </div>
    </div>
  );
}
