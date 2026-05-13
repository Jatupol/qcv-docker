// client/src/services/soundService.ts
/**
 * Sound Service
 * Provides audio notification functionality for the application
 *
 * Features:
 * - Centralized sound management
 * - Volume control with localStorage persistence
 * - Mute/unmute functionality
 * - Preloading for better performance
 * - Error handling for missing sound files
 */

export type SoundType = 'success' | 'error' | 'warning' | 'info' | 'delete' | 'save' | 'select' | 'important';

interface SoundConfig {
  fileName: string;
  volume?: number; // 0.0 to 1.0
}

// Sound file mapping
const SOUND_FILES: Record<SoundType, SoundConfig> = {
  success: { fileName: 'success.mp3', volume: 0.5 },
  error: { fileName: 'error.mp3', volume: 0.6 },
  warning: { fileName: 'warning.mp3', volume: 0.5 },
  info: { fileName: 'info.mp3', volume: 0.4 },
  delete: { fileName: 'delete.mp3', volume: 0.5 },
  save: { fileName: 'save.mp3', volume: 0.5 },
  select: { fileName: 'select.mp3', volume: 0.4 },
  important: { fileName: 'important.mp3', volume: 0.6 }
};

class SoundService {
  private audioCache: Map<SoundType, HTMLAudioElement> = new Map();
  private masterVolume: number = 0.7;
  private isMuted: boolean = false;
  private isEnabled: boolean = true;

  constructor() {
    // Load settings from localStorage
    this.loadSettings();
    // Preload commonly used sounds
    this.preloadSounds(['success', 'error', 'warning']);
  }

  /**
   * Load sound settings from localStorage
   */
  private loadSettings(): void {
    try {
      const savedVolume = localStorage.getItem('soundVolume');
      const savedMuted = localStorage.getItem('soundMuted');
      const savedEnabled = localStorage.getItem('soundEnabled');

      if (savedVolume) {
        this.masterVolume = parseFloat(savedVolume);
      }
      if (savedMuted) {
        this.isMuted = savedMuted === 'true';
      }
      if (savedEnabled !== null) {
        this.isEnabled = savedEnabled === 'true';
      }
    } catch (error) {
      console.warn('Failed to load sound settings:', error);
    }
  }

  /**
   * Save sound settings to localStorage
   */
  private saveSettings(): void {
    try {
      localStorage.setItem('soundVolume', this.masterVolume.toString());
      localStorage.setItem('soundMuted', this.isMuted.toString());
      localStorage.setItem('soundEnabled', this.isEnabled.toString());
    } catch (error) {
      console.warn('Failed to save sound settings:', error);
    }
  }

  /**
   * Preload sound files for better performance
   */
  private preloadSounds(soundTypes: SoundType[]): void {
    soundTypes.forEach(soundType => {
      this.getAudioElement(soundType);
    });
  }

  /**
   * Get or create audio element for a sound type
   */
  private getAudioElement(soundType: SoundType): HTMLAudioElement {
    // Check cache first
    if (this.audioCache.has(soundType)) {
      return this.audioCache.get(soundType)!;
    }

    // Create new audio element
    const config = SOUND_FILES[soundType];
    const audio = new Audio(`/sounds/${config.fileName}`);
    audio.preload = 'auto';

    // Cache it
    this.audioCache.set(soundType, audio);

    return audio;
  }

  /**
   * Play a sound
   */
  public play(soundType: SoundType): void {
    if (!this.isEnabled || this.isMuted) {
      return;
    }

    try {
      const audio = this.getAudioElement(soundType);
      const config = SOUND_FILES[soundType];

      // Reset audio to start
      audio.currentTime = 0;

      // Set volume (config volume * master volume)
      audio.volume = (config.volume || 0.5) * this.masterVolume;

      // Play
      const playPromise = audio.play();

      // Handle play promise (required in modern browsers)
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.warn(`Failed to play sound: ${soundType}`, error);
        });
      }
    } catch (error) {
      console.warn(`Error playing sound: ${soundType}`, error);
    }
  }

  /**
   * Stop all currently playing sounds
   */
  public stopAll(): void {
    this.audioCache.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
  }

  /**
   * Set master volume (0.0 to 1.0)
   */
  public setVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    this.saveSettings();
  }

  /**
   * Get current master volume
   */
  public getVolume(): number {
    return this.masterVolume;
  }

  /**
   * Mute all sounds
   */
  public mute(): void {
    this.isMuted = true;
    this.saveSettings();
  }

  /**
   * Unmute all sounds
   */
  public unmute(): void {
    this.isMuted = false;
    this.saveSettings();
  }

  /**
   * Toggle mute state
   */
  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    this.saveSettings();
    return this.isMuted;
  }

  /**
   * Check if sounds are muted
   */
  public isSoundMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Enable sounds
   */
  public enable(): void {
    this.isEnabled = true;
    this.saveSettings();
  }

  /**
   * Disable sounds
   */
  public disable(): void {
    this.isEnabled = false;
    this.stopAll();
    this.saveSettings();
  }

  /**
   * Toggle enabled state
   */
  public toggleEnabled(): boolean {
    this.isEnabled = !this.isEnabled;
    if (!this.isEnabled) {
      this.stopAll();
    }
    this.saveSettings();
    return this.isEnabled;
  }

  /**
   * Check if sounds are enabled
   */
  public isSoundEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * Clear audio cache
   */
  public clearCache(): void {
    this.stopAll();
    this.audioCache.clear();
  }
}

// Export singleton instance
export const soundService = new SoundService();
