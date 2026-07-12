/**
 * Sound Configuration
 * Centralized sound paths for easy maintenance
 * All sounds are stored in /public/sounds/
 * 
 * NOTE: parrot_when_idle_signing.mp3 has been removed (file deleted).
 * The idle detection callback still fires but no audio plays.
 */
const SOUND_PATHS: Record<SoundType, string> = {
  click: '/sounds/click.mp3',
  success: '/sounds/success.mp3',
  evolve: '/sounds/parrot_evolving.mp3',
  level_up: '/sounds/level_up.mp3',
  parrot_one_word: '/sounds/parrot_one_word.mp3',
};

export type SoundType = 'click' | 'success' | 'evolve' | 'level_up' | 'parrot_one_word';

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
  private loadingSounds: Map<SoundType, Promise<HTMLAudioElement>> = new Map();

  constructor() {
    // Don't load sounds in constructor - lazy load on first play
  }

  /**
   * Initialize AudioContext (must be called after user interaction)
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
   * Load a single sound on demand (lazy loading)
   */
  private async loadSound(type: SoundType): Promise<HTMLAudioElement> {
    const existing = this.sounds.get(type);
    if (existing) return existing;

    const existingPromise = this.loadingSounds.get(type);
    if (existingPromise) return existingPromise;

    const path = SOUND_PATHS[type];
    const loadPromise = new Promise<HTMLAudioElement>((resolve, reject) => {
      if (typeof window === 'undefined') {
        reject(new Error('Not running in browser'));
        return;
      }

      const audio = new Audio(path);
      audio.preload = 'auto';

      audio.addEventListener('canplaythrough', () => {
        this.sounds.set(type, audio);
        this.loadingSounds.delete(type);
        resolve(audio);
      }, { once: true });

      audio.addEventListener('error', (e) => {
        console.error(`Failed to load audio ${type} from ${path}:`, e);
        this.loadingSounds.delete(type);
        reject(e);
      }, { once: true });

      // Timeout fallback
      setTimeout(() => {
        if (!this.sounds.has(type)) {
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
   */
  async play(sound: SoundType) {
    if (typeof window === 'undefined') return;

    try {
      await this.resumeAudioContext();
      const audio = await this.loadSound(sound);
      audio.currentTime = 0;
      await audio.play();
    } catch (err) {
      console.error(`Failed to play sound ${sound}:`, err);
      // Fail silently for better UX
    }
  }

  /**
   * Start idle detection (callback only — no idle audio plays)
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

    this.idleTimeout = setTimeout(() => {
      // Idle detected — callback fires, but no audio (file removed)
      callback();
    }, 5000);
  }

  /**
   * Cleanup resources
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
   * Preload all sounds (optional, call after user interaction)
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
 */
export const audioManager = new AudioManager();
