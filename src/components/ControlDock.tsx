/**
 * Unified Bottom Control Dock for 3D Diwali Celebration.
 * Complies strictly with Three.js skill guidelines:
 * - Unified collapsible horizontal bottom dock (zero viewport occlusion)
 * - Cinema / Zen Mode drawer toggle
 * - Clean static indicators (no pulsing dots)
 * - Single-line controls
 */
import React, { useState } from 'react';
import {
  Sparkles,
  Flame,
  Volume2,
  VolumeX,
  Music,
  Maximize,
  Minimize,
  RotateCcw,
  Heart,
  ChevronDown,
  ChevronUp,
  Camera,
  Eye,
  Gift,
} from 'lucide-react';
import { CameraPreset } from '../scene/diwaliScene';

interface ControlDockProps {
  currentPreset: CameraPreset;
  onSelectCameraPreset: (preset: CameraPreset) => void;
  onLaunchFirework: () => void;
  onTriggerBarrage: () => void;
  onLightAllDiyas: () => void;
  onExtinguishAllDiyas: () => void;
  onFocusHeroDiya: () => void;
  isAllLit: boolean;
  litCount: number;
  totalDiyas: number;
  isGiftOpen: boolean;
  onToggleGift: () => void;
  isMusicPlaying: boolean;
  onToggleMusic: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  volume: number;
  onVolumeChange: (vol: number) => void;
  onOpenGreeting: () => void;
  onReplay: () => void;
  isAutoFireworks: boolean;
  onToggleAutoFireworks: () => void;
}

