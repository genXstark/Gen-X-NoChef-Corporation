import React from 'react';

export function Logo({ className = "", size = "md", showText = true }: { className?: string, size?: "sm" | "md" | "lg" | "xl", showText?: boolean }) {
  // Scaling logic for Mission Control vibes
  const scaleMap = {
    sm: "scale-[0.4] origin-left",
    md: "scale-[0.6] origin-left",
    lg: "scale-100",
    xl: "scale-[1.5]"
  };

  return (
    <div className={`flex items-center gap-12 ${scaleMap[size]} ${className}`}>
      {/* INJECTED TECH STYLES */}
      <style>{`
        @keyframes scan-logo {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        @keyframes float-logo {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes flicker-logo {
          0%, 19.999%, 22%, 62.999%, 64%, 64.999%, 70%, 100% {
            opacity: 1;
            text-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
          }
          20%, 21.999%, 63%, 63.999%, 65%, 69.999% {
            opacity: 0.4;
            text-shadow: none;
          }
        }
        .glass-sculpture {
          background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.2) 0%, transparent 60%),
                      radial-gradient(circle at 70% 70%, rgba(0, 243, 255, 0.1) 0%, transparent 50%),
                      rgba(10, 5, 20, 0.5);
          backdrop-filter: blur(25px) saturate(1.5);
          border: 1px solid rgba(0, 243, 255, 0.4);
          box-shadow: 0 0 40px rgba(0, 243, 255, 0.2), inset 0 0 30px rgba(255, 255, 255, 0.1);
        }
        .panda-filter {
          filter: contrast(1.2) brightness(1.2) sepia(1) hue-rotate(240deg) saturate(3);
        }
        .animate-scan-logo { animation: scan-logo 3s linear infinite; }
        .animate-float-logo { animation: float-logo 6s ease-in-out infinite; }
        .animate-flicker-logo { animation: flicker-logo 4s infinite; }
      `}</style>

      {/* 1. THE PANDA COMMAND CORE (CIRCULAR ICON) */}
      <div className="relative w-72 h-72 flex items-center justify-center shrink-0">
        {/* Orbital Tech Rings */}
        <div className="absolute inset-0 border border-cyan/40 rounded-full animate-[spin_12s_linear_infinite] border-dashed shadow-[0_0_30px_rgba(0,243,255,0.1)]"></div>
        <div className="absolute inset-6 border border-violet/20 rounded-full animate-[spin_15s_linear_reverse_infinite] border-dotted"></div>
        
        {/* 3D Glass Image Container */}
        <div className="relative w-60 h-60 rounded-full flex items-center justify-center z-10 overflow-hidden glass-sculpture shadow-[0_0_50px_rgba(0,243,255,0.3)]">
          {/* Internal Neural Glow */}
          <div className="absolute inset-8 rounded-full bg-[radial-gradient(circle,_#00f3ff_0%,_transparent_70%)] opacity-40 blur-xl animate-pulse"></div>
          
          {/* The Panda Image */}
          <div 
            className="w-full h-full bg-center bg-no-repeat bg-cover opacity-90 mix-blend-overlay scale-100 rounded-full panda-filter" 
            style={{backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuB0BPv5WPQNP2UmQBVrlliZLnOWYwx5Phaj2Jvj9YUHK4XUH2dCJabxthkGH-VCCQlTGmpSr1B6r5pgVkEJKql8i2uErlwOXuS4c5p3M2yGSAG-RVHhZgSFAK-n-kqwm2WpNN3HG8b9sDYgt0kroayKTeQqy9HQFYmcquQ5ErC1XdMB1H-Mq5U3VS1jbSAW0G2gAf6S6Oko0IBy-5orkNe6Tt5cQnUsvUa87HdcFrhTujyM9gmGuEMjBrknq40J7KwBI3JbhpVVFwqg")`}}
          ></div>

          {/* Laser Bio-Scan Line */}
          <div className="absolute w-full h-[2px] bg-white shadow-[0_0_20px_4px_#00f3ff] animate-scan-logo z-20"></div>
        </div>

        {/* Neural Link Data Tag */}
        <div className="absolute -right-4 top-1/4 bg-black/60 backdrop-blur-md border-l-4 border-cyan px-3 py-1 rounded shadow-lg animate-float-logo z-20">
          <p className="text-[8px] text-white font-bold tracking-widest uppercase">CORE_LINK</p>
          <p className="text-[7px] text-cyan font-mono font-bold">ENCRYPTED</p>
        </div>
      </div>

      {/* 2. THE PANDA TV NEON TEXT */}
      {showText && (
        <div className="flex flex-col leading-[0.8]">
          <h1 className="font-display font-black italic text-7xl md:text-9xl uppercase flex flex-col animate-flicker-logo tracking-tighter">
            <span className="text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">Panda</span>
            <span className="text-cyan drop-shadow-[0_0_30px_rgba(0,243,255,0.6)]">TV</span>
          </h1>
          
          {/* Tech Detail Subline */}
          <div className="flex items-center gap-3 mt-4 opacity-70">
            <div className="h-[1px] w-12 bg-cyan"></div>
            <p className="text-[10px] text-cyan font-mono tracking-[0.5em] uppercase font-bold">
              Mission.Control(v4.2)
            </p>
            <div className="h-[1px] flex-1 bg-gradient-to-r from-cyan to-transparent"></div>
          </div>
        </div>
      )}
    </div>
  );
}
