import { useState, useEffect } from 'react';

const DEFAULT_SETTINGS = {
  // Visual Settings
  theme: 'dark',
  animationsEnabled: true,
  particleEffects: true,
  colorblindMode: 'none',
  fontSize: 'medium',
  highContrast: false,
  reducedMotion: false,
  scanlineEffect: true,
  glowEffects: true,
  
  // Audio Settings
  soundEffects: true,
  sfxVolume: 70,
  uiSounds: true,
  uiVolume: 50,
  backgroundMusic: false,
  musicVolume: 30,
  
  // Game Settings
  autoCalculateModifiers: true,
  showTutorials: true,
  confirmDangerousActions: true,
  autoSave: true,
  autoSaveInterval: 3,
  showDiceAnimations: true,
  criticalHitEffects: true,
  damageNumbersFloat: true,
  initiativeReminders: true,
  autoRollInitiative: false,
  compactMode: false,
  showGridLines: false
};

export function useSettings() {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('catalystCoreSettings');
    return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
  });

  useEffect(() => {
    const handleSettingsChange = (e) => {
      setSettings({ ...DEFAULT_SETTINGS, ...e.detail });
    };
    
    window.addEventListener('settingsChanged', handleSettingsChange);
    return () => window.removeEventListener('settingsChanged', handleSettingsChange);
  }, []);
  
  const updateSettings = (updates) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    localStorage.setItem('catalystCoreSettings', JSON.stringify(newSettings));
    window.dispatchEvent(new CustomEvent('settingsChanged', { detail: newSettings }));
  };

  return { settings, updateSettings };
}

export function getSettings() {
  const saved = localStorage.getItem('catalystCoreSettings');
  return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
}