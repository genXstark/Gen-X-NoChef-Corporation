import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, doc, runTransaction, increment } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { User } from '../types';
import { UserPlus, CreditCard, Search, Shield, MoreVertical, Users } from 'lucide-react';
import { clsx } from 'clsx';

export function ResellerSubsellers({ userData }: { userData: User }) {
  const [subsellers, setSubsellers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSubseller, setNewSubseller] = useState({
    username: '',
    email: '',
    password: '',
    credits: 0
  });

  useEffect(() => {
    if (!db || !userData) return;
    const q = query(collection(db, 'users'), where('parentId', '==', userData.uid), where('role', '==', 'SUBSELLER'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as User));
      setSubsellers(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [userData]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !userData) return;
    
    if (userData.credits < newSubseller.credits) {
      alert('Insufficient credits to allocate to subseller');
      return;
    }

    try {
      await runTransaction(db, async (transaction) => {
        // 1. Deduct from parent
        const parentRef = doc(db, 'users', userData.uid);
        transaction.update(parentRef, {
          credits: increment(-newSubseller.credits)
        });

        // 2. Create subseller (Note: In a real app, you'd use Firebase Auth to create the user)
        // For this demo, we'll just add to Firestore
        const subRef = doc(collection(db, 'users'));
        transaction.set(subRef, {
          username: newSubseller.username,
          email: newSubseller.email,
          role: 'SUBSELLER',
          parentId: userData.uid,
          credits: newSubseller.credits,
          status: 'approved',
          createdAt: new Date().toISOString()
        });

        // 3. Log transaction
        const txRef = doc(collection(db, 'transactions'));
        transaction.set(txRef, {
          userId: userData.uid,
          type: 'CREDITUSE',
          amount: newSubseller.credits,
          description: `Allocated to subseller ${newSubseller.username}`,
          createdAt: new Date().toISOString()
        });
      });
      setIsModalOpen(false);
      setNewSubseller({ username: '', email: '', password: '', credits: 0 });
    } catch (error) {
      console.error('Error creating subseller:', error);
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
            My <span className="text-violet">Subsellers</span>
          </h1>
          <p className="text-text-muted font-mono text-xs uppercase tracking-widest">Manage your sub-agent network</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-violet text-white font-display font-black uppercase tracking-widest text-xs rounded-xl hover:bg-violet-600 transition-all shadow-[0_0_20px_rgba(139,0,255,0.2)]"
        >
          <UserPlus className="w-4 h-4" /> Create Subseller
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subsellers.map((sub) => (
          <div key={sub.uid} className="glass-panel p-6 rounded-2xl border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-violet" />
            
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-violet/10 border border-violet/30 flex items-center justify-center text-violet">
                <Users className="w-5 h-5" />
              </div>
              <button className="p-2 rounded-lg hover:bg-white/5 text-text-muted transition-all">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>

            <h3 className="text-lg font-display font-bold text-white mb-1">{sub.username}</h3>
            <p className="text-text-muted text-xs mb-4">{sub.email}</p>
            
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
              <div className="flex items-center gap-2">
                <CreditCard className="w-3 h-3 text-cyan" />
                <span className="text-xs font-mono text-text-muted uppercase">Credits</span>
              </div>
              <span className="font-mono text-cyan font-bold">{sub.credits}</span>
            </div>

            <div className="mt-4 flex items-center justify-between pt-4 border-t border-white/5">
              <span className="text-[10px] font-mono text-text-muted uppercase">Joined: {sub.createdAt?.split('T')[0]}</span>
              <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">Active</span>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreate} className="glass-panel p-8 rounded-3xl border-violet/30 w-full max-w-lg space-y-6 animate-in zoom-in-95 duration-300">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-violet/10 rounded-xl flex items-center justify-center border border-violet/30">
                <UserPlus className="w-6 h-6 text-violet" />
              </div>
              <div>
                <h3 className="text-xl font-display font-bold text-white uppercase">New Subseller</h3>
                <p className="text-text-muted text-xs font-mono">Create an agent account under you</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-text-muted uppercase tracking-widest">Username</label>
                  <input 
                    type="text" 
                    value={newSubseller.username}
                    onChange={(e) => setNewSubseller({ ...newSubseller, username: e.target.value })}
                    className="w-full bg-void border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-sm focus:border-violet outline-none transition-all"
                    placeholder="agent_01"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-text-muted uppercase tracking-widest">Initial Credits</label>
                  <input 
                    type="number" 
                    value={newSubseller.credits}
                    onChange={(e) => setNewSubseller({ ...newSubseller, credits: parseInt(e.target.value) || 0 })}
                    className="w-full bg-void border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-sm focus:border-violet outline-none transition-all"
                    placeholder="10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-mono text-text-muted uppercase tracking-widest">Email Address</label>
                <input 
                  type="email" 
                  value={newSubseller.email}
                  onChange={(e) => setNewSubseller({ ...newSubseller, email: e.target.value })}
                  className="w-full bg-void border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-sm focus:border-violet outline-none transition-all"
                  placeholder="agent@example.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-mono text-text-muted uppercase tracking-widest">Password</label>
                <input 
                  type="password" 
                  value={newSubseller.password}
                  onChange={(e) => setNewSubseller({ ...newSubseller, password: e.target.value })}
                  className="w-full bg-void border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-sm focus:border-violet outline-none transition-all"
                  placeholder="********"
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
                className="flex-1 py-4 rounded-xl bg-violet text-white font-display font-bold uppercase tracking-widest text-xs hover:bg-violet-600 transition-all shadow-[0_0_20px_rgba(139,0,255,0.3)]"
              >
                Create Account
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
