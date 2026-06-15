export type SoundType = 'click' | 'success' | 'evolve' | 'idle' | 'level_up' | 'parrot_one_word';

class AudioManager {
  private audioContext: AudioContext | null = null;
  private sounds: Map<SoundType, HTMLAudioElement> = new Map();
  private idleTimeout: NodeJS.Timeout | null = null;
  private isIdlePlaying: boolean = false;
  private initialized: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.loadSounds();
    }
  }

  private async loadSounds() {
    const soundPaths: Record<SoundType, string> = {
      click: '/sounds/click.mp3',
      success: '/sounds/success.mp3',
      evolve: '/sounds/parrot_evolving.mp3',
      idle: '/sounds/parrot_when_idel_signing.mp3',
      level_up: '/sounds/level_up.mp3',
      parrot_one_word: '/sounds/parrot_one_word.mp3'
    };

    for (const [type, path] of Object.entries(soundPaths)) {
      try {
        const audio = new Audio(path);
        audio.preload = 'auto';
        
        await new Promise<void>((resolve, reject) => {
          audio.addEventListener('canplaythrough', () => {
            console.log(`Audio ${type} loaded successfully from ${path}`);
            resolve();
          }, { once: true });
          
          audio.addEventListener('error', (e) => {
            console.error(`Failed to load audio ${type} from ${path}:`, e);
            reject(e);
          }, { once: true });
          
          // Set a timeout in case the audio doesn't load
          setTimeout(() => {
            if (audio.readyState >= 2) {
              resolve();
            } else {
              console.warn(`Audio ${type} loading timeout, using anyway`);
              resolve();
            }
          }, 3000);
        });
        
        this.sounds.set(type as SoundType, audio);
      } catch (error) {
        console.error(`Error loading audio ${type}:`, error);
      }
    }
    
    this.initialized = true;
  }

  async play(sound: SoundType) {
    if (typeof window === 'undefined') return;
    
    // Ensure audio context is initialized and resumed
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    if (this.audioContext.state === 'suspended') {
      try {
        await this.audioContext.resume();
      } catch (e) {
        console.error('Failed to resume audio context:', e);
      }
    }
    
    const audio = this.sounds.get(sound);
    if (audio) {
      try {
        audio.currentTime = 0;
        await audio.play();
      } catch (err) {
        console.error(`Failed to play sound ${sound}:`, err);
      }
    } else {
      console.error(`Sound ${sound} not found`);
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
