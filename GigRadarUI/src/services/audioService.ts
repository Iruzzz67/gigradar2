import { AudioTrack, Artist } from '../types';

export interface AudioPlayerState {
  currentTrack: AudioTrack | null;
  currentArtist: Artist | null;
  isPlaying: boolean;
  progress: number; // 0 - 100
  currentTime: number;
  duration: number;
  isMuted: boolean;
  volume: number;
  isSynthesizing: boolean;
  autoplayNotice: string | null;
}

type Listener = (state: AudioPlayerState) => void;

class AudioService {
  private currentTrack: AudioTrack | null = null;
  private currentArtist: Artist | null = null;
  private isPlaying: boolean = false;
  private progress: number = 0;
  private currentTime: number = 0;
  private duration: number = 30;
  private isMuted: boolean = false;
  private volume: number = 0.8;
  private isSynthesizing: boolean = false;
  private autoplayNotice: string | null = null;

  private audioElement: HTMLAudioElement | null = null;
  private audioContext: AudioContext | null = null;
  private synthInterval: any = null;
  private synthGainNode: GainNode | null = null;
  private progressInterval: any = null;
  private listeners: Set<Listener> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      this.initAudioElement();
    }
  }

  private initAudioElement() {
    this.audioElement = new Audio();
    this.audioElement.preload = 'auto';

    this.audioElement.addEventListener('loadedmetadata', () => {
      if (this.audioElement && this.audioElement.duration && !this.isSynthesizing) {
        this.duration = this.audioElement.duration;
        this.notify();
      }
    });

    this.audioElement.addEventListener('timeupdate', () => {
      if (this.audioElement && this.audioElement.duration && !this.isSynthesizing) {
        this.currentTime = this.audioElement.currentTime;
        this.duration = this.audioElement.duration || 30;
        this.progress = (this.currentTime / this.duration) * 100;
        this.notify();
      }
    });

    this.audioElement.addEventListener('ended', () => {
      this.isPlaying = false;
      this.progress = 0;
      this.currentTime = 0;
      this.notify();
    });

    this.audioElement.addEventListener('error', () => {
      // Remote audio failed or blocked, fallback smoothly to Web Audio synthesizer
      if (this.isPlaying && this.currentTrack) {
        this.startSynthPreview(this.currentTrack);
      }
    });
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => this.listeners.delete(listener);
  }

  private notify() {
    const state = this.getState();
    this.listeners.forEach((listener) => {
      try {
        listener(state);
      } catch (e) {
        console.error('Audio listener error:', e);
      }
    });
  }

  public getState(): AudioPlayerState {
    return {
      currentTrack: this.currentTrack,
      currentArtist: this.currentArtist,
      isPlaying: this.isPlaying,
      progress: this.progress,
      currentTime: Math.round(this.currentTime),
      duration: Math.round(this.duration),
      isMuted: this.isMuted,
      volume: this.volume,
      isSynthesizing: this.isSynthesizing,
      autoplayNotice: this.autoplayNotice,
    };
  }

  public play(track: AudioTrack, artist: Artist, isAutoPlay: boolean = false): void {
    if (this.currentTrack?.trackId === track.trackId && this.isPlaying) {
      return;
    }

    this.stopSynth();
    this.currentTrack = track;
    this.currentArtist = artist;
    this.progress = 0;
    this.currentTime = 0;
    this.duration = track.durationSeconds || 30;
    this.isPlaying = true;
    this.autoplayNotice = isAutoPlay ? `Memutar lagu hype ${artist.name}: "${track.title}"` : null;

    if (this.audioElement && track.audioUrl && (track.audioUrl.startsWith('http') || track.audioUrl.startsWith('/') || track.audioUrl.startsWith('.'))) {
      try {
        this.audioElement.src = track.audioUrl;
        this.audioElement.volume = this.isMuted ? 0 : this.volume;
        const playPromise = this.audioElement.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              this.isSynthesizing = false;
              this.notify();
            })
            .catch(() => {
              // Autoplay policy or CORS error -> use Web Audio Synth
              this.startSynthPreview(track);
            });
        }
      } catch {
        this.startSynthPreview(track);
      }
    } else {
      this.startSynthPreview(track);
    }

    this.notify();
  }

  public togglePlay(): void {
    if (!this.currentTrack) return;
    if (this.isPlaying) {
      this.pause();
    } else {
      this.resume();
    }
  }

  public pause(): void {
    this.isPlaying = false;
    if (this.audioElement && !this.isSynthesizing) {
      this.audioElement.pause();
    }
    this.stopSynth();
    this.notify();
  }

  public resume(): void {
    if (!this.currentTrack || !this.currentArtist) return;
    this.isPlaying = true;

    if (this.isSynthesizing) {
      this.startSynthPreview(this.currentTrack);
    } else if (this.audioElement && this.audioElement.src) {
      this.audioElement
        .play()
        .then(() => {
          this.notify();
        })
        .catch(() => {
          this.startSynthPreview(this.currentTrack!);
        });
    } else {
      this.startSynthPreview(this.currentTrack);
    }
    this.notify();
  }

  public stop(): void {
    this.isPlaying = false;
    this.currentTrack = null;
    this.currentArtist = null;
    this.progress = 0;
    this.currentTime = 0;
    this.autoplayNotice = null;
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
    }
    this.stopSynth();
    this.notify();
  }

  public seek(percent: number): void {
    const targetPercent = Math.max(0, Math.min(100, percent));
    this.progress = targetPercent;
    this.currentTime = (targetPercent / 100) * this.duration;

    if (this.audioElement && !this.isSynthesizing && this.audioElement.duration) {
      this.audioElement.currentTime = this.currentTime;
    }
    this.notify();
  }

  public toggleMute(): void {
    this.isMuted = !this.isMuted;
    if (this.audioElement) {
      this.audioElement.volume = this.isMuted ? 0 : this.volume;
    }
    if (this.synthGainNode && this.audioContext) {
      this.synthGainNode.gain.setValueAtTime(this.isMuted ? 0 : this.volume * 0.15, this.audioContext.currentTime);
    }
    this.notify();
  }

  public setVolume(vol: number): void {
    this.volume = Math.max(0, Math.min(1, vol));
    this.isMuted = this.volume === 0;
    if (this.audioElement) {
      this.audioElement.volume = this.isMuted ? 0 : this.volume;
    }
    if (this.synthGainNode && this.audioContext) {
      this.synthGainNode.gain.setValueAtTime(this.isMuted ? 0 : this.volume * 0.15, this.audioContext.currentTime);
    }
    this.notify();
  }

  // --- Real Web Audio Synthesizer (Indie / Skena Music Engine) ---
  private startSynthPreview(track: AudioTrack) {
    this.stopSynth();
    this.isSynthesizing = true;
    this.isPlaying = true;

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!this.audioContext || this.audioContext.state === 'closed') {
        this.audioContext = new AudioCtx();
      }
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }

      this.synthGainNode = this.audioContext.createGain();
      this.synthGainNode.gain.setValueAtTime(
        this.isMuted ? 0 : this.volume * 0.15,
        this.audioContext.currentTime
      );
      this.synthGainNode.connect(this.audioContext.destination);

      // Genre-based chord progression:
      // Rock/Punk (Dongker, Jeblogs, FSTVLST): A minor - F - C - G
      // Indie Pop/Folk (Bernadya, Lomba Sihir): C - Am - F - G
      const isIndiePop =
        track.genre.toLowerCase().includes('pop') || track.genre.toLowerCase().includes('folk');
      const chordProgressions = isIndiePop
        ? [
            [261.63, 329.63, 392.0], // C
            [220.0, 261.63, 329.63], // Am
            [174.61, 220.0, 261.63], // F
            [196.0, 246.94, 293.66], // G
          ]
        : [
            [220.0, 261.63, 329.63], // Am
            [174.61, 220.0, 261.63], // F
            [261.63, 329.63, 392.0], // C
            [196.0, 246.94, 293.66], // G
          ];

      let beat = 0;
      const bpm = isIndiePop ? 110 : 138;
      const intervalMs = (60 / bpm / 2) * 1000; // Eighth notes

      this.synthInterval = setInterval(() => {
        if (!this.isPlaying || !this.audioContext || this.audioContext.state === 'closed') {
          return;
        }

        const chordIdx = Math.floor(beat / 8) % chordProgressions.length;
        const currentChord = chordProgressions[chordIdx];
        const stepInMeasure = beat % 8;
        const now = this.audioContext.currentTime;

        // 1. Drum Beat: Kick on 0, 4. Snare on 2, 6. Hi-hat every 8th note.
        if (stepInMeasure === 0 || stepInMeasure === 4) {
          this.triggerKick(now);
        } else if (stepInMeasure === 2 || stepInMeasure === 6) {
          this.triggerSnare(now);
        }
        this.triggerHiHat(now);

        // 2. Bassline
        const rootFreq = currentChord[0] / 2;
        if (stepInMeasure === 0 || stepInMeasure === 3 || stepInMeasure === 4 || stepInMeasure === 6) {
          this.triggerBass(rootFreq, now);
        }

        // 3. Guitar / Synth Harmony
        const noteFreq = currentChord[stepInMeasure % currentChord.length];
        this.triggerGuitar(noteFreq, now, isIndiePop);

        beat++;
      }, intervalMs);

      // Track progress timer
      this.progressInterval = setInterval(() => {
        if (this.isPlaying) {
          this.currentTime += 0.25;
          this.progress = (this.currentTime / this.duration) * 100;
          if (this.currentTime >= this.duration) {
            this.currentTime = 0;
            this.progress = 0;
          }
          this.notify();
        }
      }, 250);
    } catch (e) {
      console.warn('Web Audio Synth failed:', e);
    }
  }

  private triggerKick(time: number) {
    if (!this.audioContext || !this.synthGainNode) return;
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.frequency.setValueAtTime(130, time);
    osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.25);

    gain.gain.setValueAtTime(1, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.25);

    osc.connect(gain);
    gain.connect(this.synthGainNode);

    osc.start(time);
    osc.stop(time + 0.25);
  }

  private triggerSnare(time: number) {
    if (!this.audioContext || !this.synthGainNode) return;
    const noiseBuffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.15, this.audioContext.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseBuffer.length; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.audioContext.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 1000;

    const gain = this.audioContext.createGain();
    gain.gain.setValueAtTime(0.4, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.15);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.synthGainNode);

    whiteNoise.start(time);
    whiteNoise.stop(time + 0.15);
  }

  private triggerHiHat(time: number) {
    if (!this.audioContext || !this.synthGainNode) return;
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(8000, time);

    gain.gain.setValueAtTime(0.06, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);

    osc.connect(gain);
    gain.connect(this.synthGainNode);

    osc.start(time);
    osc.stop(time + 0.05);
  }

  private triggerBass(freq: number, time: number) {
    if (!this.audioContext || !this.synthGainNode) return;
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(0.35, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.3);

    osc.connect(gain);
    gain.connect(this.synthGainNode);

    osc.start(time);
    osc.stop(time + 0.3);
  }

  private triggerGuitar(freq: number, time: number, isClean: boolean) {
    if (!this.audioContext || !this.synthGainNode) return;
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.type = isClean ? 'triangle' : 'sawtooth';
    osc.frequency.setValueAtTime(freq, time);

    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(isClean ? 1800 : 3200, time);

    gain.gain.setValueAtTime(0.2, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.25);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.synthGainNode);

    osc.start(time);
    osc.stop(time + 0.25);
  }

  private stopSynth() {
    if (this.synthInterval) {
      clearInterval(this.synthInterval);
      this.synthInterval = null;
    }
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
    this.isSynthesizing = false;
  }
}

export const audioService = new AudioService();
