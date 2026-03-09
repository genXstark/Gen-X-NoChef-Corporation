import React, { useState } from 'react';
import { VOD_LIST, PACKAGE_LIST } from '../constants';
import { Save, X, Search, CheckSquare, Square, Wallet, Clock, Tag, DollarSign, Zap, RefreshCw, Loader2, Tv, Layers, Activity, Shield, Globe } from 'lucide-react';
import { clsx } from 'clsx';
import { runTransaction, doc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { iptvService } from '../services/iptvService';

interface DeviceFormProps {
  type: 'mag' | 'm3u';
  userData: any;
  setActiveTab: (tab: string) => void;
}

const PANDA_SPECIAL_PACKAGES = [
  'Netflix Premium 4K/ASIA', 'HBO Max', 'Hulu', 'Disney+/Pixar', 'Marvel MCU', 'Paramount+', 'Criterion Collection', 'Sony Pictures Core',
  'HBO Originals', 'AMC+', 'Apple TV+', 'BritBox', 'Starz', 'Peacock',
  'UFC & Fight Pass', 'ESPN Unlimited', 'Sky Sports (UK)', 'TNT Sports', 'DAZN', 'F1 TV Pro', 'NFL Sunday Ticket', 'NBA League Pass',
  'National Geographic', 'BBC News', 'CNN', 'Al Jazeera', 'Sky News', 'Smithsonian', 'Discovery 4K',
  'Disney Kids', 'Netflix 4K Kids', 'Pixar', 'PBS Kids', 'Nick Jr', 'Cartoon Network', 'Gulli',
  'BroadwayHD', 'Mezzo Live', 'Stingray Classica'
];

export function DeviceForm({ type, userData, setActiveTab }: DeviceFormProps) {
  const [selectedPackage, setSelectedPackage] = useState('PANDA SPECIAL');
  const [adultEnabled, setAdultEnabled] = useState(false);
  const [selectedVODs, setSelectedVODs] = useState<string[]>([]);
  const [packageSearch, setPackageSearch] = useState('');
  const [vodSearch, setVodSearch] = useState('');
  const [subType, setSubType] = useState<'NEW' | 'RENEW' | 'DEMO'>('NEW');
  const [macAddress, setMacAddress] = useState('');
  const [username, setUsername] = useState('');
  const [duration, setDuration] = useState('1'); // 1 month default
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const subscriptionCost = subType === 'DEMO' ? 0 : parseInt(duration);

  const handleConfirm = async () => {
    if (loading) return;
    setError('');
    setSuccess('');

    if (type === 'mag' && !macAddress) {
      setError('MAC Address is required');
      return;
    }
    if (type === 'm3u' && !username && subType !== 'NEW') {
      setError('Username is required for renewal');
      return;
    }

    if (userData.credits < subscriptionCost) {
      setError('Insufficient credits for this operation');
      return;
    }

    if (!db) {
      setError('System database offline. Check configuration.');
      return;
    }

    setLoading(true);

    try {
      await runTransaction(db, async (transaction) => {
        const userRef = doc(db, 'users', userData.uid);
        const userDoc = await transaction.get(userRef);

        if (!userDoc.exists()) throw new Error('User not found');
        const currentCredits = userDoc.data().credits;

        if (currentCredits < subscriptionCost) {
          throw new Error('Insufficient credits');
        }

        // 1. Deduct credits
        transaction.update(userRef, {
          credits: currentCredits - subscriptionCost
        });

        // 2. Call IPTV API
        const apiResult = await iptvService.provision(
          type, 
          type === 'mag' ? macAddress : username, 
          duration, 
          selectedPackage.toLowerCase().replace(' ', '_'), 
          userData.uid
        );

        if (apiResult.status !== 'true') {
          throw new Error(apiResult.message || 'IPTV API Error');
        }

        // 3. Log transaction
        const logRef = doc(collection(db, 'logs'));
        transaction.set(logRef, {
          userId: userData.uid,
          resellerUid: userData.uid,
          type: subType,
          deviceType: type,
          identifier: type === 'mag' ? macAddress : (apiResult.username || username),
          amount: subscriptionCost,
          timestamp: new Date().toISOString(),
          status: 'success',
          details: apiResult
        });

        // 4. Save line info
        const lineRef = doc(collection(db, 'lines'));
        const expireDate = new Date();
        if (subType === 'DEMO') {
          expireDate.setHours(expireDate.getHours() + 24);
        } else {
          expireDate.setMonth(expireDate.getMonth() + parseInt(duration));
        }

        transaction.set(lineRef, {
          userId: userData.uid,
          resellerUid: userData.uid,
          type: type,
          identifier: type === 'mag' ? macAddress : (apiResult.username || username),
          password: apiResult.password || '',
          url: apiResult.url || '',
          package: selectedPackage,
          adult: adultEnabled,
          expireDate: expireDate.toISOString(),
          createdAt: new Date().toISOString(),
          status: 'active'
        });
      });

      setSuccess(`Successfully provisioned ${type.toUpperCase()} line!`);
    } catch (err: any) {
      setError(err.message || 'Failed to provision line');
    } finally {
      setLoading(false);
    }
  };

  const handleMacChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.toUpperCase().replace(/[^0-9A-F]/g, '');
    if (value.length > 12) value = value.slice(0, 12);
    
    // Auto-format with colons
    const formatted = value.match(/.{1,2}/g)?.join(':') || value;
    setMacAddress(formatted);
  };

  const toggleVOD = (vod: string) => {
    setSelectedVODs(prev => 
      prev.includes(vod) ? prev.filter(v => v !== vod) : [...prev, vod]
    );
  };

  const filteredVODs = VOD_LIST.filter(v => v.toLowerCase().includes(vodSearch.toLowerCase()));

  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-8">
      {/* Header Section */}
      <div className="flex justify-between items-end mb-4">
        <div>
          <h1 className="text-3xl font-display font-black text-white tracking-tighter uppercase italic">
            Cyberpunk Reseller <span className="text-cyan">User Panel</span>
          </h1>
          <p className="text-text-muted font-mono text-xs uppercase tracking-[0.2em] mt-2">
            Add New | <span className="text-violet">{type === 'mag' ? 'MAG DEVICE' : 'LINES'}</span>
          </p>
        </div>
        <div className="flex gap-4">
          <select className="bg-void border border-white/10 rounded-lg px-4 py-2 text-xs text-white outline-none focus:border-cyan transition-all">
            <option>All Resellers</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Form Area */}
        <div className="lg:col-span-9 space-y-8">
          {/* Information Card */}
          <div className="glass-panel rounded-2xl p-8 border-orange-400/20 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-orange-400 to-transparent" />
            <h3 className="text-xl font-display font-bold text-white uppercase tracking-wider mb-6">Add New | Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-text-muted uppercase tracking-widest">Username / MAC</label>
                  <input 
                    type="text" 
                    value={type === 'mag' ? macAddress : username}
                    onChange={type === 'mag' ? handleMacChange : (e) => setUsername(e.target.value)}
                    placeholder={type === 'mag' ? '00:1A:79:XX:XX:XX' : 'Enter username'}
                    className="w-full bg-void/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cyan outline-none transition-all font-mono shadow-inner"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-text-muted uppercase tracking-widest">Action Type</label>
                    <div className="flex gap-2">
                      {['NEW', 'RENEW', 'DEMO'].map((t) => (
                        <button
                          key={t}
                          onClick={() => setSubType(t as any)}
                          className={clsx(
                            "flex-1 py-2 rounded-lg border text-[10px] font-bold uppercase transition-all",
                            subType === t ? "bg-cyan/10 border-cyan text-cyan" : "border-white/10 text-text-muted hover:border-white/30"
                          )}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-text-muted uppercase tracking-widest">Duration</label>
                    <select 
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      disabled={subType === 'DEMO'}
                      className="w-full bg-void/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cyan outline-none transition-all text-xs disabled:opacity-50"
                    >
                      {subType === 'DEMO' ? (
                        <option value="0">24H Trial (0 CR)</option>
                      ) : (
                        <>
                          <option value="1">1 Month (1 CR)</option>
                          <option value="3">3 Months (3 CR)</option>
                          <option value="6">6 Months (6 CR)</option>
                          <option value="12">12 Months (12 CR)</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-4 bg-orange-400/20 rounded-full relative cursor-pointer">
                      <div className="absolute left-1 top-1 w-2 h-2 bg-orange-400 rounded-full" />
                    </div>
                    <span className="text-xs text-text-primary">Use Custom Template</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-4 bg-orange-400/20 rounded-full relative cursor-pointer">
                      <div className="absolute right-1 top-1 w-2 h-2 bg-orange-400 rounded-full" />
                    </div>
                    <span className="text-xs text-text-primary uppercase font-bold text-orange-400 italic">🎬 VOD VAULT</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-mono text-text-muted uppercase tracking-widest">Notes</label>
                <textarea 
                  rows={8}
                  placeholder="Enter internal notes here..."
                  className="w-full bg-void/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cyan outline-none transition-all resize-none shadow-inner"
                />
              </div>
            </div>
          </div>

          {/* Package Selection Cards */}
          <div className="space-y-6">
            <h3 className="text-xl font-display font-bold text-white uppercase tracking-wider italic">Select Channel Package</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* PANDA SPECIAL */}
              <div 
                onClick={() => setSelectedPackage('PANDA SPECIAL')}
                className={clsx(
                  "glass-panel rounded-2xl p-6 border transition-all duration-500 cursor-pointer relative group overflow-hidden",
                  selectedPackage === 'PANDA SPECIAL' ? "border-cyan shadow-[0_0_40px_rgba(0,245,255,0.4)] scale-[1.05] ring-2 ring-cyan/50" : "border-white/5 hover:border-white/20"
                )}
              >
                {selectedPackage === 'PANDA SPECIAL' && (
                  <>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-cyan/20 blur-3xl -mr-16 -mt-16 animate-pulse" />
                    <div className="absolute inset-0 border-2 border-cyan/30 rounded-2xl animate-pulse pointer-events-none" />
                  </>
                )}
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <h4 className="text-lg font-display font-black text-white tracking-tight">✦ PANDA SPECIAL</h4>
                  <span className="bg-amber-500/20 text-amber-500 text-[8px] font-black px-2 py-1 rounded border border-amber-500/30 uppercase tracking-widest animate-bounce">DEFAULT</span>
                </div>
                <ul className="space-y-2 mb-6 relative z-10">
                  <li className="text-[10px] text-text-muted flex items-center gap-2"><Zap className="w-3 h-3 text-cyan" /> ⚡ 18,000+ Live Channels</li>
                  <li className="text-[10px] text-text-muted flex items-center gap-2"><Tv className="w-3 h-3 text-cyan" /> 4K / FHD / HD / SD Quality</li>
                  <li className="text-[10px] text-text-muted flex items-center gap-2"><Layers className="w-3 h-3 text-cyan" /> 🎬 100,000+ VOD — Movies & Series</li>
                  <li className="text-[10px] text-text-muted flex items-center gap-2"><Activity className="w-3 h-3 text-cyan" /> 🏆 Sports: NFL, NBA, UFC, PPV & more</li>
                  <li className="text-[10px] text-text-muted flex items-center gap-2"><Globe className="w-3 h-3 text-cyan" /> 🌍 Multi-language: EN, FR, AR, ES & more</li>
                  <li className="text-[10px] text-text-muted flex items-center gap-2"><Shield className="w-3 h-3 text-cyan" /> 🛡 99.9% Uptime SLA</li>
                  <li className="text-[10px] text-text-muted flex items-center gap-2"><RefreshCw className="w-3 h-3 text-cyan" /> ❄ Anti-freeze buffer technology</li>
                </ul>
                <div className="pt-4 border-t border-white/5 flex items-center justify-between relative z-10">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-mono text-cyan uppercase font-bold">Premium Package</span>
                    <span className="text-[11px] font-black text-white">1 CREDIT</span>
                  </div>
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <span className="text-[8px] font-mono text-text-muted uppercase">🔞 Adult</span>
                    <button 
                      onClick={() => setAdultEnabled(!adultEnabled)}
                      className={clsx(
                        "w-8 h-4 rounded-full relative transition-all",
                        adultEnabled ? "bg-cyan shadow-[0_0_10px_#00f5ff]" : "bg-white/10"
                      )}
                    >
                      <div className={clsx(
                        "absolute top-1 w-2 h-2 rounded-full bg-white transition-all",
                        adultEnabled ? "right-1" : "left-1"
                      )} />
                    </button>
                  </div>
                </div>
              </div>

              {/* INFINITY STREAM */}
              <div 
                onClick={() => setSelectedPackage('INFINITY STREAM')}
                className={clsx(
                  "glass-panel rounded-2xl p-6 border transition-all duration-500 cursor-pointer relative group overflow-hidden",
                  selectedPackage === 'INFINITY STREAM' ? "border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.2)] scale-[1.02]" : "border-white/5 hover:border-white/20"
                )}
              >
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <h4 className="text-lg font-display font-black text-white tracking-tight">⚡ INFINITY STREAM</h4>
                  <span className="bg-blue-500/20 text-blue-500 text-[8px] font-black px-2 py-1 rounded border border-blue-500/30 uppercase tracking-widest">Popular</span>
                </div>
                <ul className="space-y-2 mb-6 relative z-10">
                  <li className="text-[10px] text-text-muted flex items-center gap-2"><Tv className="w-3 h-3 text-blue-500" /> 📺 Premium channels + VOD</li>
                  <li className="text-[10px] text-text-muted flex items-center gap-2"><Zap className="w-3 h-3 text-blue-500" /> HD/FHD quality</li>
                  <li className="text-[10px] text-text-muted flex items-center gap-2"><Activity className="w-3 h-3 text-blue-500" /> 🏅 Sports package</li>
                  <li className="text-[10px] text-text-muted flex items-center gap-2"><Globe className="w-3 h-3 text-blue-500" /> 🌐 Multi-language</li>
                </ul>
                <div className="pt-4 border-t border-white/5 relative z-10">
                  <span className="text-[9px] font-mono text-blue-500 uppercase font-bold">Standard Package</span>
                  <div className="text-[11px] font-black text-white">1 CREDIT</div>
                </div>
              </div>

              {/* ULTRA PRIME */}
              <div 
                onClick={() => setSelectedPackage('ULTRA PRIME')}
                className={clsx(
                  "glass-panel rounded-2xl p-6 border transition-all duration-500 cursor-pointer relative group overflow-hidden",
                  selectedPackage === 'ULTRA PRIME' ? "border-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.2)] scale-[1.02]" : "border-white/5 hover:border-white/20"
                )}
              >
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <h4 className="text-lg font-display font-black text-white tracking-tight">👑 ULTRA PRIME</h4>
                  <span className="bg-purple-500/20 text-purple-500 text-[8px] font-black px-2 py-1 rounded border border-purple-500/30 uppercase tracking-widest">Elite</span>
                </div>
                <ul className="space-y-2 mb-6 relative z-10">
                  <li className="text-[10px] text-text-muted flex items-center gap-2"><Globe className="w-3 h-3 text-purple-500" /> 🌐 All channels</li>
                  <li className="text-[10px] text-text-muted flex items-center gap-2"><Tv className="w-3 h-3 text-purple-500" /> 🎞 4K Ultra HD</li>
                  <li className="text-[10px] text-text-muted flex items-center gap-2"><Activity className="w-3 h-3 text-purple-500" /> 👑 Complete sports + PPV</li>
                  <li className="text-[10px] text-text-muted flex items-center gap-2"><Globe className="w-3 h-3 text-purple-500" /> 🌍 All languages</li>
                  <li className="text-[10px] text-text-muted flex items-center gap-2"><Shield className="w-3 h-3 text-purple-500" /> 🛡 Premium support</li>
                </ul>
                <div className="pt-4 border-t border-white/5 relative z-10">
                  <span className="text-[9px] font-mono text-purple-500 uppercase font-bold">Elite Package</span>
                  <div className="text-[11px] font-black text-white">1 CREDIT</div>
                </div>
              </div>
            </div>
          </div>

          {/* VOD Selection Columns */}
          <div className="grid grid-cols-1 gap-8">
            <div className="glass-panel rounded-2xl p-6 border-cyan/10 space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <h3 className="text-lg font-display font-bold text-white uppercase tracking-wider">Select VOD</h3>
                <div className="flex gap-2">
                  <button className="px-3 py-1 rounded bg-violet/20 text-violet text-[10px] font-bold">All</button>
                  <select className="bg-void border border-white/10 rounded px-2 py-1 text-[10px] text-text-muted outline-none">
                    <option>No Adult</option>
                  </select>
                </div>
              </div>
              <button className="w-full py-2 bg-white/5 rounded-lg text-xs text-text-muted hover:text-white transition-all border border-white/5">Select All</button>
              <div className="space-y-1 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                {filteredVODs.map(vod => (
                  <div key={vod} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg transition-all group cursor-pointer" onClick={() => toggleVOD(vod)}>
                    <div className={clsx(
                      "w-4 h-4 rounded border flex items-center justify-center transition-all",
                      selectedVODs.includes(vod) ? "bg-violet border-violet" : "border-white/20 group-hover:border-white/40"
                    )}>
                      {selectedVODs.includes(vod) && <CheckSquare className="w-3 h-3 text-void" />}
                    </div>
                    <span className={clsx("text-xs transition-colors", selectedVODs.includes(vod) ? "text-violet font-bold" : "text-text-muted group-hover:text-white")}>{vod}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar KPIs */}
        <div className="lg:col-span-3 space-y-6">
          {error && (
            <div className="p-4 bg-red/10 border border-red/20 rounded-xl text-red text-xs font-mono uppercase tracking-wider animate-pulse">
              {error}
            </div>
          )}
          {success && (
            <div className="p-4 bg-green/10 border border-green/20 rounded-xl text-green text-xs font-mono uppercase tracking-wider">
              {success}
            </div>
          )}
          <div className="space-y-4">
            {[
              { label: 'Balance', value: `${userData?.credits || 0}`, icon: Wallet, color: 'text-green', bg: 'bg-green/10', border: 'border-green/30' },
              { label: 'Cost', value: `${subscriptionCost}`, icon: DollarSign, color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/30' },
            ].map((kpi, i) => (
              <div key={i} className="glass-panel p-6 rounded-2xl border-white/5 flex items-center justify-between group hover:border-white/20 transition-all">
                <div>
                  <h4 className="text-2xl font-display font-bold text-white mb-1 tracking-tight">{kpi.value}</h4>
                  <p className="text-[10px] font-mono text-text-muted uppercase tracking-widest">{kpi.label}</p>
                </div>
                <div className={clsx("w-10 h-10 rounded-xl flex items-center justify-center border shadow-inner", kpi.bg, kpi.border, kpi.color)}>
                  <kpi.icon className="w-5 h-5" />
                </div>
              </div>
            ))}
          </div>

          <button 
            onClick={handleConfirm}
            disabled={loading}
            className="w-full py-6 rounded-2xl bg-gradient-to-r from-cyan to-violet text-void font-black text-xl uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(0,245,255,0.4)] hover:scale-[1.02] transition-all relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12" />
            {loading ? <Loader2 className="w-8 h-8 animate-spin mx-auto" /> : 'Confirm'}
          </button>

          <div className="pt-8 flex flex-col items-center">
             <div className="w-full h-[200px] relative">
                {/* Stylized Particle Effect Placeholder */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-32 h-32 rounded-full bg-cyan/10 blur-3xl animate-pulse" />
                  <div className="w-16 h-16 rounded-full bg-violet/10 blur-2xl animate-pulse delay-700" />
                </div>
                <div className="absolute inset-0 flex flex-wrap gap-2 justify-center content-center opacity-40">
                  {[...Array(20)].map((_, i) => (
                    <div key={i} className="w-1 h-1 rounded-full bg-cyan animate-ping" style={{ animationDelay: `${i * 100}ms` }} />
                  ))}
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

