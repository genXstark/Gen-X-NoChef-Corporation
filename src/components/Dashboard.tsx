import React, { useState, useEffect } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell,
  BarChart, Bar, Legend
} from 'recharts';
import { 
  Wallet, Users, Tv, AlertTriangle, Activity, Globe, 
  Newspaper, Clock, TrendingUp, Zap, Shield, Target,
  UserPlus, Ticket, DollarSign, PlusCircle, Send, Info,
  Bell, Settings, Calculator, BarChart3, Gauge, ArrowUpRight,
  Cpu, Database, Network, Megaphone, MessageSquare
} from 'lucide-react';
import { clsx } from 'clsx';
import { ResellerFeed } from './ResellerFeed';
import { AITools } from './AITools';

import { 
  collection, query, where, getDocs, onSnapshot, doc
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { iptvService } from '../services/iptvService';

const subscriptionData = [
  { name: 'Nov', new: 150, renew: 80, demo: 40 },
  { name: 'Dec', new: 220, renew: 120, demo: 60 },
  { name: 'Jan', new: 180, renew: 100, demo: 50 },
  { name: 'Feb', new: 250, renew: 140, demo: 70 },
];

const resellerData = [
  { name: 'codexcipher', value: 45, color: '#00f5ff' },
  { name: 'reseller_alpha', value: 25, color: '#8b00ff' },
  { name: 'reseller_beta', value: 15, color: '#ff0080' },
  { name: 'reseller_gamma', value: 10, color: '#ff6d00' },
  { name: 'reseller_delta', value: 5, color: '#00ff00' },
];

const kpis = [
  { title: 'Total Subscriptions', value: '165', icon: Users, color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/30', glow: 'glow-border-orange' },
  { title: 'Total Online', value: '6', icon: Tv, color: 'text-cyan-400', bg: 'bg-cyan-400/10', border: 'border-cyan-400/30', glow: 'glow-border-cyan' },
  { title: 'Total Resellers', value: '0', icon: Users, color: 'text-violet-400', bg: 'bg-violet-400/10', border: 'border-violet-400/30', glow: 'glow-border-violet' },
  { title: 'Expires Tomorrow', value: '3', icon: AlertTriangle, color: 'text-pink-400', bg: 'bg-pink-400/10', border: 'border-pink-400/30', glow: 'glow-border-pink' },
];


const todayLogs = [
  { id: 1, system: 'M3U', mac: 'ee8a9d2a30', expire: '2026-05-31', reseller: 'codexcipher', type: 'New', amount: '3.0' },
  { id: 2, system: 'M3U', mac: '8e0fe93529', expire: '2026-02-28', reseller: 'codexcipher', type: 'Demo', amount: '0.0' },
  { id: 3, system: 'M3U', mac: '396e9ee056', expire: '2026-02-28', reseller: 'codexcipher', type: 'Demo', amount: '0.0' },
  { id: 4, system: 'M3U', mac: '1607565e27', expire: '2026-08-27', reseller: 'codexcipher', type: 'Renew', amount: '6' },
  { id: 5, system: 'M3U', mac: '2e100f6d13', expire: '2026-02-28', reseller: 'codexcipher', type: 'Demo', amount: '0.0' },
];

export function Dashboard({ userData, setActiveTab }: { userData: any, setActiveTab: (tab: string) => void }) {
  const isAdmin = userData?.role === 'ADMIN';
  const isReseller = userData?.role === 'RESELLER';

  const actionButtons = [
    ...(isAdmin ? [
      { label: 'Admin Settings', icon: Settings, color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30', tab: 'admin-settings' },
      { label: 'Manage Resellers', icon: Users, color: 'bg-violet-500/20 text-violet-400 border-violet-500/30', tab: 'admin-resellers' },
      { label: 'Broadcast', icon: Megaphone, color: 'bg-pink-500/20 text-pink-400 border-pink-500/30', tab: 'admin-announcements' },
    ] : [
      { label: 'Add MAG', icon: PlusCircle, color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30', tab: 'mag-add' },
      { label: 'Add M3U', icon: PlusCircle, color: 'bg-violet-500/20 text-violet-400 border-violet-500/30', tab: 'm3u-add' },
      { label: 'Support Chat', icon: MessageSquare, color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', tab: 'support-chat' },
    ]),
    { label: 'Latest Updates', icon: Info, color: 'bg-purple-500/20 text-purple-400 border-purple-500/30', tab: 'tools-updates' },
  ];
  const [realtimeData, setRealtimeData] = useState<{time: string, load: number}[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalSubs: 0,
    online: 0,
    expiresSoon: 0,
    totalResellers: 0,
    apiCredits: '0',
    activeLines: 0
  });

  useEffect(() => {
    if (!userData || !db) return;

    // 1. Fetch Stats from Firestore
    const linesRef = collection(db, 'lines');
    const q = isAdmin 
      ? query(linesRef) 
      : query(linesRef, where('userId', '==', userData.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const now = new Date();
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      
      let soon = 0;
      let active = 0;
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const expire = new Date(data.expireDate);
        if (expire > now && expire <= tomorrow) soon++;
        if (data.status === 'active' || data.status === 'ACTIVE') active++;
      });

      setStats(prev => ({
        ...prev,
        totalSubs: snapshot.size,
        expiresSoon: soon,
        activeLines: active
      }));
    });

    // 2. If Admin, fetch Reseller count and API balance
    if (isAdmin) {
      const usersRef = collection(db, 'users');
      const resellersQ = query(usersRef, where('role', '==', 'RESELLER'));
      const unsubscribeResellers = onSnapshot(resellersQ, (snap) => {
        setStats(prev => ({ ...prev, totalResellers: snap.size }));
      });

      iptvService.getResellerInfo().then(info => {
        if (info.status === 'true') {
          setStats(prev => ({ ...prev, apiCredits: info.credits || '0' }));
        }
      });
    }

    // 3. Fetch Logs
    const logsRef = collection(db, 'logs');
    const logsQ = isAdmin
      ? query(logsRef)
      : query(logsRef, where('userId', '==', userData.uid));

    const unsubscribeLogs = onSnapshot(logsQ, (snapshot) => {
      const logsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp || 'Recent'
      })).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5);
      setLogs(logsData);
    });

    return () => {
      unsubscribe();
      unsubscribeLogs();
    };
  }, [userData, isAdmin]);

  const dynamicKpis = [
    { 
      title: isAdmin ? 'API Master Credits' : 'Credit Liquidity', 
      value: isAdmin ? stats.apiCredits : `${userData?.credits || 0}`, 
      icon: Wallet, 
      color: 'text-emerald-400', 
      bg: 'bg-emerald-400/10', 
      border: 'border-emerald-400/30', 
      glow: 'glow-border-cyan' 
    },
    { 
      title: isAdmin ? 'Total Resellers' : 'Total Subscriptions', 
      value: isAdmin ? `${stats.totalResellers}` : `${stats.totalSubs}`, 
      icon: Users, 
      color: 'text-orange-400', 
      bg: 'bg-orange-400/10', 
      border: 'border-orange-400/30', 
      glow: 'glow-border-orange' 
    },
    { 
      title: isAdmin ? 'Total Lines' : 'Active Lines', 
      value: `${stats.totalSubs}`, 
      icon: Tv, 
      color: 'text-cyan-400', 
      bg: 'bg-cyan-400/10', 
      border: 'border-cyan-400/30', 
      glow: 'glow-border-cyan' 
    },
    { 
      title: 'Expires Tomorrow', 
      value: `${stats.expiresSoon}`, 
      icon: AlertTriangle, 
      color: 'text-pink-400', 
      bg: 'bg-pink-400/10', 
      border: 'border-pink-400/30', 
      glow: 'glow-border-pink' 
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setRealtimeData(prev => {
        const newData = [...prev, { time: new Date().toLocaleTimeString(), load: Math.floor(Math.random() * 40) + 30 }];
        if (newData.length > 10) return newData.slice(1);
        return newData;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto relative">
      {/* Global Scanline Overlay */}
      <div className="fixed inset-0 scanline-cyber opacity-[0.03] pointer-events-none z-50" />

      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 relative z-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-2 rounded-full bg-cyan animate-pulse" />
            <span className="text-cyan font-mono text-[10px] tracking-[0.4em] uppercase font-bold">System Online</span>
          </div>
          <h1 className="text-5xl font-display font-black text-white tracking-tighter uppercase italic drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
            Command <span className="text-cyan">Center</span>
          </h1>
          <p className="text-text-muted font-mono text-xs uppercase tracking-[0.3em] mt-2">
            Neural Link: <span className="text-green">Stable</span> | Latency: <span className="text-cyan">14ms</span> | Reseller Tier: <span className="text-violet">Commander</span>
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          {actionButtons.map((btn, i) => (
            <button 
              key={i} 
              onClick={() => btn.tab && setActiveTab(btn.tab)}
              className={clsx(
                "flex items-center gap-2 px-4 py-2.5 rounded-lg border text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 hover:brightness-125 shadow-lg",
                btn.color
              )}
            >
              <btn.icon className="w-4 h-4" />
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
        {dynamicKpis.map((kpi, i) => (
          <div key={i} className={clsx(
            "glass-panel rounded-xl p-6 relative overflow-hidden group transition-all duration-500 border-white/5 hover:border-white/20",
            kpi.glow
          )}>
            <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full ${kpi.bg} blur-2xl group-hover:blur-3xl transition-all duration-700`} />
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-text-muted text-[10px] font-mono uppercase tracking-widest mb-1 opacity-70">{kpi.title}</p>
                <h3 className="text-4xl font-display font-black text-white tracking-tight group-hover:scale-110 transition-transform duration-500">{kpi.value}</h3>
              </div>
              <div className={`w-14 h-14 rounded-xl ${kpi.bg} border ${kpi.border} flex items-center justify-center shadow-inner group-hover:rotate-12 transition-transform duration-500`}>
                <kpi.icon className={`w-7 h-7 ${kpi.color}`} />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                <div className={clsx("h-full animate-[shimmer_2s_infinite]", kpi.color.replace('text-', 'bg-'))} style={{ width: '65%' }} />
              </div>
              <span className="text-[9px] font-mono text-text-muted">+12%</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Charts & Feed Row */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 relative z-10">
        {/* Subscriptions Bar Chart */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-8 border-cyan/10 relative overflow-hidden group">
          <div className="absolute inset-0 scanline-cyber opacity-10 pointer-events-none" />
          <div className="flex justify-between items-center mb-8 relative z-10">
            <div>
              <h3 className="text-xl font-display font-black text-white uppercase tracking-wider italic">Subscription Metrics</h3>
              <p className="text-text-muted text-[10px] font-mono tracking-widest">QUARTERLY PERFORMANCE AUDIT</p>
            </div>
            <div className="flex gap-4 text-[10px] font-mono text-text-muted">
              <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-cyan shadow-[0_0_8px_#00f5ff]" /> New</div>
              <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-violet shadow-[0_0_8px_#8b00ff]" /> Renew</div>
              <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-pink shadow-[0_0_8px_#ff0080]" /> Demo</div>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subscriptionData}>
                <defs>
                  <linearGradient id="barCyan" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00f5ff" stopOpacity={1}/>
                    <stop offset="100%" stopColor="#00f5ff" stopOpacity={0.3}/>
                  </linearGradient>
                  <linearGradient id="barViolet" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b00ff" stopOpacity={1}/>
                    <stop offset="100%" stopColor="#8b00ff" stopOpacity={0.3}/>
                  </linearGradient>
                  <linearGradient id="barPink" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ff0080" stopOpacity={1}/>
                    <stop offset="100%" stopColor="#ff0080" stopOpacity={0.3}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.1)" tick={{fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 'bold'}} />
                <YAxis stroke="rgba(255,255,255,0.1)" tick={{fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 'bold'}} />
                <Tooltip
                  cursor={{fill: 'rgba(255,255,255,0.05)'}}
                  contentStyle={{ backgroundColor: 'rgba(6,8,30,0.95)', border: '1px solid rgba(0,245,255,0.2)', borderRadius: '12px', backdropFilter: 'blur(10px)' }}
                />
                <Bar dataKey="new" fill="url(#barCyan)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="renew" fill="url(#barViolet)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="demo" fill="url(#barPink)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Resellers Pie Chart */}
        <div className="glass-panel rounded-2xl p-8 border-violet/10 flex flex-col relative overflow-hidden">
          <div className="absolute inset-0 scanline-cyber opacity-10 pointer-events-none" />
          <h3 className="text-xl font-display font-black text-white uppercase tracking-wider italic mb-2">Market Share</h3>
          <p className="text-text-muted text-[10px] font-mono tracking-widest mb-8 uppercase">Reseller Distribution</p>
          
          <div className="flex-1 h-[250px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={resellerData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {resellerData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} className="drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]" />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(6,8,30,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-white">100%</span>
              <span className="text-[8px] font-mono text-text-muted uppercase tracking-widest">Total Share</span>
            </div>
          </div>

          <div className="space-y-2 mt-6">
            {resellerData.map((reseller, i) => (
              <div key={i} className="flex items-center justify-between text-[10px] font-mono group cursor-pointer">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full shadow-[0_0_5px_currentColor]" style={{ backgroundColor: reseller.color, color: reseller.color }} />
                  <span className="text-text-muted group-hover:text-white transition-colors">{reseller.name}</span>
                </div>
                <span className="text-white font-bold">{reseller.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Real-time Reseller Feed */}
        <div className="lg:col-span-1">
          <ResellerFeed />
        </div>
      </div>

      {/* Real-time System Load & Performance Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
        <div className="lg:col-span-2 glass-panel rounded-2xl p-8 border-emerald-500/20 relative overflow-hidden">
          <div className="absolute inset-0 scanline-cyber opacity-10 pointer-events-none" />
          <div className="flex justify-between items-center mb-8 relative z-10">
            <div>
              <h3 className="text-xl font-display font-black text-white uppercase tracking-wider italic">Neural Link Load</h3>
              <p className="text-text-muted text-[10px] font-mono tracking-widest">REAL-TIME SYSTEM PERFORMANCE</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-emerald-400" />
                <span className="text-[10px] font-mono text-emerald-400 font-bold">CPU: 42%</span>
              </div>
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-cyan" />
                <span className="text-[10px] font-mono text-cyan font-bold">MEM: 2.4GB</span>
              </div>
              <div className="flex items-center gap-2">
                <Network className="w-4 h-4 text-violet" />
                <span className="text-[10px] font-mono text-violet font-bold">NET: 840MB/s</span>
              </div>
            </div>
          </div>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={realtimeData}>
                <defs>
                  <linearGradient id="loadGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis dataKey="time" hide />
                <YAxis domain={[0, 100]} hide />
                <Tooltip
                  contentStyle={{ backgroundColor: 'rgba(6,8,30,0.95)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '8px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="load" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#loadGradient)" 
                  animationDuration={1000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-8 border-orange-500/20 flex flex-col justify-center relative overflow-hidden">
          <div className="absolute inset-0 scanline-cyber opacity-10 pointer-events-none" />
          <div className="text-center space-y-4 relative z-10">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full border-2 border-orange-500/30 bg-orange-500/10 shadow-[0_0_30px_rgba(249,115,22,0.2)] mb-4 animate-pulse">
              <Gauge className="w-10 h-10 text-orange-500" />
            </div>
            <h3 className="text-2xl font-display font-black text-white uppercase tracking-tighter italic">Global Latency</h3>
            <p className="text-5xl font-display font-black text-orange-500 drop-shadow-[0_0_15px_rgba(249,115,22,0.5)]">14<span className="text-xl ml-1">ms</span></p>
            <div className="flex justify-center gap-6 mt-6">
              <div className="text-center">
                <p className="text-[8px] font-mono text-text-muted uppercase tracking-widest mb-1">Jitter</p>
                <p className="text-sm font-bold text-white">1.2ms</p>
              </div>
              <div className="text-center">
                <p className="text-[8px] font-mono text-text-muted uppercase tracking-widest mb-1">Loss</p>
                <p className="text-sm font-bold text-white">0.00%</p>
              </div>
              <div className="text-center">
                <p className="text-[8px] font-mono text-text-muted uppercase tracking-widest mb-1">Uptime</p>
                <p className="text-sm font-bold text-white">99.99%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AITools />

      {/* Today's Logs Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border-white/5 relative z-10">
        <div className="absolute inset-0 scanline-cyber opacity-[0.05] pointer-events-none" />
        <div className="px-8 py-8 border-b border-white/5 flex justify-between items-center relative z-10">
          <div>
            <h3 className="text-2xl font-display font-black text-white uppercase tracking-wider italic">Transaction Audit</h3>
            <p className="text-text-muted text-[10px] font-mono tracking-widest mt-1">REAL-TIME LEDGER SYNCHRONIZATION</p>
          </div>
          <div className="flex gap-2">
            {['Subscription', 'Transactions', 'Expires Soon'].map((tab, i) => (
              <button key={i} className={clsx(
                "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                i === 0 ? "bg-cyan/10 text-cyan border border-cyan/20" : "text-text-muted hover:text-white hover:bg-white/5"
              )}>
                {tab}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto relative z-10">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5">
                <th className="px-8 py-5 text-[10px] font-mono text-text-muted uppercase tracking-[0.3em] font-bold">#</th>
                <th className="px-8 py-5 text-[10px] font-mono text-text-muted uppercase tracking-[0.3em] font-bold">System</th>
                <th className="px-8 py-5 text-[10px] font-mono text-text-muted uppercase tracking-[0.3em] font-bold">MAC / User</th>
                <th className="px-8 py-5 text-[10px] font-mono text-text-muted uppercase tracking-[0.3em] font-bold">Expire</th>
                <th className="px-8 py-5 text-[10px] font-mono text-text-muted uppercase tracking-[0.3em] font-bold">Reseller</th>
                <th className="px-8 py-5 text-[10px] font-mono text-text-muted uppercase tracking-[0.3em] font-bold">Type</th>
                <th className="px-8 py-5 text-[10px] font-mono text-text-muted uppercase tracking-[0.3em] font-bold text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {logs.map((log, i) => (
                <tr key={log.id} className="hover:bg-cyan/5 transition-all group cursor-pointer">
                  <td className="px-8 py-5 font-mono text-xs text-text-muted group-hover:text-cyan transition-colors">{i + 1}</td>
                  <td className="px-8 py-5">
                    <span className="px-3 py-1 rounded bg-cyan/10 text-cyan text-[10px] font-black border border-cyan/20 uppercase tracking-widest">{log.deviceType}</span>
                  </td>
                  <td className="px-8 py-5 font-mono text-xs text-white group-hover:translate-x-1 transition-transform">{log.identifier}</td>
                  <td className="px-8 py-5 font-mono text-xs text-text-muted">{log.timestamp}</td>
                  <td className="px-8 py-5 text-xs text-text-primary font-bold">{log.type}</td>
                  <td className="px-8 py-5">
                    <span className={clsx(
                      "px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest",
                      log.status === 'success' ? 'bg-green/10 text-green border border-green/20' : 'bg-red/10 text-red border border-red/20'
                    )}>
                      {log.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-xs font-black text-white text-right font-mono">
                    {log.amount} <span className="text-[10px] text-text-muted font-normal">CR</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-8 py-6 bg-white/5 border-t border-white/5 flex justify-between items-center relative z-10">
          <p className="text-[10px] font-mono text-text-muted uppercase tracking-widest">Showing 5 of 1,284 entries</p>
          <div className="flex gap-2">
            <button className="px-3 py-1 rounded border border-white/10 text-text-muted hover:text-white hover:border-white/30 transition-all">Previous</button>
            <button className="px-3 py-1 rounded border border-cyan/30 text-cyan hover:bg-cyan/10 transition-all">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}


