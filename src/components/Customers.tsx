import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, MoreVertical, Edit2, Info, 
  RefreshCw, Trash2, Shield, Upload, Move, 
  RotateCcw, Ban, CheckCircle2, XCircle, Activity, Power,
  AlertTriangle, Zap, Bell, CheckSquare, Square, MousePointer2, Layers
} from 'lucide-react';
import { clsx } from 'clsx';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface CustomersProps {
  type?: 'mag' | 'm3u';
  userData: any;
  setActiveTab: (tab: string) => void;
}

const mockUsers = Array.from({ length: 12 }).map((_, i) => ({
  id: `USR-${1000 + i}`,
  status: i % 3 === 0 ? 'Expired' : i % 5 === 0 ? 'Suspended' : 'Active',
  username: `user_${Math.random().toString(36).substring(7)}`,
  password: Math.random().toString(36).substring(2, 10),
  expire: `2025-02-${Math.floor(Math.random() * 28 + 1).toString().padStart(2, '0')}`,
  reseller: 'codeciphers',
  portal: 'Line',
  package: 'Package',
  watching: i % 4 === 0 ? 'CAI SPORTSNET' : '-',
  online: i % 2 === 0,
  notes: 'Sample note',
  country: ['US', 'UK', 'CA', 'DE'][i % 4],
  bitrate: i % 2 === 0 ? `${(Math.random() * 10 + 2).toFixed(1)} Mbps` : '-',
  isp: i % 2 === 0 ? ['Comcast', 'Verizon', 'AT&T', 'BT'][i % 4] : '-',
  isVpn: i === 3 || i === 7,
  ip: `192.168.1.${10 + i}`
}));

