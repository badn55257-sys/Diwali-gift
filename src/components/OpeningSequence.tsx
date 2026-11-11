/**
 * Opening Sequence Component for Diwali Celebration.
 * Starts in complete darkness with emerging golden particles,
 * illuminating title "A FESTIVAL OF LIGHTS", and "ENTER CELEBRATION" button.
 */
import React, { useEffect, useRef, useState } from 'react';
import { Sparkles, Gift } from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface OpeningSequenceProps {
  onEnter: () => void;
}

export const OpeningSequence: React.FC<OpeningSequenceProps> = ({ onEnter }) => {
  const [stage, setStage] = useState<'dark' | 'particles' | 'illuminate' | 'ready'>('dark');
  const [isFadingOut, setIsFadingOut] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    // 1. Start completely dark -> 2. Golden particles slowly appear
    const t1 = setTimeout(() => setStage('particles'), 400);
    // 3. Glowing illumination & title
    const t2 = setTimeout(() => setStage('illuminate'), 1400);
    // 4. Enter button becomes ready
    const t3 = setTimeout(() => setStage('ready'), 2400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  // Floating canvas particle embers
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const onResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', onResize);

    const particles: {
      x: number;
      y: number;
      size: number;
      speedY: number;
      speedX: number;
      opacity: number;
      color: string;
    }[] = [];

    const colors = ['#fef08a', '#f59e0b', '#fbbf24', '#ffffff', '#ea580c'];

    for (let i = 0; i < 70; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: 1 + Math.random() * 3,
        speedY: -(0.3 + Math.random() * 0.8),
        speedX: (Math.random() - 0.5) * 0.4,
        opacity: 0.1 + Math.random() * 0.7,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    let reqId = 0;
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach(p => {
        p.y += p.speedY;
        p.x += p.speedX;
        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }

        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.shadowBlur = 12;
        ctx.shadowColor = p.color;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      reqId = requestAnimationFrame(render);
    };

    reqId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(reqId);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  const handleEnterClick = () => {
    setIsFadingOut(true);
    try {
      soundManager.resumeContext();
      soundManager.startMusic();
      soundManager.playGiftUnwrap();
    } catch {
      // Audio fallback safe on mobile
    }

    setTimeout(() => {
      onEnter();
    }, 850);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-black min-h-[100dvh] transition-opacity duration-1000 px-4 py-6 overflow-hidden ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* 2D Canvas for gentle golden rising embers */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

      {/* Central Radiance Glow */}
      <div
        className={`absolute w-[280px] sm:w-[440px] md:w-[500px] h-[280px] sm:h-[440px] md:h-[500px] rounded-full transition-all duration-1000 pointer-events-none ${
          stage === 'illuminate' || stage === 'ready'
            ? 'opacity-35 scale-100'
            : 'opacity-0 scale-50'
        }`}
        style={{
          background: 'radial-gradient(circle, rgba(245, 158, 11, 0.4) 0%, rgba(220, 38, 38, 0.15) 50%, rgba(0, 0, 0, 0) 75%)',
          filter: 'blur(40px)',
        }}
      />

      {/* Centerpiece Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-xl my-auto">
        {/* Glowing Royal Gift Box Icon */}
        <div
          className={`mb-4 sm:mb-6 p-3.5 sm:p-4 rounded-full border border-amber-500/40 bg-amber-950/50 text-amber-300 transition-all duration-1000 ${
            stage === 'illuminate' || stage === 'ready'
              ? 'opacity-100 scale-100'
              : 'opacity-0 scale-75'
          }`}
          style={{
            boxShadow: '0 0 45px rgba(245, 158, 11, 0.45)',
          }}
        >
          <Gift className="w-8 h-8 sm:w-10 sm:h-10 animate-bounce text-amber-300" />
        </div>

        {/* Subtitle */}
        <div
          className={`text-[11px] sm:text-xs md:text-sm tracking-[0.25em] sm:tracking-[0.35em] uppercase text-amber-300/80 mb-2 sm:mb-3 font-medium transition-all duration-1000 delay-150 ${
            stage === 'illuminate' || stage === 'ready'
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-4'
          }`}
        >
          A SPECIAL POST-DIWALI GIFT SURPRISE
        </div>

        {/* Main Title */}
        <h1
          className={`font-cinzel text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-wider text-gold-gradient mb-3 sm:mb-4 transition-all duration-1000 delay-300 ${
            stage === 'illuminate' || stage === 'ready'
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-6'
          }`}
          style={{
            textShadow: '0 0 35px rgba(245, 158, 11, 0.4)',
          }}
        >
          YOUR DIWALI GIFT
        </h1>

        {/* Special gift presentation */}
        <div
          className={`text-sm sm:text-base md:text-lg text-amber-200/90 font-medium mb-6 sm:mb-8 transition-all duration-1000 delay-500 ${
            stage === 'illuminate' || stage === 'ready'
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-4'
          }`}
        >
          Special gift from Badrinath R
        </div>

        {/* "UNWRAP YOUR GIFT" Button */}
        <button
          onClick={handleEnterClick}
          onTouchStart={() => {
            // Pre-warm audio context on mobile touch start
            try { soundManager.resumeContext(); } catch {}
          }}
          disabled={stage !== 'ready'}
          className={`group relative px-7 sm:px-9 py-3 sm:py-4 min-h-[48px] rounded-full overflow-hidden font-cinzel font-bold text-xs sm:text-sm md:text-base tracking-widest text-slate-950 transition-all duration-700 select-none touch-manipulation ${
            stage === 'ready'
              ? 'opacity-100 translate-y-0 cursor-pointer shadow-lg hover:scale-105 active:scale-95'
              : 'opacity-0 translate-y-6 pointer-events-none'
          }`}
          style={{
            background: 'linear-gradient(135deg, #fef08a 0%, #f59e0b 50%, #d97706 100%)',
            boxShadow: '0 0 30px rgba(245, 158, 11, 0.5), 0 0 60px rgba(245, 158, 11, 0.25)',
          }}
        >
          <div className="relative z-10 flex items-center justify-center gap-2">
            <Gift className="w-4 h-4 text-amber-950 group-hover:rotate-12 transition-transform" />
            <span>UNWRAP YOUR GIFT</span>
            <Sparkles className="w-4 h-4 text-amber-950" />
          </div>
          {/* Shimmer overlay */}
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />
        </button>

        {/* Creator signature attribution */}
        <div
          className={`mt-6 sm:mt-10 text-[11px] sm:text-xs tracking-wider text-amber-400/70 font-light transition-opacity duration-1000 delay-700 ${
            stage === 'ready' ? 'opacity-80' : 'opacity-0'
          }`}
        >
          <span className="text-amber-300 font-medium">Special gift from Badrinath R</span>
        </div>
      </div>
    </div>
  );
};
