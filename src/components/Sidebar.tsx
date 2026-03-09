import React, { useState } from 'react';
import { 
  LayoutDashboard, Users, ShoppingCart, Server, HeadphonesIcon, 
  Settings, LogOut, Tv, Link, ChevronDown, ChevronRight, 
  Download, Send, AlertCircle, Ticket, FileText, Wrench, 
  UserPlus, History, CreditCard, RefreshCw, FileX, Layers, 
  Bell, BarChart3, Shield, MessageSquare, Megaphone
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { UserRole } from '../types';

interface NavItem {
  icon: any;
  label: string;
  id: string;
  subItems?: { label: string; id: string }[];
}

export function Sidebar({ activeTab, setActiveTab, userRole, onLogout }: { 
  activeTab: string, 
  setActiveTab: (id: string) => void, 
  userRole?: UserRole,
  onLogout: () => void 
}) {
  const [expandedItems, setExpandedItems] = useState<string[]>(['mag', 'm3u', 'logs', 'tools', 'resellers']);
  const isAdmin = userRole === 'ADMIN';

  const toggleExpand = (id: string) => {
    setExpandedItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const mainNav: NavItem[] = [
    { icon: LayoutDashboard, label: 'Dashboard', id: 'dashboard' },
    { icon: BarChart3, label: 'Statistics', id: 'statistics' },
  ];

  const adminNav: NavItem[] = [
    { 
      icon: Users, 
      label: 'Resellers', 
      id: 'resellers',
      subItems: [
        { label: 'Manage Resellers', id: 'admin-resellers' },
        { label: 'Pending Approvals', id: 'admin-pending' },
        { label: 'Add Credits', id: 'admin-credits' },
      ]
    },
    { 
      icon: Tv, 
      label: 'Global MAG', 
      id: 'mag',
      subItems: [
        { label: 'All MAG Devices', id: 'mag-list' },
      ]
    },
    { 
      icon: Link, 
      label: 'Global M3U', 
      id: 'm3u',
      subItems: [
        { label: 'All M3U Lines', id: 'm3u-list' },
      ]
    },
    { icon: Megaphone, label: 'Announcements', id: 'admin-announcements' },
    { icon: Settings, label: 'Admin Settings', id: 'admin-settings' },
  ];

  const resellerNav: NavItem[] = [
    { 
      icon: Tv, 
      label: 'MAG DEVICES', 
      id: 'mag',
      subItems: [
        { label: 'Add Device', id: 'mag-add' },
        { label: 'Quick Add New', id: 'mag-quick' },
        { label: 'Userlist', id: 'mag-list' },
      ]
    },
    { 
      icon: Link, 
      label: 'M3U Lines', 
      id: 'm3u',
      subItems: [
        { label: 'Add Device', id: 'm3u-add' },
        { label: 'Quick Add New', id: 'm3u-quick' },
        { label: 'Userlist', id: 'm3u-list' },
      ]
    },
    { icon: UserPlus, label: 'Subsellers', id: 'subsellers' },
    { icon: MessageSquare, label: 'Support Chat', id: 'support-chat' },
    { icon: Ticket, label: 'Tickets', id: 'ticket' },
  ];

  const logsNav: NavItem = { 
    icon: FileText, 
    label: 'Logs', 
    id: 'logs',
    subItems: [
      { label: 'Subscription Logs', id: 'logs-sub' },
      { label: 'Transfer Logs', id: 'logs-transfer' },
      { label: 'Transaction logs', id: 'logs-transaction' },
      { label: 'Refund Logs', id: 'logs-refund' },
    ]
  };

  const toolsNav: NavItem = { 
    icon: Wrench, 
    label: 'Tools', 
    id: 'tools',
    subItems: [
      { label: 'My Services', id: 'tools-services' },
      { label: 'Bulk Operations', id: 'tools-bulk' },
      { label: 'Latest Updates', id: 'tools-updates' },
    ]
  };

  const renderNavItem = (item: NavItem, colorClass: string = "text-cyan-400", bgClass: string = "bg-cyan-400/10", borderClass: string = "border-cyan-400/50", glowClass: string = "shadow-[0_0_15px_rgba(0,245,255,0.2)]") => {
    const isActive = activeTab === item.id || item.subItems?.some(sub => sub.id === activeTab);
    const isExpanded = expandedItems.includes(item.id);

    return (
      <div key={item.id} className="space-y-1">
        <button
          onClick={() => {
            if (item.subItems) {
              toggleExpand(item.id);
            } else {
              setActiveTab(item.id);
            }
          }}
          className={twMerge(
            clsx(
              "w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 relative group",
              isActive ? `${colorClass} ${bgClass}` : "text-text-muted hover:text-white hover:bg-white/5"
            )
          )}
        >
          <div className="flex items-center gap-3">
            <item.icon className={clsx("w-5 h-5", isActive ? colorClass : "text-text-muted group-hover:text-white")} />
            {item.label}
          </div>
          {item.subItems && (
            isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
          )}
          {isActive && !item.subItems && (
            <div className={`absolute inset-0 rounded-lg border ${borderClass} ${glowClass}`} />
          )}
        </button>

        {item.subItems && isExpanded && (
          <div className="ml-9 space-y-1 border-l border-white/10 pl-2">
            {item.subItems.map(sub => (
              <button
                key={sub.id}
                onClick={() => setActiveTab(sub.id)}
                className={clsx(
                  "w-full text-left px-3 py-2 rounded-md text-xs transition-all duration-200",
                  activeTab === sub.id ? "text-white bg-white/10 font-semibold" : "text-text-muted hover:text-white hover:bg-white/5"
                )}
              >
                {sub.label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-64 h-screen flex-shrink-0 flex flex-col p-4 z-10 relative border-r border-white/5 bg-deep/50 backdrop-blur-xl">
      <div className="flex items-center gap-2 px-4 py-6 mb-4">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-violet-600 flex items-center justify-center shadow-[0_0_15px_rgba(0,245,255,0.3)]">
          <span className="text-white font-bold font-display">P</span>
        </div>
        <span className="font-display font-bold text-xl tracking-wider text-white">PANDA IPTV</span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6 custom-scrollbar pr-2 relative z-10">
        <div className="space-y-1">
          {mainNav.map(item => renderNavItem(item))}
        </div>

        {isAdmin ? (
          <div>
            <h3 className="px-4 text-[10px] font-mono text-text-muted uppercase tracking-[0.3em] mb-3 opacity-50">Master Control</h3>
            <div className="space-y-1">
              {adminNav.map(item => renderNavItem(item, "text-red", "bg-red/10", "border-red/50", "shadow-[0_0_15px_rgba(255,48,96,0.2)]"))}
            </div>
          </div>
        ) : (
          <div>
            <h3 className="px-4 text-[10px] font-mono text-text-muted uppercase tracking-[0.3em] mb-3 opacity-50">Operations</h3>
            <div className="space-y-1">
              {resellerNav.map(item => renderNavItem(item, "text-violet-400", "bg-violet-400/10", "border-violet-400/50", "shadow-[0_0_15px_rgba(139,0,255,0.2)]"))}
            </div>
          </div>
        )}

        <div>
          <h3 className="px-4 text-[10px] font-mono text-text-muted uppercase tracking-[0.3em] mb-3 opacity-50">Infrastructure</h3>
          <div className="space-y-1">
            {renderNavItem(logsNav, "text-pink-400", "bg-pink-400/10", "border-pink-400/50", "shadow-[0_0_15px_rgba(255,0,128,0.2)]")}
            {renderNavItem(toolsNav, "text-emerald-400", "bg-emerald-400/10", "border-emerald-400/50", "shadow-[0_0_15px_rgba(16,185,129,0.2)]")}
          </div>
        </div>

        {/* System Status Widget */}
        <div className="px-4 pt-4">
          <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-text-muted uppercase">Core Temp</span>
              <span className="text-[10px] font-mono text-green">38°C</span>
            </div>
            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-green" style={{ width: '40%' }} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-text-muted uppercase">Sync Rate</span>
              <span className="text-[10px] font-mono text-cyan">99.9%</span>
            </div>
            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-cyan animate-[shimmer_2s_infinite]" style={{ width: '99%' }} />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-auto pt-4 border-t border-white/5 relative z-10">
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-text-muted hover:text-red hover:bg-red/10 transition-all duration-300 group"
        >
          <LogOut className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          Logout
        </button>
      </div>
    </div>
  );
}


