import React from 'react';
import { motion } from 'motion/react';
import { Logo } from './Logo';
import { Background } from './Background';
import { ShieldAlert } from 'lucide-react';

export function WaitingRoom({ onLogout }: { onLogout: () => void }) {
  return (
    <div className="relative min-h-screen bg-void flex items-center justify-center p-6 overflow-hidden">
      <Background />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel p-12 rounded-[2.5rem] max-w-2xl w-full text-center relative z-10 border-cyan/20 shadow-[0_0_50px_rgba(0,245,255,0.1)]"
      >
        <div className="flex justify-center mb-12">
          <div className="relative">
            <Logo size="xl" />
            <motion.div 
              animate={{ 
                opacity: [0.2, 0.5, 0.2],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute inset-0 bg-cyan/20 blur-3xl rounded-full -z-10"
            />
          </div>
        </div>

        <h2 className="font-display text-3xl font-black text-white mb-6 tracking-widest uppercase">
          Neural Link <span className="text-cyan">Pending</span>
        </h2>
        
        <div className="flex items-center justify-center gap-3 mb-8 text-cyan/60 font-mono text-sm tracking-widest">
          <ShieldAlert className="w-5 h-5 animate-pulse" />
          <span>NODE CALIBRATION IN PROGRESS</span>
        </div>

        <p className="text-text-muted text-lg leading-relaxed mb-12 font-light">
          Admin approval required. Your node is being calibrated to the Panda Network. 
          Please wait for a senior administrator to authorize your access.
        </p>

        <div className="space-y-4">
          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="h-full w-1/3 bg-gradient-to-r from-transparent via-cyan to-transparent"
            />
          </div>
          <p className="text-[10px] font-mono text-text-muted uppercase tracking-[0.3em]">
            Syncing with Mainframe...
          </p>
        </div>

        <button 
          onClick={onLogout}
          className="mt-12 px-8 py-3 rounded-full border border-white/10 text-text-muted hover:text-white hover:border-white/20 transition-all text-xs font-bold uppercase tracking-widest"
        >
          Disconnect Session
        </button>
      </motion.div>

      {/* Decorative Scan Lines */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="scan-line-cyber opacity-20" />
        <div className="scan-overlay-cyber opacity-10" />
      </div>
    </div>
  );
}
