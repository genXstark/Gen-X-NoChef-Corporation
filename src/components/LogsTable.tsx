import React, { useState, useEffect } from 'react';
import { History, ArrowRightLeft, CreditCard, RefreshCw, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { User } from '../types';

interface LogsTableProps {
  type: 'subscription' | 'transfer' | 'transaction' | 'refund';
  userData: User;
}

export function LogsTable({ type, userData }: LogsTableProps) {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const isAdmin = userData?.role === 'ADMIN';

  const titles = {
    subscription: { label: 'Subscription Logs', icon: History, color: 'text-cyan-400' },
    transfer: { label: 'Transfer Logs', icon: ArrowRightLeft, color: 'text-violet-400' },
    transaction: { label: 'Transaction Logs', icon: CreditCard, color: 'text-orange-400' },
    refund: { label: 'Refund Logs', icon: RefreshCw, color: 'text-pink-400' },
  };

  const { label, icon: Icon, color } = titles[type];

  useEffect(() => {
    if (!db || !userData) return;

    // Map internal type to Firestore collection/type
    const collectionName = type === 'transaction' ? 'transactions' : 'logs';
    const logsRef = collection(db, collectionName);
    
    let q;
    if (type === 'transaction') {
      q = isAdmin 
        ? query(logsRef, orderBy('createdAt', 'desc'))
        : query(logsRef, where('userId', '==', userData.uid), orderBy('createdAt', 'desc'));
    } else {
      q = isAdmin
        ? query(logsRef, orderBy('timestamp', 'desc'))
        : query(logsRef, where('userId', '==', userData.uid), orderBy('timestamp', 'desc'));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setLogs(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [type, userData, isAdmin]);

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center gap-3">
        <div className={`p-3 rounded-xl bg-white/5 border border-white/10 ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-display font-bold text-white uppercase tracking-wider">{label}</h2>
          <p className="text-text-muted text-sm font-mono">System event history and audit trail</p>
        </div>
      </div>

      <div className="glass-panel rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-20">
            <Loader2 className="w-8 h-8 text-cyan animate-spin" />
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                <th className="px-6 py-4 text-xs font-mono text-text-muted uppercase tracking-widest">ID</th>
                <th className="px-6 py-4 text-xs font-mono text-text-muted uppercase tracking-widest">User</th>
                <th className="px-6 py-4 text-xs font-mono text-text-muted uppercase tracking-widest">Action</th>
                <th className="px-6 py-4 text-xs font-mono text-text-muted uppercase tracking-widest">Date</th>
                <th className="px-6 py-4 text-xs font-mono text-text-muted uppercase tracking-widest text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4 font-mono text-xs text-text-muted">#{log.id.slice(0, 6)}</td>
                  <td className="px-6 py-4 text-sm text-text-primary font-medium">{log.senderName || log.identifier || 'System'}</td>
                  <td className="px-6 py-4 text-sm text-text-muted group-hover:text-white transition-colors">{log.type || log.description || 'Action'}</td>
                  <td className="px-6 py-4 text-sm text-text-muted font-mono">{log.timestamp || log.createdAt}</td>
                  <td className={clsx(
                    "px-6 py-4 text-sm font-bold text-right",
                    log.amount > 0 ? 'text-green' : 'text-red'
                  )}>
                    {log.amount} CR
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
