import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, runTransaction, increment } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { User } from '../types';
import { Users, CreditCard, CheckSquare, Square, ArrowRightLeft, AlertCircle, CheckCircle2 } from 'lucide-react';
import { clsx } from 'clsx';

export function ToolsBulk() {
  const [resellers, setResellers] = useState<User[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [amount, setAmount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  useEffect(() => {
    if (!db) return;
    const q = query(collection(db, 'users'), where('role', '==', 'RESELLER'), where('status', '==', 'approved'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as User));
      setResellers(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === resellers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(resellers.map(r => r.uid));
    }
  };

  const handleBulkTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || selectedIds.length === 0 || amount <= 0) return;

    setProcessing(true);
    setStatus(null);

    try {
      await runTransaction(db, async (transaction) => {
        for (const id of selectedIds) {
          const resellerRef = doc(db, 'users', id);
          transaction.update(resellerRef, {
            credits: increment(amount)
          });

          const logRef = doc(collection(db, 'logs'));
          transaction.set(logRef, {
            type: 'BULK_CREDIT_TRANSFER',
            to: id,
            amount: amount,
            timestamp: new Date().toISOString(),
            status: 'success'
          });
        }
      });

      setStatus({ type: 'success', message: `Successfully transferred ${amount} credits to ${selectedIds.length} resellers.` });
      setAmount(0);
      setSelectedIds([]);
    } catch (error: any) {
      console.error('Bulk transfer error:', error);
      setStatus({ type: 'error', message: error.message || 'Failed to process bulk transfer.' });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-display font-black text-white uppercase italic tracking-tighter">
          Bulk <span className="text-emerald-400">Operations</span>
        </h1>
        <p className="text-text-muted font-mono text-xs uppercase tracking-widest">Mass Liquidity Distribution</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-4">
          <div className="glass-panel rounded-3xl border-white/5 overflow-hidden">
            <div className="p-4 bg-white/5 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-xs font-mono text-text-muted uppercase tracking-widest">Select Resellers</h3>
              <button 
                onClick={toggleSelectAll}
                className="text-[10px] font-mono text-cyan hover:text-cyan-400 uppercase tracking-widest transition-colors"
              >
                {selectedIds.length === resellers.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
            <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <tbody className="divide-y divide-white/5">
                  {resellers.map((reseller) => (
                    <tr 
                      key={reseller.uid} 
                      className={clsx(
                        "hover:bg-white/[0.02] transition-all cursor-pointer",
                        selectedIds.includes(reseller.uid) ? "bg-emerald-400/5" : ""
                      )}
                      onClick={() => toggleSelect(reseller.uid)}
                    >
                      <td className="px-6 py-4 w-10">
                        <div className={clsx(
                          "w-4 h-4 rounded border flex items-center justify-center transition-all",
                          selectedIds.includes(reseller.uid) ? "bg-emerald-400 border-emerald-400" : "border-white/20"
                        )}>
                          {selectedIds.includes(reseller.uid) && <CheckSquare className="w-3 h-3 text-void" />}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-white">{reseller.username}</p>
                        <p className="text-[10px] text-text-muted">{reseller.email}</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-mono text-xs text-cyan font-bold">{reseller.credits} CR</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="glass-panel p-8 rounded-3xl border-white/5 space-y-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-transparent" />
            
            <div className="space-y-2">
              <label className="text-[10px] font-mono text-text-muted uppercase tracking-widest">Credits per Reseller</label>
              <div className="relative">
                <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400/40" />
                <input 
                  type="number" 
                  value={amount || ''}
                  onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                  placeholder="Amount to add..."
                  className="w-full bg-void border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white font-mono focus:border-emerald-400 outline-none transition-all"
                />
              </div>
            </div>

            <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-3">
              <div className="flex justify-between text-[10px] font-mono uppercase tracking-widest">
                <span className="text-text-muted">Selected</span>
                <span className="text-white">{selectedIds.length} Agents</span>
              </div>
              <div className="flex justify-between text-[10px] font-mono uppercase tracking-widest">
                <span className="text-text-muted">Total Cost</span>
                <span className="text-emerald-400 font-bold">{selectedIds.length * amount} Credits</span>
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
              onClick={handleBulkTransfer}
              disabled={processing || selectedIds.length === 0 || amount <= 0}
              className="w-full py-5 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl font-display text-[0.9rem] font-black tracking-[0.2em] text-white uppercase hover:translate-y-[-2px] hover:shadow-[0_8px_40px_rgba(16,185,129,0.4)] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <ArrowRightLeft className="w-5 h-5" />
                  <span>Execute Bulk Transfer</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
