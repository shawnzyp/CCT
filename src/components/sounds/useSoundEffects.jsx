import { useCallback } from 'react';

// Sound effect URLs from free libraries
const SOUNDS = {
  // UI Sounds
  click: 'https://cdn.freesound.org/previews/243/243701_4404552-lq.mp3',
  hover: 'https://cdn.freesound.org/previews/220/220173_4169139-lq.mp3',
  navigate: 'https://cdn.freesound.org/previews/320/320655_5260872-lq.mp3',
  
  // Resource Sounds
  hpLoss: 'https://cdn.freesound.org/previews/277/277403_5123851-lq.mp3',
  hpGain: 'https://cdn.freesound.org/previews/341/341695_5858296-lq.mp3',
  spLoss: 'https://cdn.freesound.org/previews/401/401362_7146891-lq.mp3',
  spGain: 'https://cdn.freesound.org/previews/270/270324_5123851-lq.mp3',
  
  // Combat Sounds
  attack: 'https://cdn.freesound.org/previews/442/442127_4019029-lq.mp3',
  powerUse: 'https://cdn.freesound.org/previews/320/320181_5260872-lq.mp3',
  dice: 'https://cdn.freesound.org/previews/274/274183_4939433-lq.mp3',
  
  // Success/Error
  success: 'https://cdn.freesound.org/previews/341/341695_5858296-lq.mp3',
  error: 'https://cdn.freesound.org/previews/277/277403_5123851-lq.mp3',
  levelUp: 'https://cdn.freesound.org/previews/387/387232_6620732-lq.mp3',
  
  // Ambient
  ambient: 'https://cdn.freesound.org/previews/156/156859_2615119-lq.mp3'
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