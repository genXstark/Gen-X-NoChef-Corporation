import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Announcement, AnnouncementKind } from '../types';
import { Megaphone, Plus, Trash2, AlertTriangle, Bell, CheckCircle2 } from 'lucide-react';
import { clsx } from 'clsx';

export function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    body: '',
    kind: 'ANNOUNCEMENT' as AnnouncementKind,
    active: true
  });

  useEffect(() => {
    if (!db) return;
    const q = query(collection(db, 'announcements'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Announcement));
      setAnnouncements(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;
    try {
      await addDoc(collection(db, 'announcements'), {
        ...newAnnouncement,
        createdAt: new Date().toISOString()
      });
      setIsModalOpen(false);
      setNewAnnouncement({ title: '', body: '', kind: 'ANNOUNCEMENT', active: true });
    } catch (error) {
      console.error('Error creating announcement:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!db) return;
    try {
      await deleteDoc(doc(db, 'announcements', id));
    } catch (error) {
      console.error('Error deleting announcement:', error);
    }
  };

  const toggleActive = async (id: string, active: boolean) => {
    if (!db) return;
    try {
      await updateDoc(doc(db, 'announcements', id), { active: !active });
    } catch (error) {
      console.error('Error updating announcement:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <div className="w-8 h-8 border-4 border-cyan/20 border-t-cyan rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-display font-black text-white uppercase italic tracking-tighter">
            System <span className="text-cyan">Announcements</span>
          </h1>
          <p className="text-text-muted font-mono text-xs uppercase tracking-widest">Broadcast to all resellers</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-cyan text-void font-display font-black uppercase tracking-widest text-xs rounded-xl hover:bg-cyan-400 transition-all shadow-[0_0_20px_rgba(0,245,255,0.2)]"
        >
          <Plus className="w-4 h-4" /> New Broadcast
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {announcements.map((ann) => (
          <div key={ann.id} className={clsx(
            "glass-panel p-6 rounded-2xl border-white/5 relative overflow-hidden group",
            !ann.active && "opacity-50"
          )}>
            <div className={clsx(
              "absolute top-0 left-0 w-1 h-full",
              ann.kind === 'WARNING' ? "bg-red" : "bg-cyan"
            )} />
            
            <div className="flex justify-between items-start mb-4">
              <div className={clsx(
                "w-10 h-10 rounded-xl flex items-center justify-center border",
                ann.kind === 'WARNING' ? "bg-red/10 border-red/30 text-red" : "bg-cyan/10 border-cyan/30 text-cyan"
              )}>
                {ann.kind === 'WARNING' ? <AlertTriangle className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => toggleActive(ann.id, ann.active)}
                  className={clsx(
                    "p-2 rounded-lg transition-all",
                    ann.active ? "bg-emerald-400/10 text-emerald-400" : "bg-white/5 text-text-muted"
                  )}
                >
                  <CheckCircle2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDelete(ann.id)}
                  className="p-2 rounded-lg bg-red/10 text-red hover:bg-red/20 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <h3 className="text-lg font-display font-bold text-white mb-2">{ann.title}</h3>
            <p className="text-text-muted text-sm leading-relaxed mb-4">{ann.body}</p>
            
            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <span className="text-[10px] font-mono text-text-muted uppercase">{ann.createdAt?.split('T')[0]}</span>
              <span className={clsx(
                "text-[10px] font-mono uppercase tracking-widest",
                ann.kind === 'WARNING' ? "text-red" : "text-cyan"
              )}>{ann.kind}</span>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreate} className="glass-panel p-8 rounded-3xl border-cyan/30 w-full max-w-lg space-y-6 animate-in zoom-in-95 duration-300">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-cyan/10 rounded-xl flex items-center justify-center border border-cyan/30">
                <Megaphone className="w-6 h-6 text-cyan" />
              </div>
              <div>
                <h3 className="text-xl font-display font-bold text-white uppercase">New Broadcast</h3>
                <p className="text-text-muted text-xs font-mono">Send message to all agents</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-text-muted uppercase tracking-widest">Broadcast Type</label>
                <div className="flex gap-4">
                  <button 
                    type="button"
                    onClick={() => setNewAnnouncement({ ...newAnnouncement, kind: 'ANNOUNCEMENT' })}
                    className={clsx(
                      "flex-1 py-3 rounded-xl border font-display font-bold uppercase tracking-widest text-[10px] transition-all",
                      newAnnouncement.kind === 'ANNOUNCEMENT' ? "bg-cyan/10 border-cyan text-cyan" : "border-white/10 text-text-muted"
                    )}
                  >
                    Announcement
                  </button>
                  <button 
                    type="button"
                    onClick={() => setNewAnnouncement({ ...newAnnouncement, kind: 'WARNING' })}
                    className={clsx(
                      "flex-1 py-3 rounded-xl border font-display font-bold uppercase tracking-widest text-[10px] transition-all",
                      newAnnouncement.kind === 'WARNING' ? "bg-red/10 border-red text-red" : "border-white/10 text-text-muted"
                    )}
                  >
                    Warning
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-mono text-text-muted uppercase tracking-widest">Title</label>
                <input 
                  type="text" 
                  value={newAnnouncement.title}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                  className="w-full bg-void border border-white/10 rounded-xl px-4 py-4 text-white font-mono focus:border-cyan outline-none transition-all"
                  placeholder="Enter title"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-mono text-text-muted uppercase tracking-widest">Message Body</label>
                <textarea 
                  value={newAnnouncement.body}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, body: e.target.value })}
                  rows={4}
                  className="w-full bg-void border border-white/10 rounded-xl px-4 py-4 text-white font-mono focus:border-cyan outline-none transition-all resize-none"
                  placeholder="Enter message content"
                  required
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-4 rounded-xl border border-white/10 text-text-muted font-display font-bold uppercase tracking-widest text-xs hover:bg-white/5 transition-all"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="flex-1 py-4 rounded-xl bg-cyan text-void font-display font-bold uppercase tracking-widest text-xs hover:bg-cyan-400 transition-all shadow-[0_0_20px_rgba(0,245,255,0.3)]"
              >
                Broadcast
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
