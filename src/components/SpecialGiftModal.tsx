/**
 * Special Gift Presentation Card Component.
 * Displays only: Special gift from Badrinath R.
 * Zero quotes, zero extra text.
 */
import React, { useEffect, useState } from 'react';
import { Gift, Sparkles, X, Copy, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundManager } from '../audio/soundManager';

interface SpecialGiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReopenGift?: () => void;
}

export const SpecialGiftModal: React.FC<SpecialGiftModalProps> = ({
  isOpen,
  onClose,
  onReopenGift,
}) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      soundManager.playGiftRevealFanfare();

      // Golden Diwali confetti burst
      try {
        confetti({
          particleCount: 90,
          spread: 75,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#fbbf24', '#fde047', '#e11d48', '#ffffff'],
        });
      } catch {
        // Safe fallback
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopyWish = () => {
    navigator.clipboard.writeText('Special gift from Badrinath R');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReopen = () => {
    onClose();
    if (onReopenGift) {
      onReopenGift();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      {/* Outer Card Wrapper with Royal Rajasthani Gold Frame */}
      <div
        className="relative w-full max-w-lg rounded-2xl p-8 sm:p-10 text-center text-amber-100 overflow-hidden shadow-2xl transition-all"
        style={{
          background: 'linear-gradient(145deg, #18111e 0%, #2a1b10 50%, #120a16 100%)',
          border: '1px solid rgba(245, 158, 11, 0.45)',
          boxShadow: '0 0 60px rgba(245, 158, 11, 0.3), inset 0 0 40px rgba(245, 158, 11, 0.1)',
        }}
      >
        {/* Ornate corner filigree accents */}
        <div className="absolute top-2 left-2 text-amber-400/40 text-xs font-serif select-none pointer-events-none">
          ✦ ❈ ✦
        </div>
        <div className="absolute top-2 right-2 text-amber-400/40 text-xs font-serif select-none pointer-events-none">
          ✦ ❈ ✦
        </div>
        <div className="absolute bottom-2 left-2 text-amber-400/40 text-xs font-serif select-none pointer-events-none">
          ✦ ❈ ✦
        </div>
        <div className="absolute bottom-2 right-2 text-amber-400/40 text-xs font-serif select-none pointer-events-none">
          ✦ ❈ ✦
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-amber-300/70 hover:text-amber-100 hover:bg-amber-500/10 transition-colors"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Decorative Gift Box Icon */}
        <div className="flex items-center justify-center mb-6">
          <div
            className="p-4 rounded-full bg-gradient-to-b from-amber-500/20 to-amber-900/40 border border-amber-500/40 shadow-lg"
            style={{
              boxShadow: '0 0 35px rgba(245, 158, 11, 0.35)',
            }}
          >
            <Gift className="w-10 h-10 text-amber-300 animate-bounce" />
          </div>
        </div>

        {/* Ornamental Divider */}
        <div className="flex items-center justify-center gap-3 my-4">
          <div className="h-[1px] w-20 bg-gradient-to-r from-transparent via-amber-400/40 to-amber-400/80" />
          <Sparkles className="w-4 h-4 text-amber-400" />
          <div className="h-[1px] w-20 bg-gradient-to-l from-transparent via-amber-400/40 to-amber-400/80" />
        </div>

        {/* ONLY SHOW: Special gift from Badrinath R */}
        <div className="py-4 my-2">
          <h2
            className="font-cinzel text-2xl sm:text-4xl font-bold text-gold-gradient tracking-wide leading-tight text-gold-sparkle"
            style={{
              textShadow: '0 0 30px rgba(245, 158, 11, 0.45)',
            }}
          >
            Special gift from Badrinath R
          </h2>
        </div>

        {/* Ornamental Divider */}
        <div className="flex items-center justify-center gap-3 my-4">
          <div className="h-[1px] w-20 bg-gradient-to-r from-transparent via-amber-400/40 to-amber-400/80" />
          <Sparkles className="w-4 h-4 text-amber-400" />
          <div className="h-[1px] w-20 bg-gradient-to-l from-transparent via-amber-400/40 to-amber-400/80" />
        </div>

        {/* Actions Strip */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={handleReopen}
            className="px-4 py-2 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-semibold hover:bg-amber-500/30 transition-colors shadow-sm"
          >
            Watch 3D Unboxing Again
          </button>
          <button
            onClick={handleCopyWish}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-800 text-amber-200 text-xs font-medium hover:bg-neutral-700 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-xs font-semibold hover:from-amber-400 hover:to-amber-500 transition-colors shadow-md"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
