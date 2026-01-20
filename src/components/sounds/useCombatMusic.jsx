import { useEffect, useRef, useState } from 'react';

const COMBAT_MUSIC = {
  low: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_d1718ab41b.mp3',
  medium: 'https://cdn.pixabay.com/download/audio/2022/08/02/audio_33c56b6d17.mp3',
  high: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_c8c6d0d1f8.mp3',
  boss: 'https://cdn.pixabay.com/download/audio/2022/03/24/audio_5baa2a0a25.mp3'
};

const COMBAT_SOUNDS = {
  hit: 'https://cdn.freesound.org/previews/442/442127_4019029-lq.mp3',
  miss: 'https://cdn.freesound.org/previews/220/220173_4169139-lq.mp3',
  critical: 'https://cdn.freesound.org/previews/387/387232_6620732-lq.mp3',
  powerUse: 'https://cdn.freesound.org/previews/320/320181_5260872-lq.mp3',
  heal: 'https://cdn.freesound.org/previews/341/341695_5858296-lq.mp3',
  enemyDefeat: 'https://cdn.freesound.org/previews/277/277403_5123851-lq.mp3',
  victory: 'https://cdn.freesound.org/previews/387/387232_6620732-lq.mp3'
};

export const useCombatMusic = () => {
  const musicRef = useRef(null);
  const [currentIntensity, setCurrentIntensity] = useState(null);
  const [isMusicEnabled, setIsMusicEnabled] = useState(true);
  const [isSFXEnabled, setIsSFXEnabled] = useState(true);

  useEffect(() => {
    const settings = JSON.parse(localStorage.getItem('catalystCoreSettings') || '{"combatMusic": true, "combatSFX": true}');
    setIsMusicEnabled(settings.combatMusic !== false);
    setIsSFXEnabled(settings.combatSFX !== false);
  }, []);

  const playMusic = (intensity) => {
    if (!isMusicEnabled || currentIntensity === intensity) return;

    if (musicRef.current) {
      musicRef.current.pause();
      musicRef.current = null;
    }

    const url = COMBAT_MUSIC[intensity];
    if (url) {
      const audio = new Audio(url);
      audio.volume = 0.3;
      audio.loop = true;
      audio.play().catch(() => {});
      musicRef.current = audio;
      setCurrentIntensity(intensity);
    }
  };

  const stopMusic = () => {
    if (musicRef.current) {
      musicRef.current.pause();
      musicRef.current = null;
      setCurrentIntensity(null);
    }
  };

  const playSFX = (soundName, volume = 0.4) => {
    if (!isSFXEnabled) return;

    const url = COMBAT_SOUNDS[soundName];
    if (url) {
      const audio = new Audio(url);
      audio.volume = volume;
      audio.play().catch(() => {});
    }
  };

  useEffect(() => {
    return () => {
      if (musicRef.current) {
        musicRef.current.pause();
      }
    };
  }, []);

  return {
    playMusic,
    stopMusic,
    playSFX,
    currentIntensity,
    toggleMusic: () => setIsMusicEnabled(!isMusicEnabled),
    toggleSFX: () => setIsSFXEnabled(!isSFXEnabled),
    isMusicEnabled,
    isSFXEnabled
  };
};

export default useCombatMusic;