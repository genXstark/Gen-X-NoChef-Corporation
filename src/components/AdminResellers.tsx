import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc, increment, runTransaction, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { User, UserStatus } from '../types';
import { Users, UserPlus, CreditCard, CheckCircle2, XCircle, Search, Filter, MoreVertical, Shield } from 'lucide-react';
import { clsx } from 'clsx';

export function AdminResellers() {
  const [resellers, setResellers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedReseller, setSelectedReseller] = useState<User | null>(null);
  const [creditAmount, setCreditAmount] = useState(0);
  const [isCreditModalOpen, setIsCreditModalOpen] = useState(false);

  useEffect(() => {
    if (!db) return;
    const q = query(collection(db, 'users'), where('role', '==', 'RESELLER'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as User));
      setResellers(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleStatusChange = async (uid: string, status: UserStatus) => {
    if (!db) return;
    try {
      await updateDoc(doc(db, 'users', uid), { status });
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleAddCredits = async () => {
    if (!db || !selectedReseller || creditAmount <= 0) return;
    try {
      await runTransaction(db, async (transaction) => {
        const userRef = doc(db, 'users', selectedReseller.uid);
        transaction.update(userRef, {
          credits: increment(creditAmount)
        });

        const txRef = doc(collection(db, 'transactions'));
        transaction.set(txRef, {
          userId: selectedReseller.uid,
          type: 'CREDITADD',
          amount: creditAmount,
          createdAt: new Date().toISOString()
        });
      });
      setIsCreditModalOpen(false);
      setCreditAmount(0);
    } catch (error) {
      console.error('Error adding credits:', error);
    }
  };

  const filteredResellers = resellers.filter(r => 
    r.username.toLowerCase().includes(search.toLowerCase()) || 
    r.email.toLowerCase().includes(search.toLowerCase())
  );

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
            Reseller <span className="text-cyan">Management</span>
          </h1>
          <p className="text-text-muted font-mono text-xs uppercase tracking-widest">Authorized Agents Network</p>
        </div>
        <div className="flex gap-4">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input 
              type="text" 
              placeholder="Search resellers..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-void border border-white/10 rounded-xl pl-10 pr-4 py-2 text-white focus:border-cyan outline-none transition-all" 
            />
          </div>
        </div>
      </div>

      <div className="glass-panel rounded-3xl border-white/5 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-white/5">
              <th className="px-6 py-4 text-[10px] font-mono text-text-muted uppercase tracking-widest">Status</th>
              <th className="px-6 py-4 text-[10px] font-mono text-text-muted uppercase tracking-widest">Username</th>
              <th className="px-6 py-4 text-[10px] font-mono text-text-muted uppercase tracking-widest">Email</th>
              <th className="px-6 py-4 text-[10px] font-mono text-text-muted uppercase tracking-widest">Credits</th>
              <th className="px-6 py-4 text-[10px] font-mono text-text-muted uppercase tracking-widest">Joined</th>
              <th className="px-6 py-4 text-[10px] font-mono text-text-muted uppercase tracking-widest text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredResellers.map((reseller) => (
              <tr key={reseller.uid} className="hover:bg-white/[0.02] transition-all">
                <td className="px-6 py-4">
                  <span className={clsx(
                    "inline-flex items-center px-2 py-1 rounded-full text-[8px] font-mono font-bold uppercase tracking-wider border",
                    reseller.status === 'approved' ? "bg-emerald-400/10 text-emerald-400 border-emerald-400/30" : "bg-orange-400/10 text-orange-400 border-orange-400/30"
                  )}>
                    {reseller.status}
                  </span>
                </td>
                <td className="px-6 py-4 font-bold text-white">{reseller.username}</td>
                <td className="px-6 py-4 text-text-muted text-sm">{reseller.email}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-3 h-3 text-cyan" />
                    <span className="font-mono text-cyan font-bold">{reseller.credits}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-text-muted text-xs font-mono">{reseller.createdAt?.split('T')[0]}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                    {reseller.status === 'pending' && (
                      <button 
                        onClick={() => handleStatusChange(reseller.uid, 'approved')}
                        className="p-2 rounded-lg bg-emerald-400/10 text-emerald-400 hover:bg-emerald-400/20 transition-all"
                        title="Approve"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    )}
                    <button 
                      onClick={() => {
                        setSelectedReseller(reseller);
                        setIsCreditModalOpen(true);
                      }}
                      className="p-2 rounded-lg bg-cyan/10 text-cyan hover:bg-cyan/20 transition-all"
                      title="Add Credits"
                    >
                      <CreditCard className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isCreditModalOpen && selectedReseller && (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel p-8 rounded-3xl border-cyan/30 w-full max-w-md space-y-6 animate-in zoom-in-95 duration-300">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-cyan/10 rounded-xl flex items-center justify-center border border-cyan/30">
                <CreditCard className="w-6 h-6 text-cyan" />
              </div>
              <div>
                <h3 className="text-xl font-display font-bold text-white uppercase">Add Credits</h3>
                <p className="text-text-muted text-xs font-mono">To: {selectedReseller.username}</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-mono text-text-muted uppercase tracking-widest">Amount</label>
              <input 
                type="number" 
                value={creditAmount}
                onChange={(e) => setCreditAmount(parseInt(e.target.value) || 0)}
                className="w-full bg-void border border-white/10 rounded-xl px-4 py-4 text-white font-mono focus:border-cyan outline-none transition-all"
                placeholder="Enter amount"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button 
                onClick={() => setIsCreditModalOpen(false)}
                className="flex-1 py-4 rounded-xl border border-white/10 text-text-muted font-display font-bold uppercase tracking-widest text-xs hover:bg-white/5 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddCredits}
                className="flex-1 py-4 rounded-xl bg-cyan text-void font-display font-bold uppercase tracking-widest text-xs hover:bg-cyan-400 transition-all shadow-[0_0_20px_rgba(0,245,255,0.3)]"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
