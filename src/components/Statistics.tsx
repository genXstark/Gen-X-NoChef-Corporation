import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, Legend 
} from 'recharts';
import { DollarSign, Users, Activity, TrendingUp } from 'lucide-react';
import { clsx } from 'clsx';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

export function Statistics({ userData, setActiveTab }: { userData: any, setActiveTab: (tab: string) => void }) {
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const isAdmin = userData?.role === 'ADMIN';

  useEffect(() => {
    const fetchStats = async () => {
      if (!db) return;
      try {
        const linesRef = collection(db, 'lines');
        const q = isAdmin 
          ? query(linesRef)
          : query(linesRef, where('resellerUid', '==', userData.uid));
        
        const snapshot = await getDocs(q);
        const dataByMonth: Record<string, any> = {};
        
        snapshot.docs.forEach(doc => {
          const date = new Date(doc.data().createdAt || doc.data().expireDate);
          const month = date.toLocaleString('default', { month: 'short' });
          if (!dataByMonth[month]) {
            dataByMonth[month] = { name: month, new: 0, renew: 0, demo: 0 };
          }
          const type = doc.data().type || 'new';
          if (type === 'new') dataByMonth[month].new++;
          else if (type === 'renew') dataByMonth[month].renew++;
          else dataByMonth[month].demo++;
        });

        const sortedMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const chartData = Object.values(dataByMonth).sort((a, b) => 
          sortedMonths.indexOf(a.name) - sortedMonths.indexOf(b.name)
        );

        setStats(chartData.length > 0 ? chartData : [
          { name: 'Jan', new: 0, renew: 0, demo: 0 },
          { name: 'Feb', new: 0, renew: 0, demo: 0 }
        ]);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [userData, isAdmin]);

  const subTypeData = stats.length > 0 ? [
    { name: 'New', value: stats.reduce((acc, curr) => acc + curr.new, 0), color: '#00f5ff' },
    { name: 'Renew', value: stats.reduce((acc, curr) => acc + curr.renew, 0), color: '#8b00ff' },
    { name: 'Demo', value: stats.reduce((acc, curr) => acc + curr.demo, 0), color: '#ff0080' },
  ] : [];

  const totalCredits = subTypeData.reduce((acc, curr) => acc + curr.value, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <div className="w-8 h-8 border-4 border-cyan/20 border-t-cyan rounded-full animate-spin" />
      </div>
    );
  }
  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-display font-black text-white tracking-tighter uppercase italic">Statistics</h1>
          <p className="text-text-muted font-mono text-xs uppercase tracking-[0.2em] mt-2">Detailed system performance metrics</p>
        </div>
        <div className="flex gap-4">
          <div className="glass-panel px-4 py-2 rounded-lg flex items-center gap-3 border-white/10">
            <DollarSign className="w-4 h-4 text-green" />
            <div>
              <p className="text-[8px] font-mono text-text-muted uppercase">Credit Spent</p>
              <p className="text-sm font-bold text-white">{totalCredits}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-8 glass-panel rounded-2xl p-8 border-white/5">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-display font-bold text-white uppercase tracking-wider">Subscriptions</h3>
            <div className="flex gap-4 text-[10px] font-mono text-text-muted">
              <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-cyan" /> New</div>
              <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-violet" /> Renew</div>
              <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-pink" /> Demo</div>
            </div>
          </div>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.1)" tick={{fill: 'rgba(255,255,255,0.3)', fontSize: 10}} />
                <YAxis stroke="rgba(255,255,255,0.1)" tick={{fill: 'rgba(255,255,255,0.3)', fontSize: 10}} />
                <Tooltip
                  cursor={{fill: 'rgba(255,255,255,0.05)'}}
                  contentStyle={{ backgroundColor: 'rgba(6,8,30,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                />
                <Bar dataKey="new" fill="#00f5ff" radius={[4, 4, 0, 0]} />
                <Bar dataKey="renew" fill="#8b00ff" radius={[4, 4, 0, 0]} />
                <Bar dataKey="demo" fill="#ff0080" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Side Stats */}
        <div className="lg:col-span-4 space-y-8">
          <div className="glass-panel rounded-2xl p-6 border-white/5">
            <h3 className="text-lg font-display font-bold text-white uppercase tracking-wider mb-6">System Distribution</h3>
            <div className="space-y-6">
              <div className="p-4 bg-cyan/5 border border-cyan/20 rounded-xl">
                <p className="text-[10px] font-mono text-cyan uppercase mb-1">Total Volume</p>
                <p className="text-2xl font-black text-white">{totalCredits} Units</p>
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-6 border-white/5">
            <h3 className="text-lg font-display font-bold text-white uppercase tracking-wider mb-6">Subscription Types</h3>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={subTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {subTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(6,8,30,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-4">
              {subTypeData.map((type, i) => (
                <div key={i} className="text-center">
                  <p className="text-[10px] font-mono text-text-muted uppercase mb-1">{type.name}</p>
                  <p className="text-xs font-bold text-white">{type.value}%</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
