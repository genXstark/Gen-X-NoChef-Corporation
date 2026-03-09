import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, runTransaction, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { User } from '../types';
import { CreditCard, Search, User as UserIcon, AlertCircle, CheckCircle2, Wallet, ArrowRightLeft } from 'lucide-react';
import { clsx } from 'clsx';
import { iptvService } from '../services/iptvService';

export function AdminCredits() {
  const [resellers, setResellers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedResellerId, setSelectedResellerId] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [note, setNote] = useState('');
  const [masterCredits, setMasterCredits] = useState<number | null>(null);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!db) return;
    const q = query(collection(db, 'users'), where('role', '==', 'RESELLER'), where('status', '==', 'approved'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as User));
      setResellers(data);
      setLoading(false);
    });

    // Fetch master credits
    const fetchMasterCredits = async () => {
      try {
        const info = await iptvService.getResellerInfo();
        if (info && info.credits) {
          setMasterCredits(parseInt(info.credits));
        }
      } catch (error) {
        console.error('Error fetching master credits:', error);
      }
    };
    fetchMasterCredits();

    return () => unsubscribe();
  }, []);

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !selectedResellerId || amount <= 0) return;

    setProcessing(true);
    setStatus(null);

    try {
      await runTransaction(db, async (transaction) => {
        const resellerRef = doc(db, 'users', selectedResellerId);
        const resellerDoc = await transaction.get(resellerRef);
        
        if (!resellerDoc.exists()) throw new Error('Reseller not found');

        // Update reseller credits in Firestore
        transaction.update(resellerRef, {
          credits: (resellerDoc.data().credits || 0) + amount
        });

        // Log the transaction
        const logRef = doc(collection(db, 'logs'));
        transaction.set(logRef, {
          type: 'CREDIT_TRANSFER',
          from: 'ADMIN',
          to: selectedResellerId,
          amount: amount,
          note: note,
          timestamp: new Date().toISOString(),
          status: 'success'
        });
      });

      setStatus({ type: 'success', message: `Successfully transferred ${amount} credits to reseller.` });
      setAmount(0);
      setNote('');
      setSelectedResellerId('');
      
      // Refresh master credits
      const info = await iptvService.getResellerInfo();
      if (info && info.credits) {
        setMasterCredits(parseInt(info.credits));
      }
    } catch (error: any) {
      console.error('Transfer error:', error);
      setStatus({ type: 'error', message: error.message || 'Failed to transfer credits.' });
    } finally {
      setProcessing(false);
    }
  };

  const filteredResellers = resellers.filter(r => 
    r.username.toLowerCase().includes(search.toLowerCase()) || 
    r.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-display font-black text-white uppercase italic tracking-tighter">
          Credit <span className="text-pink-500">Distribution</span>
        </h1>
        <p className="text-text-muted font-mono text-xs uppercase tracking-widest">Master API Liquidity Transfer</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-2xl border-white/5 flex items-center justify-between group hover:border-cyan/30 transition-all">
          <div>
            <h4 className="text-2xl font-display font-bold text-white mb-1 tracking-tight">
              {masterCredits !== null ? masterCredits : '---'}
            </h4>
            <p className="text-[10px] font-mono text-text-muted uppercase tracking-widest">Master API Credits</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-cyan/10 border border-cyan/30 flex items-center justify-center text-cyan shadow-inner">
            <Wallet className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="glass-panel rounded-3xl border-white/5 p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-pink-500 to-transparent" />
        
        <form onSubmit={handleTransfer} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-text-muted uppercase tracking-widest">Select Reseller</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input 
                    type="text" 
                    placeholder="Search by name or email..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-void border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:border-pink-500 outline-none transition-all text-sm"
                  />
                </div>
                <div className="max-h-48 overflow-y-auto custom-scrollbar border border-white/5 rounded-xl bg-black/20">
                  {filteredResellers.length > 0 ? (
                    filteredResellers.map(r => (
                      <div 
                        key={r.uid}
                        onClick={() => setSelectedResellerId(r.uid)}
                        className={clsx(
                          "p-3 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-all border-b border-white/5 last:border-none",
                          selectedResellerId === r.uid ? "bg-pink-500/10 border-pink-500/30" : ""
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                            <UserIcon className="w-4 h-4 text-text-muted" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white">{r.username}</p>
                            <p className="text-[10px] text-text-muted">{r.email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-mono text-cyan font-bold">{r.credits} CR</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-text-muted text-xs">No resellers found</div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-text-muted uppercase tracking-widest">Credit Amount</label>
                <div className="relative">
                  <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-pink-500/40" />
                  <input 
                    type="number" 
                    required
                    min="1"
                    value={amount || ''}
                    onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                    placeholder="Enter amount to transfer"
                    className="w-full bg-void border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white font-mono focus:border-pink-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-mono text-text-muted uppercase tracking-widest">Note / Reason</label>
                <textarea 
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Optional transfer note..."
                  className="w-full bg-void border border-white/10 rounded-xl px-4 py-3 text-white focus:border-pink-500 outline-none transition-all resize-none text-sm"
                />
              </div>
            </div>
          </div>

          {status && (
            <div className={clsx(
              "p-4 rounded-xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300",
              status.type === 'success' ? "bg-emerald-400/10 border-emerald-400/20 text-emerald-400" : "bg-red/10 border-red/20 text-red"
            )}>
              {status.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              <p className="text-xs font-mono uppercase tracking-wider">{status.message}</p>
            </div>
          )}

          <button 
            type="submit"
            disabled={processing || !selectedResellerId || amount <= 0}
            className="w-full py-5 bg-gradient-to-r from-pink-500 to-red rounded-2xl font-display text-[0.9rem] font-black tracking-[0.2em] text-white uppercase hover:translate-y-[-2px] hover:shadow-[0_8px_40px_rgba(236,72,153,0.4)] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processing ? (
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <ArrowRightLeft className="w-5 h-5" />
                <span>Transfer Credits</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
