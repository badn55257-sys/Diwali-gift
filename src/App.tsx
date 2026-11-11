/**
 * Master React Application Entry Point.
 * Orchestrates:
 * - 3D Diwali Scene inside WebGL Canvas ref
 * - Cinematic Opening Sequence
 * - Top Bar Contract
 * - Collapsible Unified Bottom Control Dock
 * - Badrinath's Special Gift Modal
 * - Web Audio Ambient Festive Synthesizer
 */
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { DiwaliScene, CameraPreset } from './scene/diwaliScene';
import { OpeningSequence } from './components/OpeningSequence';
import { SpecialGiftModal } from './components/SpecialGiftModal';
import { ControlDock } from './components/ControlDock';
import { soundManager } from './audio/soundManager';
import { Heart, Sparkles, Flame, Gift } from 'lucide-react';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sceneRef = useRef<DiwaliScene | null>(null);

  const [hasEntered, setHasEntered] = useState(false);
  const [isGreetingOpen, setIsGreetingOpen] = useState(false);
  const [currentCameraPreset, setCurrentCameraPreset] = useState<CameraPreset>('cinematic');
  const [isGiftOpen, setIsGiftOpen] = useState(false);

  // Diya lit state
  const [litCount, setLitCount] = useState(0);
  const [totalDiyas, setTotalDiyas] = useState(0);

  // Audio state
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.6);

  // Fireworks auto mode
  const [isAutoFireworks, setIsAutoFireworks] = useState(true);

  // Initialize Three.js scene once on mount
  useEffect(() => {
    if (!canvasRef.current) return;

    const scene = new DiwaliScene(canvasRef.current);
    sceneRef.current = scene;

    scene.onDiyaLitCountChange = (lit, total) => {
      setLitCount(lit);
      setTotalDiyas(total);
    };

    scene.onGiftOpened = () => {
      setIsGiftOpen(true);
      setTimeout(() => {
        setIsGreetingOpen(true);
      }, 1600);
    };

    return () => {
      scene.dispose();
      sceneRef.current = null;
    };
  }, []);

  // Handle entering celebration & automatically unboxing the 3D gift
  const handleEnterCelebration = useCallback(() => {
    setHasEntered(true);
    setIsMusicPlaying(true);

    if (sceneRef.current) {
      sceneRef.current.performOpeningZoom(() => {
        // Automatically unwrap the 3D Gift Box upon arrival!
        setTimeout(() => {
          if (sceneRef.current) {
            sceneRef.current.openGift(() => {
              setIsGiftOpen(true);
            });
          }
        }, 600);
      });
    }
  }, []);

  // Toggle Gift Unboxing
  const handleToggleGift = useCallback(() => {
    if (!sceneRef.current) return;
    if (isGiftOpen) {
      sceneRef.current.closeGift(() => {
        setIsGiftOpen(false);
      });
    } else {
      sceneRef.current.openGift(() => {
        setIsGiftOpen(true);
      });
    }
  }, [isGiftOpen]);

  // Replay celebration
  const handleReplay = useCallback(() => {
    setHasEntered(false);
    setIsGreetingOpen(false);
    setIsGiftOpen(false);
    soundManager.stopMusic();
    setIsMusicPlaying(false);

    if (sceneRef.current) {
      sceneRef.current.closeGift();
      sceneRef.current.setCameraPreset('cinematic', 0.5);
    }
  }, []);

  // Camera presets
  const handleSelectCameraPreset = useCallback((preset: CameraPreset) => {
    setCurrentCameraPreset(preset);
    if (sceneRef.current) {
      sceneRef.current.setCameraPreset(preset);
    }
  }, []);

  // Fireworks triggers
  const handleLaunchFirework = useCallback(() => {
    if (sceneRef.current) {
      sceneRef.current.launchFirework();
    }
  }, []);

  const handleTriggerBarrage = useCallback(() => {
    if (sceneRef.current) {
      sceneRef.current.triggerBarrage();
    }
  }, []);

  const handleToggleAutoFireworks = useCallback(() => {
    const next = !isAutoFireworks;
    setIsAutoFireworks(next);
    if (sceneRef.current) {
      sceneRef.current.setAutoFireworks(next);
    }
  }, [isAutoFireworks]);

  // Diyas lighting
  const handleLightAllDiyas = useCallback(() => {
    if (sceneRef.current) {
      sceneRef.current.lightAllDiyas();
    }
  }, []);

  const handleExtinguishAllDiyas = useCallback(() => {
    if (sceneRef.current) {
      sceneRef.current.extinguishAllDiyas();
    }
  }, []);

  const handleFocusHeroDiya = useCallback(() => {
    setCurrentCameraPreset('gift');
    if (sceneRef.current) {
      sceneRef.current.focusHeroDiya();
    }
  }, []);

  // Audio controls
  const handleToggleMusic = useCallback(() => {
    const playing = soundManager.toggleMusic();
    setIsMusicPlaying(playing);
  }, []);

  const handleToggleMute = useCallback(() => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  }, []);

  const handleVolumeChange = useCallback((vol: number) => {
    setVolume(vol);
    soundManager.setVolume(vol);
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black select-none">
      {/* 1. Dedicated WebGL Canvas Container */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block cursor-default"
      />

      {/* 2. Top Bar Contract (Visible after entering celebration) */}
      {hasEntered && (
        <header className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between gap-8 px-5 sm:px-8 py-3.5 border-b border-amber-500/20 bg-black/60 backdrop-blur-sm">
          {/* Zone 1: Single text element wordmark in display face */}
          <div className="flex items-center gap-2 whitespace-nowrap shrink-0">
            <Gift className="w-5 h-5 text-amber-400" />
            <span className="font-cinzel text-base sm:text-lg font-bold tracking-wider text-amber-200">
              Special gift from Badrinath R
            </span>
          </div>

          {/* Zone 2: 4 concise single-line nav links */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-amber-200/80">
            <button
              onClick={() => handleSelectCameraPreset('gift')}
              className={`hover:text-amber-100 transition-colors whitespace-nowrap shrink-0 ${
                currentCameraPreset === 'gift' ? 'text-amber-400 font-semibold underline underline-offset-4' : ''
              }`}
            >
              Diwali Gift 🎁
            </button>
            <button
              onClick={() => handleSelectCameraPreset('cinematic')}
              className={`hover:text-amber-100 transition-colors whitespace-nowrap shrink-0 ${
                currentCameraPreset === 'cinematic' ? 'text-amber-400 font-semibold underline underline-offset-4' : ''
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => handleSelectCameraPreset('courtyard')}
              className={`hover:text-amber-100 transition-colors whitespace-nowrap shrink-0 ${
                currentCameraPreset === 'courtyard' ? 'text-amber-400 font-semibold underline underline-offset-4' : ''
              }`}
            >
              Sanctum
            </button>
            <button
              onClick={() => handleSelectCameraPreset('sky')}
              className={`hover:text-amber-100 transition-colors whitespace-nowrap shrink-0 ${
                currentCameraPreset === 'sky' ? 'text-amber-400 font-semibold underline underline-offset-4' : ''
              }`}
            >
              Night Fireworks
            </button>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsGreetingOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-lg shadow-sm transition-all whitespace-nowrap shrink-0"
            >
              <Gift className="w-3.5 h-3.5 text-rose-600" />
              <span>Open Gift Card</span>
            </button>
          </div>
        </header>
      )}

      {/* 3. Subtle In-World Interaction Hint (fades out smoothly) */}
      {hasEntered && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 pointer-events-none px-4 py-1.5 rounded-full bg-black/40 border border-white/10 text-[11px] text-amber-200/70 tracking-wide text-center">
          <Sparkles className="w-3 h-3 inline mr-1 text-amber-400" />
          Click the 3D Gift Box to unwrap it · Click Diyas to light · Click sky for fireworks
        </div>
      )}

      {/* 4. Unified Collapsible Bottom Control Dock */}
      {hasEntered && (
        <ControlDock
          currentPreset={currentCameraPreset}
          onSelectCameraPreset={handleSelectCameraPreset}
          onLaunchFirework={handleLaunchFirework}
          onTriggerBarrage={handleTriggerBarrage}
          onLightAllDiyas={handleLightAllDiyas}
          onExtinguishAllDiyas={handleExtinguishAllDiyas}
          onFocusHeroDiya={handleFocusHeroDiya}
          isAllLit={litCount === totalDiyas && totalDiyas > 0}
          litCount={litCount}
          totalDiyas={totalDiyas}
          isGiftOpen={isGiftOpen}
          onToggleGift={handleToggleGift}
          isMusicPlaying={isMusicPlaying}
          onToggleMusic={handleToggleMusic}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          volume={volume}
          onVolumeChange={handleVolumeChange}
          onOpenGreeting={() => setIsGreetingOpen(true)}
          onReplay={handleReplay}
          isAutoFireworks={isAutoFireworks}
          onToggleAutoFireworks={handleToggleAutoFireworks}
        />
      )}

      {/* 5. Opening Sequence Overlay (Darkness -> Golden Particles -> Enter) */}
      {!hasEntered && (
        <OpeningSequence onEnter={handleEnterCelebration} />
      )}

      {/* 6. Personalized Special Gift Modal from Badrinath */}
      <SpecialGiftModal
        isOpen={isGreetingOpen}
        onClose={() => setIsGreetingOpen(false)}
        onReopenGift={handleToggleGift}
      />
    </div>
  );
}