export const ControlDock: React.FC<ControlDockProps> = ({
  currentPreset,
  onSelectCameraPreset,
  onLaunchFirework,
  onTriggerBarrage,
  onLightAllDiyas,
  onExtinguishAllDiyas,
  onFocusHeroDiya,
  isAllLit,
  litCount,
  totalDiyas,
  isGiftOpen,
  onToggleGift,
  isMusicPlaying,
  onToggleMusic,
  isMuted,
  onToggleMute,
  volume,
  onVolumeChange,
  onOpenGreeting,
  onReplay,
  isAutoFireworks,
  onToggleAutoFireworks,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState<'actions' | 'camera' | 'audio'>('actions');

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const cameraOptions: { id: CameraPreset; label: string }[] = [
    { id: 'cinematic', label: 'Cinematic' },
    { id: 'courtyard', label: 'Courtyard' },
    { id: 'gift', label: 'Diwali Gift 🎁' },
    { id: 'sky', label: 'Sky Fireworks' },
    { id: 'balcony', label: 'Royal Balcony' },
  ];

  return (
    <div className="fixed bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-40 w-full max-w-[920px] px-2 sm:px-3 pointer-events-none select-none">
      <div className="flex flex-col items-center">
        {/* Collapse / Expand Cinema Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="pointer-events-auto flex items-center gap-1.5 px-3 py-1 rounded-t-lg bg-black/85 hover:bg-black text-[10px] sm:text-[11px] font-medium text-amber-300 border-t border-x border-amber-500/30 transition-all shadow-md touch-manipulation"
          title={isCollapsed ? 'Show celebration controls' : 'Cinema Mode (Hide controls)'}
        >
          {isCollapsed ? (
            <>
              <ChevronUp className="w-3.5 h-3.5" />
              <span>Show Controls</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5" />
              <span>Cinema Mode</span>
            </>
          )}
        </button>

        {/* Main Control Strip */}
        <div
          className={`pointer-events-auto w-full rounded-2xl border border-amber-500/30 bg-black/90 backdrop-blur-md shadow-2xl transition-all duration-300 overflow-hidden ${
            isCollapsed ? 'max-h-0 opacity-0 translate-y-6 pointer-events-none' : 'max-h-96 sm:max-h-64 opacity-100 translate-y-0 p-2.5 sm:p-4'
          }`}
          style={{
            boxShadow: '0 10px 40px rgba(0,0,0,0.8), 0 0 20px rgba(245, 158, 11, 0.15)',
          }}
        >
          {/* Top Row: Navigation Tabs & Status */}
          <div className="flex items-center justify-between gap-1.5 sm:gap-2 border-b border-white/10 pb-2 mb-2.5 text-xs">
            {/* Functional Segmented Navigation Tabs */}
            <div className="flex items-center gap-0.5 sm:gap-1 p-0.5 bg-neutral-900 rounded-lg border border-white/5">
              <button
                onClick={() => setActiveTab('actions')}
                className={`px-2.5 sm:px-3 py-1 rounded-md text-[11px] sm:text-xs font-medium transition-colors whitespace-nowrap touch-manipulation ${
                  activeTab === 'actions'
                    ? 'bg-amber-500 text-slate-950 font-semibold'
                    : 'text-amber-200/70 hover:text-amber-100'
                }`}
              >
                Celebration
              </button>
              <button
                onClick={() => setActiveTab('camera')}
                className={`px-2.5 sm:px-3 py-1 rounded-md text-[11px] sm:text-xs font-medium transition-colors whitespace-nowrap touch-manipulation ${
                  activeTab === 'camera'
                    ? 'bg-amber-500 text-slate-950 font-semibold'
                    : 'text-amber-200/70 hover:text-amber-100'
                }`}
              >
                Views
              </button>
              <button
                onClick={() => setActiveTab('audio')}
                className={`px-2.5 sm:px-3 py-1 rounded-md text-[11px] sm:text-xs font-medium transition-colors whitespace-nowrap touch-manipulation ${
                  activeTab === 'audio'
                    ? 'bg-amber-500 text-slate-950 font-semibold'
                    : 'text-amber-200/70 hover:text-amber-100'
                }`}
              >
                Audio
              </button>
            </div>

            {/* Quick Greeting & Fullscreen Action */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Special Gift Card Button */}
              <button
                onClick={onOpenGreeting}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-[11px] sm:text-xs font-medium transition-colors touch-manipulation"
                title="Special gift from Badrinath R"
              >
                <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
                <span className="hidden sm:inline">Special Gift Card</span>
                <span className="sm:hidden">Gift</span>
              </button>

              <button
                onClick={toggleFullscreen}
                className="p-1.5 rounded-lg bg-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-700 transition-colors touch-manipulation"
                title="Toggle Fullscreen"
              >
                {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={onReplay}
                className="p-1.5 rounded-lg bg-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-700 transition-colors touch-manipulation"
                title="Replay Celebration Opening"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Tab 1: Primary Celebration Actions */}
          {activeTab === 'actions' && (
            <div className="flex flex-wrap items-center justify-between gap-2">
              {/* Gift Unboxing & Fireworks Launch Group */}
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <button
                  onClick={onToggleGift}
                  className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-rose-500 via-amber-500 to-amber-600 text-slate-950 font-bold text-[11px] sm:text-xs hover:brightness-110 shadow-md active:scale-95 transition-all whitespace-nowrap touch-manipulation"
                >
                  <Gift className="w-3.5 h-3.5 text-slate-950" />
                  <span>{isGiftOpen ? 'Re-wrap Gift' : 'Unwrap 3D Gift'}</span>
                </button>

                <button
                  onClick={onLaunchFirework}
                  className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-medium text-[11px] sm:text-xs active:scale-95 transition-all whitespace-nowrap touch-manipulation"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Launch Firework</span>
                </button>

                <button
                  onClick={onTriggerBarrage}
                  className="hidden md:flex items-center gap-1 px-3 py-1.5 sm:py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium active:scale-95 transition-all whitespace-nowrap touch-manipulation"
                  title="Launch 5 fireworks in rapid succession"
                >
                  <span>Barrage</span>
                </button>
              </div>

              {/* Diya Lighting Controls & Live Count */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="text-[10px] sm:text-[11px] text-amber-300/80 font-mono tabular-nums px-2 py-1 rounded bg-neutral-900 border border-white/5 whitespace-nowrap">
                  <Flame className="w-3 h-3 inline mr-1 text-amber-400" />
                  {litCount}/{totalDiyas} Lit
                </div>

                {isAllLit ? (
                  <button
                    onClick={onExtinguishAllDiyas}
                    className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[11px] sm:text-xs font-medium transition-colors whitespace-nowrap touch-manipulation"
                  >
                    Extinguish
                  </button>
                ) : (
                  <button
                    onClick={onLightAllDiyas}
                    className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] sm:text-xs font-medium transition-colors whitespace-nowrap touch-manipulation"
                  >
                    <Flame className="w-3 h-3 text-amber-400" />
                    <span>Light Diyas</span>
                  </button>
                )}

                <button
                  onClick={onFocusHeroDiya}
                  className="hidden sm:flex items-center gap-1 px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-amber-200 text-xs font-medium transition-colors whitespace-nowrap touch-manipulation"
                  title="Focus camera on center hero gift & diya"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect Gift</span>
                </button>
              </div>
            </div>
          )}

          {/* Tab 2: Camera Presets */}
          {activeTab === 'camera' && (
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="text-[11px] sm:text-xs text-amber-300/70 mr-1 flex items-center gap-1">
                <Camera className="w-3.5 h-3.5" /> Views:
              </span>
              {cameraOptions.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => onSelectCameraPreset(opt.id)}
                  className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-medium transition-all whitespace-nowrap touch-manipulation ${
                    currentPreset === opt.id
                      ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                      : 'bg-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-700'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
              <span className="text-[10px] sm:text-[11px] text-neutral-400 ml-auto hidden md:inline">
                (Click + drag or swipe to orbit freely)
              </span>
            </div>
          )}

          {/* Tab 3: Audio & Sky Atmosphere */}
          {activeTab === 'audio' && (
            <div className="flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                {/* Background Music Toggle */}
                <button
                  onClick={onToggleMusic}
                  className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-medium transition-colors touch-manipulation ${
                    isMusicPlaying
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  <Music className="w-3.5 h-3.5" />
                  <span>{isMusicPlaying ? 'Music: Playing' : 'Music: Paused'}</span>
                </button>

                {/* Mute SFX Toggle */}
                <button
                  onClick={onToggleMute}
                  className={`p-1.5 sm:p-2 rounded-lg text-xs transition-colors touch-manipulation ${
                    isMuted
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      : 'bg-neutral-800 text-neutral-300 hover:text-white'
                  }`}
                  title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>

                {/* Volume Slider */}
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="text-[10px] sm:text-[11px] text-neutral-400">Vol</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={volume}
                    onChange={e => onVolumeChange(parseFloat(e.target.value))}
                    className="w-16 sm:w-20 accent-amber-500 h-1.5 bg-neutral-700 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              {/* Auto Fireworks Toggle */}
              <button
                onClick={onToggleAutoFireworks}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-medium transition-colors touch-manipulation ${
                  isAutoFireworks
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                Auto Fireworks: {isAutoFireworks ? 'On' : 'Off'}
              </button>
            </div>
          )}

          {/* Footer Signature */}
          <div className="mt-2 pt-1.5 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-[10px] sm:text-[11px] text-amber-300/60 gap-1 text-center sm:text-left">
            <span>Tap 3D Gift Box to unwrap · Tap Diyas to light · Tap sky for fireworks</span>
            <span className="font-medium text-amber-300/90 whitespace-nowrap">
              Special gift from Badrinath R
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
