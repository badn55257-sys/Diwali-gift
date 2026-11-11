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
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-full max-w-[920px] px-3 pointer-events-none select-none">
      <div className="flex flex-col items-center">
        {/* Collapse / Expand Cinema Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="pointer-events-auto flex items-center gap-1.5 px-3 py-1 rounded-t-lg bg-black/80 hover:bg-black text-[11px] font-medium text-amber-300 border-t border-x border-amber-500/30 transition-all shadow-md"
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
          className={`pointer-events-auto w-full rounded-2xl border border-amber-500/30 bg-black/85 backdrop-blur-md shadow-2xl transition-all duration-300 overflow-hidden ${
            isCollapsed ? 'max-h-0 opacity-0 translate-y-6 pointer-events-none' : 'max-h-60 opacity-100 translate-y-0 p-3 sm:p-4'
          }`}
          style={{
            boxShadow: '0 10px 40px rgba(0,0,0,0.8), 0 0 20px rgba(245, 158, 11, 0.15)',
          }}
        >
          {/* Top Row: Navigation Tabs & Status */}
          <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2.5 mb-3 text-xs">
            {/* Functional Segmented Navigation Tabs */}
            <div className="flex items-center gap-1 p-0.5 bg-neutral-900 rounded-lg border border-white/5">
              <button
                onClick={() => setActiveTab('actions')}
                className={`px-3 py-1 rounded-md font-medium transition-colors whitespace-nowrap ${
                  activeTab === 'actions'
                    ? 'bg-amber-500 text-slate-950 font-semibold'
                    : 'text-amber-200/70 hover:text-amber-100'
                }`}
              >
                Celebration
              </button>
              <button
                onClick={() => setActiveTab('camera')}
                className={`px-3 py-1 rounded-md font-medium transition-colors whitespace-nowrap ${
                  activeTab === 'camera'
                    ? 'bg-amber-500 text-slate-950 font-semibold'
                    : 'text-amber-200/70 hover:text-amber-100'
                }`}
              >
                Camera Views
              </button>
              <button
                onClick={() => setActiveTab('audio')}
                className={`px-3 py-1 rounded-md font-medium transition-colors whitespace-nowrap ${
                  activeTab === 'audio'
                    ? 'bg-amber-500 text-slate-950 font-semibold'
                    : 'text-amber-200/70 hover:text-amber-100'
                }`}
              >
                Audio & Sky
              </button>
            </div>

            {/* Quick Greeting & Fullscreen Action */}
            <div className="flex items-center gap-2">
              {/* Special Gift Card Button */}
              <button
                onClick={onOpenGreeting}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-medium transition-colors"
                title="Special gift from Badrinath R"
              >
                <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
                <span className="hidden sm:inline">Special Gift Card</span>
                <span className="sm:hidden">Gift Card</span>
              </button>

              <button
                onClick={toggleFullscreen}
                className="p-1.5 rounded-lg bg-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-700 transition-colors"
                title="Toggle Fullscreen"
              >
                {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={onReplay}
                className="p-1.5 rounded-lg bg-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-700 transition-colors"
                title="Replay Celebration Opening"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Tab 1: Primary Celebration Actions */}
          {activeTab === 'actions' && (
            <div className="flex flex-wrap items-center justify-between gap-2.5">
              {/* Gift Unboxing & Fireworks Launch Group */}
              <div className="flex items-center gap-2">
                <button
                  onClick={onToggleGift}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 via-amber-500 to-amber-600 text-slate-950 font-bold text-xs hover:brightness-110 shadow-md active:scale-95 transition-all whitespace-nowrap"
                >
                  <Gift className="w-4 h-4 text-slate-950" />
                  <span>{isGiftOpen ? 'Re-wrap Gift' : 'Unwrap 3D Gift'}</span>
                </button>

                <button
                  onClick={onLaunchFirework}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-medium text-xs active:scale-95 transition-all whitespace-nowrap"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Launch Firework</span>
                </button>

                <button
                  onClick={onTriggerBarrage}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium active:scale-95 transition-all whitespace-nowrap"
                  title="Launch 5 fireworks in rapid succession"
                >
                  <span>Barrage</span>
                </button>
              </div>

              {/* Diya Lighting Controls & Live Count */}
              <div className="flex items-center gap-2">
                <div className="text-[11px] text-amber-300/80 font-mono tabular-nums px-2 py-1 rounded bg-neutral-900 border border-white/5">
                  <Flame className="w-3 h-3 inline mr-1 text-amber-400" />
                  {litCount}/{totalDiyas} Diyas Lit
                </div>

                {isAllLit ? (
                  <button
                    onClick={onExtinguishAllDiyas}
                    className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium transition-colors whitespace-nowrap"
                  >
                    Extinguish
                  </button>
                ) : (
                  <button
                    onClick={onLightAllDiyas}
                    className="flex items-center gap-1 px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-medium transition-colors whitespace-nowrap"
                  >
                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                    <span>Light Diyas</span>
                  </button>
                )}

                <button
                  onClick={onFocusHeroDiya}
                  className="flex items-center gap-1 px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-amber-200 text-xs font-medium transition-colors whitespace-nowrap"
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
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-amber-300/70 mr-1 flex items-center gap-1">
                <Camera className="w-3.5 h-3.5" /> Views:
              </span>
              {cameraOptions.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => onSelectCameraPreset(opt.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                    currentPreset === opt.id
                      ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                      : 'bg-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-700'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
              <span className="text-[11px] text-neutral-400 ml-auto hidden md:inline">
                (Click + drag in 3D scene to orbit freely)
              </span>
            </div>
          )}

          {/* Tab 3: Audio & Sky Atmosphere */}
          {activeTab === 'audio' && (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {/* Background Music Toggle */}
                <button
                  onClick={onToggleMusic}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
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
                  className={`p-2 rounded-lg text-xs transition-colors ${
                    isMuted
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      : 'bg-neutral-800 text-neutral-300 hover:text-white'
                  }`}
                  title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>

                {/* Volume Slider */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-neutral-400">Vol</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={volume}
                    onChange={e => onVolumeChange(parseFloat(e.target.value))}
                    className="w-20 accent-amber-500 h-1.5 bg-neutral-700 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              {/* Auto Fireworks Toggle */}
              <button
                onClick={onToggleAutoFireworks}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
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
          <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-amber-300/60">
            <span>Click the 3D Gift Box to unwrap · Click Diyas to light · Click sky for fireworks</span>
            <span className="font-medium text-amber-300/80">
              Special gift from Badrinath R
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
