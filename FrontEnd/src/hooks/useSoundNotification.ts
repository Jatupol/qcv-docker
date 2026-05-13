// client/src/hooks/useSoundNotification.ts
/**
 * useSoundNotification Hook
 * Combines notification display with sound playback
 *
 * This hook wraps the existing notification system and adds sound effects
 * for better user feedback in manufacturing quality control operations.
 */

import { soundService } from '../services/soundService';
import type { SoundType } from '../services/soundService';

/**
 * Toast-based notification with sound
 * Compatible with the useToast hook pattern
 */
export interface ToastWithSound {
  success: (message: string, playSound?: boolean) => void;
  error: (message: string, playSound?: boolean) => void;
  warning: (message: string, playSound?: boolean) => void;
  info: (message: string, playSound?: boolean) => void;
}

/**
 * Hook to combine toast notifications with sound effects
 * Wraps existing toast functions to add sound playback
 */
export const useSoundNotification = (
  toastFunctions: {
    success: (message: string) => void;
    error: (message: string) => void;
    warning: (message: string) => void;
    info: (message: string) => void;
  }
): ToastWithSound => {
  const success = (message: string, playSound: boolean = true) => {
    if (playSound) {
      soundService.play('success');
    }
    toastFunctions.success(message);
  };

  const error = (message: string, playSound: boolean = true) => {
    if (playSound) {
      soundService.play('error');
    }
    toastFunctions.error(message);
  };

  const warning = (message: string, playSound: boolean = true) => {
    if (playSound) {
      soundService.play('warning');
    }
    toastFunctions.warning(message);
  };

  const info = (message: string, playSound: boolean = true) => {
    if (playSound) {
      soundService.play('info');
    }
    toastFunctions.info(message);
  };

  return {
    success,
    error,
    warning,
    info
  };
};

/**
 * Hook for direct sound control
 * Useful for custom notification scenarios
 */
export const useSound = () => {
  return {
    // Play sounds
    playSuccess: () => soundService.play('success'),
    playError: () => soundService.play('error'),
    playWarning: () => soundService.play('warning'),
    playInfo: () => soundService.play('info'),
    playDelete: () => soundService.play('delete'),
    playSave: () => soundService.play('save'),
    playSelect: () => soundService.play('select'),
    playImportant: () => soundService.play('important'),

    // General play
    play: (soundType: SoundType) => soundService.play(soundType),

    // Control functions
    stopAll: () => soundService.stopAll(),
    setVolume: (volume: number) => soundService.setVolume(volume),
    getVolume: () => soundService.getVolume(),
    mute: () => soundService.mute(),
    unmute: () => soundService.unmute(),
    toggleMute: () => soundService.toggleMute(),
    isMuted: () => soundService.isSoundMuted(),
    enable: () => soundService.enable(),
    disable: () => soundService.disable(),
    toggleEnabled: () => soundService.toggleEnabled(),
    isEnabled: () => soundService.isSoundEnabled()
  };
};

/**
 * Convenience function to play sound with notification
 * Can be used directly without hooks
 */
export const playSoundWithNotification = (
  soundType: SoundType,
  notificationFn: () => void
): void => {
  soundService.play(soundType);
  notificationFn();
};
