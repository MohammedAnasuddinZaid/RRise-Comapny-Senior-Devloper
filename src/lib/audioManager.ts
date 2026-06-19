/**
 * Sound Configuration
 * Centralized sound paths for easy maintenance
 * All sounds are stored in /public/sounds/
 */
const SOUND_PATHS: Record<SoundType, string> = {
  click: '/sounds/click.mp3',
  success: '/sounds/success.mp3',
  evolve: '/sounds/parrot_evolving.mp3',
  idle: '/sounds/parrot_when_idle_signing.mp3',
  level_up: '/sounds/level_up.mp3',
  parrot_one_word: '/sounds/parrot_one_word.mp3'
};

export type SoundType = 'click' | 'success' | 'evolve' | 'idle' | 'level_up' | 'parrot_one_word';

/**
 * AudioManager - Handles all audio playback in RRise
 * 
 * Fixed issues:
 * - Lazy loads sounds on first play instead of in constructor
 * - Uses absolute paths from /public/sounds/
 * - Ensures AudioContext is created after user interaction
 * - Better error handling and fallback behavior
 * - Works correctly on first load and after refresh
 */
class AudioManager {
  private audioContext: AudioContext | null = null;
  private sounds: Map<SoundType, HTMLAudioElement> = new Map();
  private idleTimeout: NodeJS.Timeout | null = null;
  private isIdlePlaying: boolean = false;
  private loadingSounds: Map<SoundType, Promise<HTMLAudioElement>> = new Map();

  constructor() {
    // Don't load sounds in constructor - lazy load on first play
    // This fixes the "source not found" issue on first load
  }

  /**
   * Initialize AudioContext (must be called after user interaction)
   * Browsers require user interaction before AudioContext can be created
   */
  private initAudioContext() {
    if (!this.audioContext && typeof window !== 'undefined') {
      try {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (e) {
        console.error('Failed to create AudioContext:', e);
      }
    }
    return this.audioContext;
  }

  /**
   * Resume AudioContext if suspended
   * Browsers suspend AudioContext until user interaction
   */
  private async resumeAudioContext() {
    const ctx = this.initAudioContext();
    if (ctx && ctx.state === 'suspended') {
      try {
        await ctx.resume();
      } catch (e) {
        console.error('Failed to resume AudioContext:', e);
      }
    }
  }

  /**
   * Load a single sound on demand
   * This lazy loading approach fixes the first-load issue
   */
  private async loadSound(type: SoundType): Promise<HTMLAudioElement> {
    // Return existing sound if already loaded
    const existing = this.sounds.get(type);
    if (existing) {
      return existing;
    }

    // Return existing promise if already loading
    const existingPromise = this.loadingSounds.get(type);
    if (existingPromise) {
      return existingPromise;
    }

    // Load the sound
    const path = SOUND_PATHS[type];
    const loadPromise = new Promise<HTMLAudioElement>((resolve, reject) => {
      if (typeof window === 'undefined') {
        reject(new Error('Not running in browser'));
        return;
      }

      const audio = new Audio(path);
      audio.preload = 'auto';

      audio.addEventListener('canplaythrough', () => {
        console.log(`Audio ${type} loaded successfully from ${path}`);
        this.sounds.set(type, audio);
        this.loadingSounds.delete(type);
        resolve(audio);
      }, { once: true });

      audio.addEventListener('error', (e) => {
        console.error(`Failed to load audio ${type} from ${path}:`, e);
        this.loadingSounds.delete(type);
        reject(e);
      }, { once: true });

      // Timeout fallback - use audio even if not fully loaded
      setTimeout(() => {
        if (audio.readyState >= 2) {
          console.log(`Audio ${type} ready (fallback) from ${path}`);
          this.sounds.set(type, audio);
          this.loadingSounds.delete(type);
          resolve(audio);
        } else {
          console.warn(`Audio ${type} loading timeout, using anyway`);
          this.sounds.set(type, audio);
          this.loadingSounds.delete(type);
          resolve(audio);
        }
      }, 2000);
    });

    this.loadingSounds.set(type, loadPromise);
    return loadPromise;
  }

  /**
   * Play a sound
   * Handles lazy loading, AudioContext initialization, and error recovery
   */
  async play(sound: SoundType) {
    if (typeof window === 'undefined') return;

    try {
      // Initialize and resume AudioContext
      await this.resumeAudioContext();

      // Lazy load the sound
      const audio = await this.loadSound(sound);

      // Reset to beginning
      audio.currentTime = 0;

      // Play the sound
      await audio.play();
    } catch (err) {
      console.error(`Failed to play sound ${sound}:`, err);
      // Don't throw - fail silently for better UX
    }
  }

  /**
   * Start idle detection
   * Plays idle sound after 5 seconds of no user activity
   */
  startIdleDetection(callback: () => void) {
    this.resetIdleTimer(callback);
    
    if (typeof window !== 'undefined') {
      const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
      events.forEach(event => {
        window.addEventListener(event, () => this.resetIdleTimer(callback));
      });
    }
  }

  /**
   * Reset idle timer on user activity
   */
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

  /**
   * Stop idle sound
   */
  private stopIdle() {
    const idleAudio = this.sounds.get('idle');
    if (idleAudio) {
      idleAudio.pause();
      idleAudio.currentTime = 0;
    }
    this.isIdlePlaying = false;
  }

  /**
   * Cleanup resources
   * Call this when component unmounts
   */
  cleanup() {
    if (this.idleTimeout) {
      clearTimeout(this.idleTimeout);
    }
    this.sounds.forEach(audio => {
      audio.pause();
      audio.src = '';
    });
    this.loadingSounds.clear();
    
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }

  /**
   * Preload all sounds (optional)
   * Call this after user interaction to preload all sounds
   */
  async preloadAllSounds() {
    const promises = Object.keys(SOUND_PATHS).map(type =>
      this.loadSound(type as SoundType)
    );
    await Promise.all(promises);
  }
}

/**
 * Singleton instance
 * Exported for use throughout the application
 */
export const audioManager = new AudioManager();
