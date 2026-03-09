import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserCheck, UserX, Shield, CreditCard, Search } from 'lucide-react';

export function AdminPanel() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!db) return;
    const q = query(collection(db, 'users'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(usersData);
    });
    return () => unsubscribe();
  }, []);

  const handleStatusChange = async (userId: string, status: 'approved' | 'pending') => {
    if (!db) return;
    await updateDoc(doc(db, 'users', userId), { status });
  };

  const handleAddCredits = async (userId: string, amount: number) => {
    if (!db) return;
    await updateDoc(doc(db, 'users', userId), { 
      credits: increment(amount) 
    });
  };

  const filteredUsers = users.filter(u => 
    u.email?.toLowerCase().includes(search.toLowerCase()) || 
    u.username?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 space-y-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-display font-black text-white tracking-tight uppercase italic">Master <span className="text-red">Control</span></h2>
          <p className="text-text-muted font-mono text-xs uppercase tracking-widest mt-1">User Authorization & Credit Management</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input 
            type="text" 
            placeholder="Search Nodes..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:border-red focus:outline-none transition-all w-64"
          />
        </div>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden border-red/10">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-red/5">
              <th className="px-6 py-4 text-[10px] font-mono text-text-muted uppercase tracking-widest">User</th>
              <th className="px-6 py-4 text-[10px] font-mono text-text-muted uppercase tracking-widest">Status</th>
              <th className="px-6 py-4 text-[10px] font-mono text-text-muted uppercase tracking-widest">Credits</th>
              <th className="px-6 py-4 text-[10px] font-mono text-text-muted uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-red/5 transition-all group">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-white">{user.username}</span>
                    <span className="text-[10px] font-mono text-text-muted">{user.email}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    user.status === 'approved' ? 'bg-green/10 text-green border border-green/20' : 'bg-orange/10 text-orange border border-orange/20'
                  }`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-3 h-3 text-cyan" />
                    <span className="text-sm font-mono text-white">{user.credits || 0}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  {user.status === 'pending' ? (
                    <button 
                      onClick={() => handleStatusChange(user.id, 'approved')}
                      className="p-2 bg-green/10 text-green rounded-lg hover:bg-green/20 transition-all"
                      title="Approve User"
                    >
                      <UserCheck className="w-4 h-4" />
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleStatusChange(user.id, 'pending')}
                      className="p-2 bg-orange/10 text-orange rounded-lg hover:bg-orange/20 transition-all"
                      title="Suspend User"
                    >
                      <UserX className="w-4 h-4" />
                    </button>
                  )}
                  <button 
                    onClick={() => handleAddCredits(user.id, 10)}
                    className="p-2 bg-cyan/10 text-cyan rounded-lg hover:bg-cyan/20 transition-all"
                    title="Add 10 Credits"
                  >
                    <Shield className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
