import React, { useEffect, useRef, useState } from 'react';
import { Shield, Zap, Sparkles, Check, Mail, Lock, User as UserIcon, ArrowRight, Loader2 } from 'lucide-react';
import { Background } from './Background';
import { CyberPanelSection } from './CyberPanelSection';
import { Logo } from './Logo';
import { auth, db } from '../lib/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

export function LandingPage({ onEnter }: { onEnter: () => void }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState<'signin' | 'signup'>('signin');
  const [strength, setStrength] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const openModal = (tab: 'signin' | 'signup') => {
    setAuthTab(tab);
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const checkStrength = (v: string) => {
    let score = 0;
    if (v.length >= 8) score++;
    if (v.length >= 12) score++;
    if (/[A-Z]/.test(v) && /[a-z]/.test(v)) score++;
    if (/[0-9]/.test(v)) score++;
    if (/[^A-Za-z0-9]/.test(v)) score++;
    setStrength(score);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!auth || !db) {
      setError('Authentication system offline. Check configuration.');
      return;
    }

    setLoading(true);

    try {
      if (authTab === 'signup') {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Create user document in Firestore
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          username: username || email.split('@')[0],
          credits: 0,
          status: 'pending',
          createdAt: new Date().toISOString()
        });
      } else {
        try {
          await signInWithEmailAndPassword(auth, email, password);
        } catch (err: any) {
          // Special case for test user: auto-create if it doesn't exist
          if (email === 'test@pandapanel.tv' && password === 'TestReseller2026#' && (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found')) {
            await createUserWithEmailAndPassword(auth, email, password);
          } else {
            throw err;
          }
        }
        // App.tsx will handle the redirection once onAuthStateChanged and onSnapshot fire
      }
      closeModal();
    } catch (err: any) {
      console.error("Auth Error Details:", err);
      if (err.code === 'auth/visibility-check-was-unavailable') {
        setError('NETWORK SECURITY BLOCK: Authentication is being blocked by your browser\'s security settings for iframes. Please try refreshing or using a different browser.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('ACCOUNT EXISTS: This email is already registered. Please use the Sign In tab to access your account.');
        setAuthTab('signin');
      } else {
        setError(`CONNECTION ERROR: ${err.message || 'Unknown Error'}. Please ensure the domain is authorized in Firebase.`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address first.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth!, email);
      setSuccessMessage('Password reset email sent! Check your inbox.');
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err: any) {
      setError(`RESET ERROR: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-void text-text-primary font-sans overflow-x-hidden">
      <Background />
      
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 padding-18-48 flex items-center justify-between px-12 py-6 bg-gradient-to-b from-black/90 to-transparent backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan animate-pulse shadow-[0_0_8px_#00f5ff]" />
          <span className="font-mono text-[10px] font-bold text-cyan uppercase tracking-[0.2em]">
            Panda_Network_Status: <span className="text-white">Optimal</span>
          </span>
        </div>
        <ul className="hidden md:flex gap-9 list-none">
          <li><a href="#features" className="text-text-muted hover:text-cyan font-semibold text-sm tracking-widest uppercase transition-colors">Features</a></li>
          <li><a href="#plans" className="text-text-muted hover:text-cyan font-semibold text-sm tracking-widest uppercase transition-colors">Plans</a></li>
          <li><a href="#reseller" className="text-text-muted hover:text-cyan font-semibold text-sm tracking-widest uppercase transition-colors">Resellers</a></li>
        </ul>
        <div className="flex gap-3">
          <button onClick={() => openModal('signin')} className="font-display text-[0.75rem] font-bold tracking-[0.15em] uppercase px-6 py-2.5 rounded-[3px] border border-cyan/35 text-cyan hover:bg-cyan/10 hover:border-cyan hover:shadow-[0_0_20px_rgba(0,245,255,0.2)] transition-all">Sign In</button>
          <button onClick={() => openModal('signup')} className="font-display text-[0.75rem] font-bold tracking-[0.15em] uppercase px-6 py-2.5 rounded-[3px] bg-gradient-to-br from-cyan to-violet text-void hover:translate-y-[-2px] hover:shadow-[0_8px_40px_rgba(0,245,255,0.4)] transition-all">
            <span>⚡ Join Now</span>
          </button>
        </div>
      </nav>

      {/* HERO */}
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 pt-72 pb-20 relative z-10">
        <div className="inline-flex items-center gap-2 border border-cyan/25 bg-cyan/5 px-4 py-1.5 rounded-[2px] font-mono text-[0.7rem] text-cyan tracking-[0.2em] uppercase mb-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="w-1.5 h-1.5 rounded-full bg-cyan animate-pulse" />
          Live · 57,000+ Channels · 4K Ultra HD
        </div>
        
        <div className="flex justify-center mb-24 animate-in fade-in zoom-in duration-1000">
          <Logo size="xl" />
        </div>

        <p className="text-[clamp(1rem,2vw,1.2rem)] font-normal text-text-muted max-w-[800px] leading-[1.7] mb-12 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          The most powerful IPTV reseller platform in the galaxy. Deploy. Profit. Dominate. Zero latency. Infinite content. One network to rule them all.
        </p>
        <div className="flex gap-6 flex-wrap justify-center animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
          <button onClick={() => openModal('signup')} className="font-display text-[1rem] font-black tracking-[0.2em] uppercase px-12 py-5 rounded-[4px] bg-gradient-to-br from-cyan to-violet text-void hover:translate-y-[-2px] hover:shadow-[0_8px_40px_rgba(0,245,255,0.4)] transition-all">
            <span>⚡ Become a Reseller</span>
          </button>
          <button onClick={() => openModal('signin')} className="font-display text-[1rem] font-bold tracking-[0.2em] uppercase px-12 py-5 rounded-[4px] border border-cyan/35 text-cyan hover:bg-cyan/10 hover:border-cyan hover:shadow-[0_0_20px_rgba(0,245,255,0.2)] transition-all">
            ▶ Access Dashboard
          </button>
        </div>

        <div className="flex gap-0 justify-center flex-wrap mt-24 border-t border-cyan/10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500">
          {[
            { n: '57K+', l: 'Live Channels' },
            { n: '181K+', l: 'VOD Titles' },
            { n: '99.9%', l: 'Uptime SLA' },
            { n: '33+', l: 'Active Resellers' }
          ].map((s, i) => (
            <div key={i} className="px-16 py-10 text-center border-r border-cyan/10 last:border-none group">
              <div className="font-display text-[2.8rem] font-black bg-clip-text text-transparent bg-gradient-to-br from-cyan to-violet group-hover:scale-110 transition-transform">{s.n}</div>
              <div className="text-[0.85rem] tracking-[0.2em] text-text-muted uppercase mt-2">{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* FEATURES */}
      <section id="features" className="py-[120px] px-12 max-w-[1300px] mx-auto relative z-10">
        <div className="mb-16">
          <div className="font-mono text-[0.7rem] text-cyan tracking-[0.3em] uppercase mb-4 flex items-center gap-3">
            <div className="w-8 h-[1px] bg-cyan" /> Capabilities
          </div>
          <h2 className="font-display text-[clamp(1.8rem,4vw,3.2rem)] font-bold leading-[1.2] mb-6">
            Built for <em className="not-italic text-cyan">Resellers</em> Who<br />Demand the Edge
          </h2>
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-[2px] border border-cyan/10">
          {[
            { i: '📡', t: 'Anti-Freeze Technology', d: 'Proprietary buffer protocol eliminates freeze frames and artifacts even on congested networks.' },
            { i: '⚡', t: 'Instant Activation', d: 'Spin up new customer lines in under 3 seconds from your dashboard. Fully automated provisioning.' },
            { i: '🛡', t: 'DDoS Shield', d: 'Enterprise-grade infrastructure absorbs attacks up to 3Tbps, keeping every stream alive.' },
            { i: '🌍', t: 'Global CDN Edge', d: '55 edge nodes across 6 continents. Content served from the nearest node, always.' },
            { i: '💰', t: 'Margin Control', d: 'You set the price. You keep the profit. Full white-label branding included at every tier.' },
            { i: '🤖', t: 'AI Analytics', d: 'Predictive churn alerts, revenue optimization, and viewer behavior intelligence built-in.' }
          ].map((f, i) => (
            <div key={i} className="bg-panel p-10 relative overflow-hidden group hover:bg-[#060828f2] transition-colors">
              <span className="absolute top-4 right-5 font-mono text-[0.65rem] text-cyan/15 tracking-[0.1em]">{String(i + 1).padStart(2, '0')}</span>
              <span className="text-[2.4rem] mb-5 block transition-transform group-hover:scale-110 group-hover:rotate-[-5deg] drop-shadow-[0_0_12px_#00f5ff]">{f.i}</span>
              <h3 className="font-display text-base font-bold tracking-wider mb-3 text-text-primary">{f.t}</h3>
              <p className="text-[0.95rem] text-text-muted leading-[1.6] font-light">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PLANS */}
      <section id="plans" className="py-[120px] px-12 max-w-[1300px] mx-auto relative z-10">
        <div className="mb-16">
          <div className="font-mono text-[0.7rem] text-cyan tracking-[0.3em] uppercase mb-4 flex items-center gap-3">
            <div className="w-8 h-[1px] bg-cyan" /> Reseller Plans
          </div>
          <h2 className="font-display text-[clamp(1.8rem,4vw,3.2rem)] font-bold leading-[1.2] mb-6">
            Choose Your <em className="not-italic text-cyan">Power Level</em>
          </h2>
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-12 mt-20">
          {[
            { 
              t: 'Initiate', 
              p: '29', 
              d: 'Perfect for starting your IPTV empire from ground zero.', 
              f: ['Up to 50 credits', '24/7 Support', 'HD + FHD streams', 'Custom portal branding'],
              icon: Shield,
              aura: 'aura-blue',
              color: 'text-blue-500',
              btn: 'bg-gradient-to-r from-blue-600 to-indigo-600'
            },
            { 
              t: 'Commander', 
              p: '79', 
              d: 'Scale fast with dedicated infrastructure and premium channels.', 
              f: ['Up to 250 credits', 'Priority 24/7 Support', '4K Ultra HD streams', 'Full white-label suite', 'AI analytics'], 
              featured: true,
              icon: Zap,
              aura: 'aura-cyan',
              color: 'text-cyan',
              btn: 'bg-gradient-to-r from-cyan to-blue-500'
            },
            { 
              t: 'Overlord', 
              p: '199', 
              d: 'Unlimited power. Run your own IPTV empire at scale.', 
              f: ['Unlimited credits', 'Dedicated account manager', '8K ready streams', 'Multi-tier resellers'],
              icon: Sparkles,
              aura: 'aura-orange',
              color: 'text-orange',
              btn: 'bg-gradient-to-r from-orange to-red-600'
            }
          ].map((p, i) => (
            <div key={i} className={`relative group ${p.featured ? 'scale-105 z-10' : ''}`}>
              {/* Floating Sentinel */}
              <div className={`absolute -top-12 left-1/2 -translate-x-1/2 z-20 floating-sentinel`} style={{ animationDelay: `${i * -1}s` }}>
                <div className={`w-20 h-20 bg-void rounded-2xl border-2 flex items-center justify-center ${p.aura} ${p.featured ? 'border-cyan' : p.t === 'Initiate' ? 'border-blue-500' : 'border-orange'}`}>
                  <p.icon className={`w-10 h-10 ${p.color}`} />
                </div>
              </div>

              <div className={`h-full bg-panel/40 backdrop-blur-xl rounded-2xl p-10 pt-16 flex flex-col transition-all duration-300 hover:bg-panel/60 border ${p.featured ? 'lightning-border border-cyan/50 shadow-2xl shadow-cyan/20' : 'border-white/10'}`}>
                <h3 className={`font-display text-2xl font-black italic tracking-wider text-center mb-2 uppercase ${p.color}`}>{p.t}</h3>
                <div className="flex items-end justify-center gap-1 mb-8">
                  <span className="text-4xl font-black text-white">${p.p}</span>
                  <span className="text-text-muted font-bold mb-1">/mo</span>
                </div>
                
                <ul className="space-y-4 mb-10 flex-grow">
                  {p.f.map((f, j) => (
                    <li key={j} className="flex items-center gap-3 text-sm text-text-muted">
                      <Check className={`w-4 h-4 ${p.color}`} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <button 
                  onClick={() => openModal('signup')} 
                  className={`w-full py-4 rounded-xl text-white font-black uppercase tracking-widest text-xs transition-all hover:scale-105 shadow-lg ${p.btn} ${p.featured ? 'shadow-cyan/30' : ''}`}
                >
                  {p.featured ? 'Activate Now' : p.t === 'Initiate' ? 'Get Started' : 'Claim Dominance'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <CyberPanelSection />

      <footer className="border-t border-cyan/10 py-10 px-12 flex items-center justify-between flex-wrap gap-4 relative z-10">
        <div className="font-display text-base font-black tracking-widest text-gradient">PANDA<span className="text-pink-500">⬡</span>IPTV</div>
        <p className="text-[0.8rem] text-text-muted">© 2025 {window.location.hostname === 'pandapanel.tv' ? 'pandapanel.tv' : window.location.hostname}. All streams reserved. Reseller Network v4.2</p>
        <div className="flex gap-5">
          <a href="#" className="text-text-muted text-[0.8rem] no-underline">Privacy</a>
          <a href="#" className="text-text-muted text-[0.8rem] no-underline">Terms</a>
          <a href="#" className="text-text-muted text-[0.8rem] no-underline">Contact</a>
        </div>
      </footer>

      {/* AUTH MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-[#040618fa] border border-cyan/20 rounded-[2.5rem] w-full max-w-[480px] p-12 relative shadow-[0_0_100px_rgba(0,245,255,0.1)] overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-500">
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(0,245,255,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(0,245,255,0.5)_1px,transparent_1px)] bg-[length:32px_32px]" />
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan to-transparent" />
            
            <button onClick={closeModal} className="absolute top-6 right-6 bg-none border border-white/10 text-text-muted w-10 h-10 rounded-full flex items-center justify-center hover:border-pink-500 hover:text-pink-500 transition-all">✕</button>

            <div className="flex border-b border-cyan/15 mb-9">
              <div onClick={() => setAuthTab('signin')} className={`flex-1 py-4 text-center cursor-pointer font-display text-[0.8rem] tracking-[0.2em] transition-all border-b-2 ${authTab === 'signin' ? 'text-cyan border-cyan' : 'text-text-muted border-transparent'}`}>Sign In</div>
              <div onClick={() => setAuthTab('signup')} className={`flex-1 py-4 text-center cursor-pointer font-display text-[0.8rem] tracking-[0.2em] transition-all border-b-2 ${authTab === 'signup' ? 'text-cyan border-cyan' : 'text-text-muted border-transparent'}`}>Reseller Access</div>
            </div>

            <form onSubmit={handleAuth} className="space-y-6">
              {error && (
                <div className="p-4 bg-red/10 border border-red/20 rounded-xl text-red text-xs font-mono uppercase tracking-wider animate-pulse">
                  Error: {error}
                </div>
              )}

              {successMessage && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs font-mono uppercase tracking-wider">
                  {successMessage}
                </div>
              )}

              {authTab === 'signin' ? (
                <div className="animate-in fade-in duration-300 space-y-6">
                  <div className="text-center mb-8">
                    <h2 className="font-display text-2xl font-black mb-2 tracking-tight">Welcome Back</h2>
                    <p className="text-sm text-text-muted">Access your reseller dashboard</p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="block font-mono text-[0.65rem] tracking-[0.2em] uppercase text-text-muted ml-2">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan/40" />
                        <input 
                          type="email" 
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="panda_reseller@domain.com" 
                          className="w-full pl-12 pr-4 py-4 bg-cyan/5 border border-cyan/15 rounded-2xl text-text-primary outline-none focus:border-cyan focus:bg-cyan/10 focus:ring-2 focus:ring-cyan/10 transition-all" 
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="block font-mono text-[0.65rem] tracking-[0.2em] uppercase text-text-muted ml-2">Access Key</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan/40" />
                        <input 
                          type="password" 
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••••••••••" 
                          className="w-full pl-12 pr-4 py-4 bg-cyan/5 border border-cyan/15 rounded-2xl text-text-primary outline-none focus:border-cyan focus:bg-cyan/10 focus:ring-2 focus:ring-cyan/10 transition-all" 
                        />
                      </div>
                      <div className="text-right px-2 flex justify-between items-center">
                        <button 
                          type="button"
                          onClick={() => {
                            setEmail('test@pandapanel.tv');
                            setPassword('TestReseller2026#');
                          }}
                          className="text-[10px] font-mono text-violet hover:text-violet-400 uppercase tracking-widest transition-colors font-bold"
                        >
                          ⚡ Demo Access
                        </button>
                        <button 
                          type="button"
                          onClick={handleForgotPassword}
                          className="text-[10px] font-mono text-cyan/60 hover:text-cyan uppercase tracking-widest transition-colors"
                        >
                          Forgot Password?
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="animate-in fade-in duration-300 space-y-6">
                  <div className="text-center mb-8">
                    <h2 className="font-display text-2xl font-black mb-2 tracking-tight">Join the Grid</h2>
                    <p className="text-sm text-text-muted">Become an authorized Panda IPTV reseller</p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="block font-mono text-[0.65rem] tracking-[0.2em] uppercase text-text-muted ml-2">Username</label>
                      <div className="relative">
                        <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan/40" />
                        <input 
                          type="text" 
                          required
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder="CyberPanda" 
                          className="w-full pl-12 pr-4 py-4 bg-cyan/5 border border-cyan/15 rounded-2xl text-text-primary outline-none focus:border-cyan focus:bg-cyan/10 transition-all" 
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="block font-mono text-[0.65rem] tracking-[0.2em] uppercase text-text-muted ml-2">Business Email</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan/40" />
                        <input 
                          type="email" 
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@business.com" 
                          className="w-full pl-12 pr-4 py-4 bg-cyan/5 border border-cyan/15 rounded-2xl text-text-primary outline-none focus:border-cyan focus:bg-cyan/10 transition-all" 
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="block font-mono text-[0.65rem] tracking-[0.2em] uppercase text-text-muted ml-2">Create Password</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan/40" />
                        <input 
                          type="password" 
                          required
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            checkStrength(e.target.value);
                          }}
                          placeholder="••••••••••••" 
                          className="w-full pl-12 pr-4 py-4 bg-cyan/5 border border-cyan/15 rounded-2xl text-text-primary outline-none focus:border-cyan focus:bg-cyan/10 transition-all" 
                        />
                      </div>
                      <div className="h-[3px] bg-white/10 rounded-full mt-2 overflow-hidden mx-2">
                        <div className={`h-full transition-all duration-300 ${strength < 2 ? 'bg-pink-500' : strength < 4 ? 'bg-orange-500' : 'bg-cyan'}`} style={{ width: `${(strength / 5) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <button 
                type="submit"
                disabled={loading}
                className="w-full py-5 rounded-2xl font-display text-[0.9rem] font-black tracking-[0.2em] text-void uppercase hover:translate-y-[-2px] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-br from-cyan to-violet hover:shadow-[0_8px_40px_rgba(0,245,255,0.5)]"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-void/20 border-t-void rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{authTab === 'signin' ? 'ENTER THE NETWORK' : 'ACTIVATE ACCOUNT'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center mt-6 text-sm text-text-muted">
                {authTab === 'signin' ? (
                  <>
                    <p className="mb-4">No account? <a onClick={() => setAuthTab('signup')} className="text-cyan cursor-pointer hover:underline">Apply for reseller access →</a></p>
                    <p className="text-[10px] font-mono text-text-muted/40 uppercase tracking-widest">
                      First time? Use the email you registered with in Firebase Console.
                    </p>
                  </>
                ) : (
                  <>Already a reseller? <a onClick={() => setAuthTab('signin')} className="text-cyan cursor-pointer hover:underline">Sign in →</a></>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
