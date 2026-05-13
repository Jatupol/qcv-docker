// client/src/utils/soundNotification.ts
// Sound Notification Utility
// Provides audio feedback for user actions

/**
 * Sound types available for notifications
 */
export type SoundType = 'success' | 'error' | 'warning' | 'info';

/**
 * Sound Notification Class
 * Manages audio feedback for user interactions
 */
class SoundNotification {
  private audioContext: AudioContext | null = null;

  constructor() {
    // Initialize AudioContext lazily when first sound is played
    if (typeof window !== 'undefined' && 'AudioContext' in window) {
      // AudioContext will be created on first use
    }
  }

  /**
   * Get or create AudioContext
   */
  private getAudioContext(): AudioContext | null {
    if (!this.audioContext && typeof window !== 'undefined') {
      try {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (error) {
        console.warn('AudioContext not supported:', error);
        return null;
      }
    }
    return this.audioContext;
  }

  /**
   * Play a success sound
   * Two ascending tones for positive feedback
   */
  playSuccess(): void {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // First tone
    this.playTone(ctx, 523.25, now, 0.1, 0.15); // C5
    // Second tone
    this.playTone(ctx, 659.25, now + 0.1, 0.1, 0.15); // E5
  }

  /**
   * Play an error sound
   * Lower descending tone for negative feedback
   */
  playError(): void {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Error tone - lower frequency
    this.playTone(ctx, 200, now, 0.2, 0.2, 'sawtooth');
  }

  /**
   * Play a warning sound
   * Single medium tone
   */
  playWarning(): void {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Warning tone
    this.playTone(ctx, 440, now, 0.15, 0.15); // A4
  }

  /**
   * Play an info sound
   * Single short tone
   */
  playInfo(): void {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Info tone
    this.playTone(ctx, 587.33, now, 0.08, 0.1); // D5
  }

  /**
   * Play a tone with specified parameters
   */
  private playTone(
    ctx: AudioContext,
    frequency: number,
    startTime: number,
    duration: number,
    volume: number = 0.1,
    type: OscillatorType = 'sine'
  ): void {
    try {
      // Create oscillator
      const oscillator = ctx.createOscillator();
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, startTime);

      // Create gain node for volume control
      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

      // Connect nodes
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      // Start and stop
      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    } catch (error) {
      console.warn('Error playing tone:', error);
    }
  }

  /**
   * Play sound based on type
   */
  play(type: SoundType): void {
    switch (type) {
      case 'success':
        this.playSuccess();
        break;
      case 'error':
        this.playError();
        break;
      case 'warning':
        this.playWarning();
        break;
      case 'info':
        this.playInfo();
        break;
      default:
        console.warn('Unknown sound type:', type);
    }
  }
}

// Export singleton instance
export const soundNotification = new SoundNotification();

// Export class for testing
export default SoundNotification;

/*
=== SOUND NOTIFICATION UTILITY FEATURES ===

SOUND TYPES:
✅ Success - Two ascending tones (C5 -> E5)
✅ Error - Lower descending tone with sawtooth wave
✅ Warning - Single medium tone (A4)
✅ Info - Single short tone (D5)

IMPLEMENTATION:
✅ Web Audio API for cross-browser compatibility
✅ Singleton pattern for consistent instance
✅ Lazy AudioContext initialization
✅ Graceful fallback when audio not supported
✅ Volume control and tone shaping
✅ Non-blocking audio playback

USAGE:
import { soundNotification } from '@/utils/soundNotification';

// Play success sound
soundNotification.play('success');

// Play error sound
soundNotification.play('error');

// Or use specific methods
soundNotification.playSuccess();
soundNotification.playError();

BENEFITS:
✅ Provides immediate audio feedback
✅ Improves user experience and accessibility
✅ Non-intrusive and subtle sounds
✅ Lightweight implementation
✅ No external dependencies
*/