export function Customers({ type = 'mag', userData, setActiveTab }: CustomersProps) {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [hoveredUser, setHoveredUser] = useState<string | null>(null);
  const [lines, setLines] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  const isAdmin = userData?.role === 'ADMIN';

  useEffect(() => {
    if (!userData || !db) return;

    const linesRef = collection(db, 'lines');
    const q = isAdmin
      ? query(linesRef, where('type', '==', type))
      : query(linesRef, where('type', '==', type), where('resellerUid', '==', userData.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const linesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        status: new Date(doc.data().expireDate) > new Date() ? 'Active' : 'Expired'
      }));
      setLines(linesData);
    });

    return () => unsubscribe();
  }, [userData, type, isAdmin]);

  const filteredLines = lines.filter(l => 
    l.identifier?.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelectAll = () => {
    if (selectedUsers.length === filteredLines.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredLines.map(u => u.id));
    }
  };

  const toggleSelectUser = (id: string) => {
    setSelectedUsers(prev => 
      prev.includes(id) ? prev.filter(uid => uid !== id) : [...prev, id]
    );
  };

  const actions = [
    { label: 'Edit', icon: Edit2, color: 'text-cyan-400' },
    { label: 'Info', icon: Info, color: 'text-violet-400' },
    { label: 'Renew', icon: RefreshCw, color: 'text-emerald-400' },
    { label: 'Extend', icon: RotateCcw, color: 'text-orange-400' },
    { label: 'Kill & Lock', icon: Zap, color: 'text-red-500' },
    { label: 'Clear ISP', icon: Shield, color: 'text-pink-400' },
    { label: 'Disabled', icon: Ban, color: 'text-red-400' },
    { label: 'Upload TV', icon: Upload, color: 'text-cyan-400' },
    { label: 'Move', icon: Move, color: 'text-violet-400' },
    { label: 'Remove', icon: Trash2, color: 'text-red-400' },
    { label: 'Refund', icon: RotateCcw, color: 'text-orange-400' },
  ];

  return (
    <div className="p-8 h-full flex flex-col space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-white uppercase tracking-wider">
            {type === 'mag' ? 'MAG Userlist' : 'M3U Userlist'}
          </h2>
          <p className="text-text-muted font-mono text-sm mt-1">Manage active and expired subscriptions</p>
        </div>
        <div className="flex gap-3 w-full lg:w-auto">
          {selectedUsers.length > 0 && (
            <div className="flex gap-2 animate-in fade-in slide-in-from-right-4 duration-300">
              <button className="px-4 py-2 bg-emerald-500/20 border border-emerald-500/50 rounded-lg text-emerald-400 hover:bg-emerald-500/30 transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                <RefreshCw className="w-4 h-4" /> Renew All ({selectedUsers.length})
              </button>
              <button className="px-4 py-2 bg-violet-500/20 border border-violet-500/50 rounded-lg text-violet-400 hover:bg-violet-500/30 transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                <Layers className="w-4 h-4" /> Edit Bouquet
              </button>
            </div>
          )}
          <div className="relative flex-1 lg:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input 
              type="text" 
              placeholder="Search users..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-void border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white focus:border-cyan-400 outline-none transition-all" 
            />
          </div>
          <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 transition-all flex items-center gap-2">
            <Filter className="w-4 h-4" /> Filter
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        {[
          { label: 'Total Users', value: `${lines.length}`, color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
          { label: 'Online', value: '0', color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
          { label: 'Expired', value: `${lines.filter(l => l.status === 'Expired').length}`, color: 'text-red-400', bg: 'bg-red-400/10' },
          { label: 'Disabled', value: '0', color: 'text-orange-400', bg: 'bg-orange-400/10' },
        ].map((stat, i) => (
          <div key={i} className="glass-panel p-4 rounded-xl border-white/5 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-mono text-text-muted uppercase tracking-widest">{stat.label}</p>
              <p className={clsx("text-2xl font-display font-bold", stat.color)}>{stat.value}</p>
            </div>
            <div className={clsx("w-10 h-10 rounded-lg flex items-center justify-center", stat.bg)}>
              <Activity className={clsx("w-5 h-5", stat.color)} />
            </div>
          </div>
        ))}
      </div>

      <div className="glass-panel rounded-xl flex-1 overflow-hidden flex flex-col border-white/5">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse min-w-[1200px]">
            <thead>
              <tr className="border-b border-border-glow bg-white/5">
                <th className="px-4 py-4 w-10">
                  <button onClick={toggleSelectAll} className="text-text-muted hover:text-white transition-colors">
                    {selectedUsers.length === mockUsers.length ? <CheckSquare className="w-4 h-4 text-cyan-400" /> : <Square className="w-4 h-4" />}
                  </button>
                </th>
                <th className="px-6 py-4 text-[10px] font-mono text-text-muted uppercase tracking-widest font-semibold">Status</th>
                <th className="px-6 py-4 text-[10px] font-mono text-text-muted uppercase tracking-widest font-semibold">Username</th>
                <th className="px-6 py-4 text-[10px] font-mono text-text-muted uppercase tracking-widest font-semibold">Password</th>
                <th className="px-6 py-4 text-[10px] font-mono text-text-muted uppercase tracking-widest font-semibold">Expire</th>
                {isAdmin && <th className="px-6 py-4 text-[10px] font-mono text-text-muted uppercase tracking-widest font-semibold">Reseller</th>}
                <th className="px-6 py-4 text-[10px] font-mono text-text-muted uppercase tracking-widest font-semibold">Online</th>
                <th className="px-6 py-4 text-[10px] font-mono text-text-muted uppercase tracking-widest font-semibold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 relative">
              {filteredLines.map((line) => (
                <tr key={line.id} className={clsx(
                  "group transition-all duration-200",
                  selectedUsers.includes(line.id) ? "bg-cyan-400/5" : "hover:bg-white/[0.04]"
                )}>
                  <td className="px-4 py-4">
                    <button onClick={() => toggleSelectUser(line.id)} className="text-text-muted hover:text-white transition-colors">
                      {selectedUsers.includes(line.id) ? <CheckSquare className="w-4 h-4 text-cyan-400" /> : <Square className="w-4 h-4" />}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={clsx(
                        "inline-flex items-center px-2 py-0.5 rounded-full text-[8px] font-mono font-bold uppercase tracking-wider border",
                        line.status === 'Active' ? "bg-cyan-400/10 text-cyan-400 border-cyan-400/30" :
                        "bg-pink-400/10 text-pink-400 border-pink-400/30"
                      )}>
                        {line.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-mono text-xs text-white font-bold">{line.identifier}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-[10px] text-text-muted">********</td>
                  <td className="px-6 py-4 text-xs text-white font-mono">{line.expireDate?.split('T')[0]}</td>
                  {isAdmin && <td className="px-6 py-4 text-xs text-text-muted uppercase tracking-wider">{line.resellerUid?.slice(0, 8)}...</td>}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={clsx("w-1.5 h-1.5 rounded-full bg-white/20")} />
                      <span className="text-[10px] font-mono text-text-muted uppercase">Offline</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center relative">
                    <div className="flex items-center justify-center gap-1">
                      <button 
                        onClick={() => setActiveDropdown(activeDropdown === line.id ? null : line.id)}
                        className="p-1.5 rounded-lg hover:bg-white/10 transition-all text-text-muted hover:text-white"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>

                    {activeDropdown === line.id && (
                      <>
                        <div className="fixed inset-0 z-30" onClick={() => setActiveDropdown(null)} />
                        <div className="absolute right-6 top-12 w-48 glass-panel rounded-xl border-white/10 shadow-2xl z-40 py-2 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                          {actions.map((action, i) => (
                            <button 
                              key={i} 
                              className="w-full px-4 py-2 flex items-center gap-3 hover:bg-white/5 transition-all text-left group/item"
                              onClick={() => setActiveDropdown(null)}
                            >
                              <action.icon className={clsx("w-3.5 h-3.5", action.color)} />
                              <span className="text-[10px] font-bold text-text-muted group-hover/item:text-white uppercase tracking-wider">{action.label}</span>
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="border-t border-border-glow p-4 flex items-center justify-between bg-white/5">
          <p className="text-[10px] font-mono text-text-muted uppercase tracking-widest">Showing 1 to 12 of 369 entries</p>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 rounded border border-white/10 text-[10px] font-mono text-text-muted hover:bg-white/5 hover:text-white transition-colors uppercase">Prev</button>
            <button className="px-3 py-1 rounded bg-cyan-400/20 border border-cyan-400/50 text-[10px] font-mono text-cyan-400 font-bold shadow-[0_0_10px_rgba(0,245,255,0.3)]">1</button>
            <button className="px-3 py-1 rounded border border-white/10 text-[10px] font-mono text-text-muted hover:bg-white/5 hover:text-white transition-colors">2</button>
            <button className="px-3 py-1 rounded border border-white/10 text-[10px] font-mono text-text-muted hover:bg-white/5 hover:text-white transition-colors">3</button>
            <span className="text-text-muted px-1 text-[10px]">...</span>
            <button className="px-3 py-1 rounded border border-white/10 text-[10px] font-mono text-text-muted hover:bg-white/5 hover:text-white transition-colors uppercase">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
