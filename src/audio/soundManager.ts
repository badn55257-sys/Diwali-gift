/**
 * Web Audio API Sound Synthesizer for Diwali Celebration.
 * Completely zero external dependencies/404s.
 * Synthesizes:
 * - Indian classical festive ambient music (tanpura drone, sitar harmonics, bansuri flute tones, temple chimes)
 * - Firework launch whoosh, explosive boom, and crackling spark bursts
 * - Diya ignition warm flame chime
 * - Temple bells
 */

class SoundManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;

  private isMusicPlaying = false;
  private isMuted = false;
  private musicVolume = 0.5;
  private sfxVolume = 0.7;

  private musicInterval: number | null = null;
  private droneOscs: OscillatorNode[] = [];

  constructor() {
    // Initialized on first user interaction
  }

  private initContext() {
    if (this.ctx) return;
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      this.ctx = new AudioContextClass();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 1, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);
    } catch {
      // AudioContext unavailable or restricted
    }
  }

  public async resumeContext() {
    this.initContext();
    if (this.ctx && this.ctx.state === 'suspended') {
      try {
        await this.ctx.resume();
      } catch {
        // Safe ignore for mobile restriction
      }
    }
  }

  /**
   * Starts synthesizing continuous Indian classical ambient festive melody
   * Based on Raag Yaman / Bhupali (deeply celebratory, uplifting Diwali mood)
   */
  public startMusic() {
    this.resumeContext();
    if (!this.ctx || !this.musicGain || this.isMusicPlaying) return;
    this.isMusicPlaying = true;

    // 1. Tanpura continuous meditative drone (Sa - Pa - Sa octave: C#3, G#3, C#4)
    const baseFreq = 138.59; // C#3
    const droneFreqs = [baseFreq, baseFreq * 1.4983, baseFreq * 2]; // Sa, Pa, Sa

    droneFreqs.forEach((freq, idx) => {
      if (!this.ctx || !this.musicGain) return;
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = idx === 1 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      // Subtle rich chorus vibrato
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(0.2 + idx * 0.1, this.ctx.currentTime);
      lfoGain.gain.setValueAtTime(0.8, this.ctx.currentTime);
      lfo.connect(osc.frequency);
      lfo.start();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600 + idx * 200, this.ctx.currentTime);

      oscGain.gain.setValueAtTime(0.08 / (idx + 1), this.ctx.currentTime);

      osc.connect(filter);
      filter.connect(oscGain);
      oscGain.connect(this.musicGain);

      osc.start();
      this.droneOscs.push(osc);
    });

    // 2. Synthesize periodic Indian flute / sitar melody phrases
    // Notes of Raag Bhupali (Pentatonic Major: Sa, Re, Ga, Pa, Dha, Sa')
    // C#, D#, F, G#, A#, C#'
    const scale = [277.18, 311.13, 349.23, 415.30, 466.16, 554.37, 622.25, 698.46];

    let step = 0;
    const playMelodyNote = () => {
      if (!this.isMusicPlaying || !this.ctx || !this.musicGain) return;

      const patterns = [
        [0, 1, 2, 4, 3, 2, 1, 0],
        [2, 3, 4, 5, 4, 3, 2],
        [5, 4, 3, 2, 1, 2, 0],
        [0, 2, 3, 4, 5, 7, 5, 4, 2, 0]
      ];
      const currentPattern = patterns[Math.floor(step / 8) % patterns.length];
      const noteIdx = currentPattern[step % currentPattern.length];
      const freq = scale[noteIdx % scale.length];

      this.playFluteTone(freq, 1.2 + Math.random() * 0.8);

      // Occasionally add sparkling temple chime
      if (Math.random() > 0.6) {
        this.playTempleBell(scale[4 + Math.floor(Math.random() * 3)] * 2, 0.15);
      }

      step++;
      const nextDelay = (1.2 + Math.random() * 0.9) * 1000;
      this.musicInterval = window.setTimeout(playMelodyNote, nextDelay);
    };

    this.musicInterval = window.setTimeout(playMelodyNote, 800);
  }

  public stopMusic() {
    this.isMusicPlaying = false;
    if (this.musicInterval) {
      clearTimeout(this.musicInterval);
      this.musicInterval = null;
    }
    this.droneOscs.forEach(osc => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {
        // ignore
      }
    });
    this.droneOscs = [];
  }

  public toggleMusic(): boolean {
    if (this.isMusicPlaying) {
      this.stopMusic();
      return false;
    } else {
      this.startMusic();
      return true;
    }
  }

  public getIsMusicPlaying(): boolean {
    return this.isMusicPlaying;
  }

  /**
   * Synthesizes soft, soulful Indian flute tone with breath vibrato
   */
  private playFluteTone(freq: number, duration: number) {
    if (!this.ctx || !this.musicGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);

    // Subtle breath vibrato
    const vibrato = this.ctx.createOscillator();
    const vibGain = this.ctx.createGain();
    vibrato.frequency.setValueAtTime(5.2, now);
    vibGain.gain.setValueAtTime(freq * 0.015, now);
    vibrato.connect(osc.frequency);
    vibrato.start(now);
    vibrato.stop(now + duration);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(freq * 2.5, now);

    // Gentle swell and breath release
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.12, now + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.08, now + duration * 0.7);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGain);

    osc.start(now);
    osc.stop(now + duration);
  }

  /**
   * Temple brass bell sound
   */
  public playTempleBell(freq = 1108, volume = 0.3) {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const now = this.ctx.currentTime;

    const partials = [1, 2.76, 4.07, 6.4];
    const decays = [2.5, 1.8, 1.2, 0.7];

    partials.forEach((p, i) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq * p, now);

      gain.gain.setValueAtTime(volume * (1 / (i + 1.2)), now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + decays[i]);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + decays[i]);
    });
  }

  /**
   * Realistic Firework Launch Sound (Whoosh upward)
   */
  public playFireworkLaunch() {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const now = this.ctx.currentTime;
    const duration = 0.8;

    // Filtered noise with rising pitch
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(250, now);
    filter.frequency.exponentialRampToValueAtTime(1200, now + duration);
    filter.Q.setValueAtTime(3.0, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.18, now + duration * 0.4);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start(now);
  }

  /**
   * Realistic Firework Detonation Boom & Crackle
   */
  public playFireworkExplosion(isLarge = true) {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const now = this.ctx.currentTime;

    // 1. Low frequency bass thud (80Hz dropping to 30Hz)
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(isLarge ? 95 : 120, now);
    osc.frequency.exponentialRampToValueAtTime(28, now + 0.6);

    oscGain.gain.setValueAtTime(isLarge ? 0.45 : 0.28, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + (isLarge ? 1.2 : 0.8));

    osc.connect(oscGain);
    oscGain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 1.2);

    // 2. High impact burst noise
    const burstDuration = isLarge ? 0.7 : 0.4;
    const bufSize = this.ctx.sampleRate * burstDuration;
    const buffer = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.12));
    }

    const burstSource = this.ctx.createBufferSource();
    burstSource.buffer = buffer;

    const burstFilter = this.ctx.createBiquadFilter();
    burstFilter.type = 'lowpass';
    burstFilter.frequency.setValueAtTime(650, now);

    const burstGain = this.ctx.createGain();
    burstGain.gain.setValueAtTime(0.35, now);
    burstGain.gain.exponentialRampToValueAtTime(0.001, now + burstDuration);

    burstSource.connect(burstFilter);
    burstFilter.connect(burstGain);
    burstGain.connect(this.sfxGain);
    burstSource.start(now);

    // 3. Crackling sparkle tails
    const crackleDelay = 0.25;
    const crackleCount = isLarge ? 7 : 4;
    for (let c = 0; c < crackleCount; c++) {
      const crackleTime = now + crackleDelay + Math.random() * 0.6;
      const cOsc = this.ctx.createOscillator();
      const cGain = this.ctx.createGain();
      cOsc.type = 'square';
      cOsc.frequency.setValueAtTime(1400 + Math.random() * 1800, crackleTime);

      cGain.gain.setValueAtTime(0.08, crackleTime);
      cGain.gain.exponentialRampToValueAtTime(0.0001, crackleTime + 0.04);

      cOsc.connect(cGain);
      cGain.connect(this.sfxGain);
      cOsc.start(crackleTime);
      cOsc.stop(crackleTime + 0.05);
    }
  }

  /**
   * Sound effect when clicking or lighting a Diya
   */
  public playDiyaLight() {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const now = this.ctx.currentTime;

    // Magical golden sparkle harmonic chime
    const freqs = [587.33, 880.0, 1174.66, 1760.0]; // D5, A5, D6, A6
    freqs.forEach((f, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now + idx * 0.05);

      gain.gain.setValueAtTime(0.15 / (idx + 1), now + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.05 + 1.2);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 1.2);
    });

    // Subtle warm ignition whoosh
    const duration = 0.3;
    const bufSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(400, now);
    filter.Q.setValueAtTime(1.5, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    noise.start(now);
  }

  /**
   * Sound effect when unwrapping the Diwali Gift Box ribbon
   */
  public playGiftUnwrap() {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const now = this.ctx.currentTime;
    const duration = 0.6;

    // Ribbon rustle noise sweep
    const bufSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufSize) * Math.PI);
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(600, now);
    filter.frequency.exponentialRampToValueAtTime(3200, now + duration);
    filter.Q.setValueAtTime(2.0, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.2, now + duration * 0.4);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    noise.start(now);
  }

  /**
   * Triumphant royal fanfare & golden sparkle chord when the gift box opens
   */
  public playGiftRevealFanfare() {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const now = this.ctx.currentTime;

    // Major golden arpeggio chord: C4, E4, G4, C5, E5, G5
    const chord = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];

    chord.forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = idx % 2 === 0 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      const startTime = now + idx * 0.08;
      const duration = 1.8;

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(0.2 / Math.sqrt(idx + 1), startTime + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(startTime);
      osc.stop(startTime + duration);
    });

    // Golden temple bell chime
    this.playTempleBell(1318, 0.4);
  }

  public setVolume(vol: number) {
    this.musicVolume = vol;
    this.sfxVolume = vol;
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setValueAtTime(vol, this.ctx.currentTime);
    }
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setValueAtTime(vol, this.ctx.currentTime);
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 1, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }
}

export const soundManager = new SoundManager();
