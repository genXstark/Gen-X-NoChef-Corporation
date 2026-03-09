import React, { useEffect, useRef } from 'react';

export function Background() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let W = window.innerWidth;
    let H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;

    const stars: any[] = [];
    for (let i = 0; i < 200; i++) {
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.5 + 0.2,
        flicker: Math.random() * Math.PI * 2,
        flickerSpeed: Math.random() * 0.03 + 0.005,
        color: ['#ffffff', '#c8e0ff', '#ffe8c8', '#cce0ff'][Math.floor(Math.random() * 4)]
      });
    }

    let animationFrameId: number;

    const drawStars = () => {
      ctx.clearRect(0, 0, W, H);
      for (const s of stars) {
        s.flicker += s.flickerSpeed;
        const alpha = 0.4 + 0.6 * (Math.sin(s.flicker) * 0.5 + 0.5);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = s.color;
        ctx.globalAlpha = alpha;
        ctx.fill();

        if (s.r > 1) {
          const grd = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 4);
          grd.addColorStop(0, 'rgba(200,224,255,0.3)');
          grd.addColorStop(1, 'rgba(200,224,255,0)');
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r * 4, 0, Math.PI * 2);
          ctx.fillStyle = grd;
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
      animationFrameId = requestAnimationFrame(drawStars);
    };

    drawStars();

    const handleResize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W;
      canvas.height = H;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <>
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />
      <div className="nebula nebula-1" />
      <div className="nebula nebula-2" />
      <div className="nebula nebula-3" />
      <div className="grid-overlay" />
      <div className="scanlines" />
    </>
  );
}
