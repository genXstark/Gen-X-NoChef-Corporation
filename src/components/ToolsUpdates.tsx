import React from 'react';
import { Megaphone, Calendar, Tag, ChevronRight } from 'lucide-react';

const UPDATES = [
  {
    id: 1,
    title: 'v4.2 Neural Link Update',
    date: '2026-02-28',
    type: 'SYSTEM',
    content: 'Implemented secure API proxy tunnel for master credentials. Enhanced role-based access control for resellers.',
    tag: 'Critical'
  },
  {
    id: 2,
    title: 'New 4K Ultra HD Bouquets',
    date: '2026-02-25',
    type: 'CONTENT',
    content: 'Added 50+ new premium 4K channels to the PANDA SPECIAL package. Sports arena coverage expanded.',
    tag: 'Content'
  },
  {
    id: 3,
    title: 'Anti-Freeze Neural Buffer™ v2',
    date: '2026-02-20',
    type: 'SYSTEM',
    content: 'Updated proprietary anti-freeze protocol to reduce latency by 40% on mobile networks.',
    tag: 'Performance'
  },
  {
    id: 4,
    title: 'Bulk Operations Module Live',
    date: '2026-02-15',
    type: 'FEATURE',
    content: 'Admins can now perform mass credit distributions and bulk line extensions from the Tools section.',
    tag: 'Feature'
  },
  {
    id: 5,
    title: 'VOD Vault Expansion',
    date: '2026-02-10',
    type: 'CONTENT',
    content: 'Added 5,000+ new movies and series to the VOD vault. Netflix Originals and HBO Max content updated.',
    tag: 'Content'
  }
];

export function ToolsUpdates() {
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-display font-black text-white uppercase italic tracking-tighter">
          Latest <span className="text-violet-400">Updates</span>
        </h1>
        <p className="text-text-muted font-mono text-xs uppercase tracking-widest">System Changelog & News Feed</p>
      </div>

      <div className="space-y-6">
        {UPDATES.map((update) => (
          <div key={update.id} className="glass-panel p-8 rounded-3xl border-white/5 hover:border-violet-400/30 transition-all group relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-violet-400 to-transparent opacity-50" />
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-violet-400/10 border border-violet-400/30 flex items-center justify-center text-violet-400">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-display font-bold text-white tracking-wider group-hover:text-violet-400 transition-colors">{update.title}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex items-center gap-1 text-[10px] font-mono text-text-muted uppercase">
                      <Calendar className="w-3 h-3" />
                      {update.date}
                    </div>
                    <div className="w-1 h-1 rounded-full bg-white/10" />
                    <div className="flex items-center gap-1 text-[10px] font-mono text-violet-400 uppercase font-bold">
                      <Tag className="w-3 h-3" />
                      {update.tag}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-text-muted uppercase tracking-widest px-3 py-1 bg-white/5 rounded-full border border-white/5">
                  {update.type}
                </span>
              </div>
            </div>

            <p className="text-sm text-text-muted leading-relaxed font-light pl-14">
              {update.content}
            </p>

            <div className="mt-6 pl-14 flex items-center gap-2 text-[10px] font-mono text-cyan uppercase tracking-widest cursor-pointer hover:gap-4 transition-all">
              Read Full Documentation <ChevronRight className="w-3 h-3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
