import { useCallback } from 'react';
import { playKeySound, playErrorSound } from '../utils/soundSynth';

interface SoundSettings {
  soundType: 'none' | 'linear' | 'tactile' | 'typewriter';
  volume: number;
}

/**
 * React hook to trigger typing sound effects based on settings.
 * @param settings Sound configurations (type and volume)
 */
export function useSoundEffects(settings: SoundSettings) {
  const triggerKeySound = useCallback((isSpace: boolean = false) => {
    playKeySound(settings.soundType, settings.volume, isSpace);
  }, [settings.soundType, settings.volume]);

  const triggerErrorSound = useCallback(() => {
    playErrorSound(settings.volume);
  }, [settings.volume]);

  return {
    playClick: triggerKeySound,
    playError: triggerErrorSound,
  };
}
