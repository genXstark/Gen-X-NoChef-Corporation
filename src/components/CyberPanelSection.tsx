import React from 'react';
import { Terminal, BellRing, AlarmClock, Gauge, Timer, ShieldCheck, Cpu } from 'lucide-react';
import { clsx } from 'clsx';

export function CyberPanelSection() {
  return (
    <section className="relative py-20 overflow-hidden bg-void">
      {/* Background Decorations */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 stars-cyber"></div>
        <div className="absolute inset-0 grid-bg-cyber bg-[linear-gradient(to_right,#00f5ff10_1px,transparent_1px),linear-gradient(to_bottom,#00f5ff10_1px,transparent_1px)] opacity-20"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/circuit-board.png')] opacity-5 mix-blend-overlay"></div>
      </div>

      <div className="layout-content-container flex flex-col max-w-[1200px] w-full flex-1 relative z-10 p-4 md:p-10 mx-auto">
        {/* Header Bar */}
        <div className="flex justify-between items-center w-full border-b border-cyan/30 pb-4 mb-12 backdrop-blur-sm">
          <div className="flex gap-4 items-center">
            <Terminal className="w-5 h-5 text-cyan animate-pulse" />
            <p className="text-xs tracking-[0.2em] text-cyan/80 font-mono font-bold uppercase">SYS.BOOT.SEQ_BEYOND</p>
          </div>
          <div className="flex gap-2">
            <div className="h-1.5 w-8 bg-cyan/20 rounded-full shadow-[0_0_5px_#00f5ff]"></div>
            <div className="h-1.5 w-8 bg-violet/40 rounded-full"></div>
            <div className="h-1.5 w-8 bg-gradient-to-r from-cyan to-violet rounded-full animate-pulse shadow-[0_0_10px_#00f5ff]"></div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-16 items-center justify-center flex-1">
          {/* Scanning Interface */}
          <div className="relative w-full max-w-md aspect-square flex items-center justify-center group perspective-1000">
            <div className="absolute inset-0 border border-cyan/30 rounded-full scale-90 border-dashed animate-[spin_20s_linear_infinite]"></div>
            <div className="absolute inset-0 border border-violet/30 rounded-full scale-75 animate-[spin_15s_linear_infinite_reverse]"></div>
            <div className="relative w-72 h-72 rounded-full overflow-hidden border-2 border-cyan/50 bg-black shadow-[0_0_50px_-10px_rgba(0,245,255,0.5)]">
              <div 
                className="w-full h-full bg-center bg-no-repeat bg-contain p-4 relative z-0" 
                style={{ 
                  backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuB0BPv5WPQNP2UmQBVrlliZLnOWYwx5Phaj2Jvj9YUHK4XUH2dCJabxthkGH-VCCQlTGmpSr1B6r5pgVkEJKql8i2uErlwOXuS4c5p3M2yGSAG-RVHhZgSFAK-n-kqwm2WpNN3HG8b9sDYgt0kroayKTeQqy9HQFYmcquQ5ErC1XdMB1H-Mq5U3VS1jbSAW0G2gAf6S6Oko0IBy-5orkNe6Tt5cQnUsvUa87HdcFrhTujyM9gmGuEMjBrknq40J7KwBI3JbhpVVFwqg")`,
                  filter: 'drop-shadow(0 0 10px #00f5ff)' 
                }}
              />
              <div className="scan-overlay-cyber"></div>
              <div className="scan-line-cyber"></div>
            </div>
            <div className="absolute -right-8 top-1/4 bg-black/80 border-l-2 border-cyan px-4 py-1.5 backdrop-blur-md shadow-[0_0_15px_rgba(0,245,255,0.2)]">
              <p className="text-[10px] text-cyan tracking-widest font-mono font-bold uppercase">SCANNING_NEURAL_NET</p>
            </div>
            <div className="absolute -left-8 bottom-1/4 bg-black/80 border-r-2 border-violet px-4 py-1.5 backdrop-blur-md shadow-[0_0_15px_rgba(139,0,255,0.2)]">
              <p className="text-[10px] text-violet tracking-widest font-mono font-bold uppercase">ID: PANDA_CYBER_V9</p>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex flex-col gap-10 w-full max-w-lg">
            <div className="flex flex-col border-l-4 border-cyan pl-8 py-2 bg-gradient-to-r from-cyan/5 to-transparent">
              <h1 className="text-white font-display tracking-wider text-5xl font-black italic leading-none uppercase glitch-shadow-cyber">
                Panda TV
              </h1>
              <p className="text-cyan text-sm font-black tracking-[0.5em] uppercase mt-3 text-glow-cyber">
                Beyond Reality Access
              </p>
            </div>

            <div className="flex flex-col gap-8 bg-surface-dark/60 p-10 rounded-2xl border border-cyan/30 backdrop-blur-md box-glow-cyber relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan to-transparent opacity-50"></div>
              <h3 className="text-2xl font-display text-white uppercase font-black tracking-wider">Stop fighting spreadsheets</h3>
              <p className="text-text-muted text-sm leading-relaxed font-semibold">
                We built the "Easy Button" for agents who want to scale without the headache. Auto-Renewal Toggle: Flip the switch to automatically deduct credits and keep your VIP clients online without you lifting a finger.
              </p>
              
              <div className="flex gap-6">
                <div className="flex flex-col gap-2 p-4 rounded-xl bg-black/40 border border-cyan/20 w-1/2 group hover:border-cyan/40 transition-all">
                  <div className="flex items-center gap-3 text-cyan">
                    <BellRing className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Urgent Widget</span>
                  </div>
                  <p className="text-[11px] text-text-muted font-bold">Spot every line expiring in the next 24 hours instantly.</p>
                </div>
                <div className="flex flex-col gap-2 p-4 rounded-xl bg-black/40 border border-violet/20 w-1/2 group hover:border-violet/40 transition-all">
                  <div className="flex items-center gap-3 text-violet">
                    <AlarmClock className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Smart Expiry</span>
                  </div>
                  <p className="text-[11px] text-text-muted font-bold">Custom alerts for 7, 3, or 1 day so you're always ahead.</p>
                </div>
              </div>

              <button className="group relative flex items-center justify-center gap-3 bg-gradient-to-r from-cyan to-violet p-[1px] rounded-xl overflow-hidden mt-2 transition-all hover:shadow-[0_0_30px_rgba(0,245,255,0.4)]">
                <div className="absolute inset-0 bg-white/20 group-hover:bg-white/30 transition-colors"></div>
                <div className="relative bg-black w-full h-full rounded-xl px-8 py-4 flex items-center justify-center gap-3 group-hover:bg-black/90 transition-colors">
                  <span className="font-display font-black uppercase tracking-[0.2em] text-sm text-white">Grab your Panda Panel Today</span>
                  <span className="text-xl">🚀</span>
                </div>
              </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div className="flex flex-col gap-2 p-5 rounded-xl bg-surface-dark/40 border border-cyan/20 hover:border-cyan/60 transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,245,255,0.15)] group backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <Gauge className="w-4 h-4 text-cyan group-hover:text-white transition-colors" />
                  <p className="text-cyan/70 text-[10px] font-black uppercase tracking-widest group-hover:text-cyan transition-colors">Bandwidth</p>
                </div>
                <p className="text-white tracking-tight text-2xl font-black font-display">12.4 TB/s</p>
                <p className="text-green text-[10px] font-mono font-bold uppercase tracking-widest">Zero-buffer 4K</p>
              </div>
              <div className="flex flex-col gap-2 p-5 rounded-xl bg-surface-dark/40 border border-violet/20 hover:border-violet/60 transition-all duration-300 hover:shadow-[0_0_20px_rgba(139,0,255,0.15)] group backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <Timer className="w-4 h-4 text-violet group-hover:text-white transition-colors" />
                  <p className="text-violet/70 text-[10px] font-black uppercase tracking-widest group-hover:text-violet transition-colors">Latency</p>
                </div>
                <p className="text-white tracking-tight text-2xl font-black font-display">4ms</p>
                <p className="text-pink text-[10px] font-mono font-bold uppercase tracking-widest">Instant Switch</p>
              </div>
              <div className="flex flex-col gap-2 p-5 rounded-xl bg-surface-dark/40 border border-cyan/20 hover:border-cyan/60 transition-all duration-300 col-span-2 md:col-span-1 hover:shadow-[0_0_20px_rgba(0,245,255,0.15)] backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-4 h-4 text-cyan" />
                  <p className="text-cyan/70 text-[10px] font-black uppercase tracking-widest">Stability</p>
                </div>
                <p className="text-white tracking-tight text-2xl font-black font-display">99.9%</p>
                <p className="text-cyan/50 text-[10px] font-mono font-bold uppercase tracking-widest">Secure Kernel</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Stats Area */}
        <div className="flex flex-col lg:flex-row gap-8 mt-16 pt-8 border-t border-cyan/10 relative">
          <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-cyan"></div>
          <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-violet"></div>
          
          {/* Stability Chart */}
          <div className="flex-1 min-w-0 bg-surface-dark/40 rounded-2xl p-8 border border-white/5 backdrop-blur-sm shadow-inner relative overflow-hidden">
            <div className="flex justify-between items-start mb-6 relative z-10">
              <div>
                <p className="text-white text-[10px] font-black uppercase tracking-[0.3em] mb-2">Stream Stability</p>
                <p className="text-cyan text-4xl font-black font-display italic text-glow-cyber">99.9%</p>
              </div>
              <div className="flex gap-3 text-[10px] font-mono text-cyan/70 items-center border border-cyan/30 px-3 py-1.5 rounded-full bg-black/40">
                <span className="font-black tracking-widest">LIVE_FEED</span>
                <span className="w-2.5 h-2.5 rounded-full bg-green animate-pulse shadow-[0_0_10px_#00e676]"></span>
              </div>
            </div>
            <div className="h-[140px] w-full relative overflow-hidden">
              <svg className="w-[200%] h-full overflow-visible chart-breathe-cyber" preserveAspectRatio="none" viewBox="0 0 478 150">
                <defs>
                  <linearGradient id="chartGradientCyber" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#00f5ff" stopOpacity="0.3"></stop>
                    <stop offset="100%" stopColor="#8b00ff" stopOpacity="0"></stop>
                  </linearGradient>
                  <filter height="140%" id="glowCyber" width="140%" x="-20%" y="-20%">
                    <feGaussianBlur result="coloredBlur" stdDeviation="4"></feGaussianBlur>
                    <feMerge>
                      <feMergeNode in="coloredBlur"></feMergeNode>
                      <feMergeNode in="SourceGraphic"></feMergeNode>
                    </feMerge>
                  </filter>
                </defs>
                <path className="wave-anim-cyber" d="M0 109C18.15 109 18.15 21 36.3 21C54.46 21 54.46 41 72.61 41C90.76 41 90.76 93 108.92 93C127.07 93 127.07 33 145.23 33C163.38 33 163.38 101 181.53 101C199.69 101 199.69 61 217.84 61C236 61 236 45 254.15 45C272.3 45 272.3 121 290.46 121C308.61 121 308.61 149 326.76 149C344.92 149 344.92 1 363.07 1C381.23 1 381.23 81 399.38 81C417.53 81 417.53 129 435.69 129C453.84 129 453.84 25 472 25V150H0V109Z" fill="url(#chartGradientCyber)"></path>
                <path className="wave-anim-cyber chart-wave-cyber" d="M0 109C18.15 109 18.15 21 36.3 21C54.46 21 54.46 41 72.61 41C90.76 41 90.76 93 108.92 93C127.07 93 127.07 33 145.23 33C163.38 33 163.38 101 181.53 101C199.69 101 199.69 61 217.84 61C236 61 236 45 254.15 45C272.3 45 272.3 121 290.46 121C308.61 121 308.61 149 326.76 149C344.92 149 344.92 1 363.07 1C381.23 1 381.23 81 399.38 81C417.53 81 417.53 129 435.69 129C453.84 129 453.84 25 472 25" fill="none" filter="url(#glowCyber)" stroke="#00f5ff" strokeLinecap="round" strokeWidth="2"></path>
              </svg>
            </div>
          </div>

          {/* Console Output */}
          <div className="lg:w-96 flex flex-col gap-3 p-6 bg-black/60 rounded-2xl border border-cyan/20 font-mono text-[11px] overflow-hidden h-[220px] relative shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent z-10 pointer-events-none"></div>
            <p className="text-cyan mb-3 font-black uppercase border-b border-cyan/30 pb-2 flex justify-between items-center">
              <span className="animate-pulse tracking-widest">Console Output</span>
              <Cpu className="w-4 h-4 text-violet" />
            </p>
            <div className="flex flex-col gap-2 opacity-90 font-bold">
              <p className="text-cyan/90 tracking-tight">&gt; [INIT] Panda Panel loading...</p>
              <p className="text-violet/80 tracking-tight">&gt; [AUTH] Reseller verified - Limited Reseller Sits</p>
              <p className="text-green font-black tracking-tight">&gt; [SYNC] 181K+ VOD & 57,000+ Channels Ready</p>
              <p className="text-white/60 tracking-tight">&gt; [SYS] Auto-renewal daemon active...</p>
              <p className="text-cyan/60 tracking-tight">&gt; [LOG] User activity: 98% retention</p>
              <p className="text-violet/60 tracking-tight">&gt; [MSG] "Easy Button" enabled.</p>
              <p className="text-green font-black tracking-tight">&gt; [PAY] Credits auto-deducted.</p>
              <p className="text-white/40 tracking-tight">&gt; [SYS] Monitoring expiration dates...</p>
              <p className="text-green font-black tracking-tight">&gt; [OK] All systems operational.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
