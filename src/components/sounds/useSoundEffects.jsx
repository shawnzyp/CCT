import { useCallback } from 'react';

// Dark, gritty TTRPG sound effects
const SOUNDS = {
  // UI Sounds - Mechanical, tactical
  click: 'https://cdn.freesound.org/previews/404/404743_7274371-lq.mp3',
  hover: 'https://cdn.freesound.org/previews/380/380476_6976337-lq.mp3',
  navigate: 'https://cdn.freesound.org/previews/397/397353_6666450-lq.mp3',
  
  // Resource Sounds - Heavy impacts
  hpLoss: 'https://cdn.freesound.org/previews/476/476177_6523272-lq.mp3',
  hpGain: 'https://cdn.freesound.org/previews/397/397353_6666450-lq.mp3',
  spLoss: 'https://cdn.freesound.org/previews/397/397352_6666450-lq.mp3',
  spGain: 'https://cdn.freesound.org/previews/397/397353_6666450-lq.mp3',
  
  // Combat Sounds - Brutal, gritty
  attack: 'https://cdn.freesound.org/previews/442/442127_4019029-lq.mp3',
  powerUse: 'https://cdn.freesound.org/previews/476/476177_6523272-lq.mp3',
  dice: 'https://cdn.freesound.org/previews/274/274183_4939433-lq.mp3',
  
  // Success/Error - Dark tones
  success: 'https://cdn.freesound.org/previews/397/397353_6666450-lq.mp3',
  error: 'https://cdn.freesound.org/previews/476/476177_6523272-lq.mp3',
  levelUp: 'https://cdn.freesound.org/previews/397/397353_6666450-lq.mp3',
  
  // Ambient - Dystopian atmosphere
  ambient: 'https://cdn.freesound.org/previews/380/380476_6976337-lq.mp3'
};

const audioCache = {};

const preloadSound = (url) => {
  if (!audioCache[url]) {
    audioCache[url] = new Audio(url);
    audioCache[url].volume = 0.3;
  }
  return audioCache[url];
};

export const useSoundEffects = () => {
  const play = useCallback((soundName, volume = 0.3) => {
    try {
      const url = SOUNDS[soundName];
      if (!url) return;
      
      const audio = preloadSound(url);
      audio.volume = volume;
      audio.currentTime = 0;
      audio.play().catch(() => {
        // Ignore autoplay errors
      });
    } catch (error) {
      // Silent fail for sounds
    }
  }, []);

  return { play };
};

export default useSoundEffects;