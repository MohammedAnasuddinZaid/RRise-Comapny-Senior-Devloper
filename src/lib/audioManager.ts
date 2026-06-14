export type SoundType = 'click' | 'success' | 'evolve' | 'idle' | 'level_up' | 'parrot_one_word';

class AudioManager {
  private audioContext: AudioContext | null = null;
  private sounds: Map<SoundType, HTMLAudioElement> = new Map();
  private idleTimeout: NodeJS.Timeout | null = null;
  private isIdlePlaying: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.loadSounds();
    }
  }

  private loadSounds() {
    const soundPaths: Record<SoundType, string> = {
      click: '/sounds/click.mp3',
      success: '/sounds/success.mp3',
      evolve: '/sounds/parrot_evolving.mp3',
      idle: '/sounds/parrot_when_idel_signing.mp3',
      level_up: '/sounds/level_up.mp3',
      parrot_one_word: '/sounds/parrot_one_word.mp3'
    };

    Object.entries(soundPaths).forEach(([type, path]) => {
      const audio = new Audio(path);
      audio.preload = 'auto';
      this.sounds.set(type as SoundType, audio);
    });
  }

  play(sound: SoundType) {
    if (typeof window === 'undefined') return;
    
    const audio = this.sounds.get(sound);
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(console.error);
    }
  }

  startIdleDetection(callback: () => void) {
    this.resetIdleTimer(callback);
    
    if (typeof window !== 'undefined') {
      const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
      events.forEach(event => {
        window.addEventListener(event, () => this.resetIdleTimer(callback));
      });
    }
  }

  private resetIdleTimer(callback: () => void) {
    if (this.idleTimeout) {
      clearTimeout(this.idleTimeout);
    }
    
    if (this.isIdlePlaying) {
      this.stopIdle();
    }

    this.idleTimeout = setTimeout(() => {
      this.play('idle');
      this.isIdlePlaying = true;
      callback();
    }, 5000);
  }

  private stopIdle() {
    const idleAudio = this.sounds.get('idle');
    if (idleAudio) {
      idleAudio.pause();
      idleAudio.currentTime = 0;
    }
    this.isIdlePlaying = false;
  }

  cleanup() {
    if (this.idleTimeout) {
      clearTimeout(this.idleTimeout);
    }
    this.sounds.forEach(audio => {
      audio.pause();
      audio.src = '';
    });
  }
}

export const audioManager = new AudioManager();
