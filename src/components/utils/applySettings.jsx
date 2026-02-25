// Apply settings to DOM and app-wide systems
import { getSettingsStore } from './SettingsStore';

export function applyVisualSettings(settings) {
  const root = document.documentElement;

  // Font scale
  const fontScaleMap = {
    small: 0.85,
    medium: 1,
    large: 1.15,
    xlarge: 1.3
  };
  root.style.setProperty('--font-scale', fontScaleMap[settings.fontSize] || 1);

  // Density (compact mode)
  if (settings.compactMode) {
    root.style.setProperty('--density', '0.8');
  } else {
    root.style.setProperty('--density', '1');
  }

  // High contrast
  document.body.classList.toggle('high-contrast', settings.highContrast);

  // Reduced motion
  document.body.classList.toggle('reduce-motion', settings.reducedMotion);

  // Particle effects
  const gridBg = document.querySelector('.military-grid');
  if (gridBg) {
    if (!settings.particleEffects) {
      gridBg.style.display = 'none';
    } else {
      gridBg.style.display = '';
    }
  }

  // Scanline effect
  const scanlineLayer = document.querySelector('.cc-scanline-layer');
  if (scanlineLayer) {
    if (!settings.scanlineEffect || settings.reducedMotion) {
      scanlineLayer.style.display = 'none';
    } else {
      scanlineLayer.style.display = '';
    }
  }

  // Glow effects
  document.body.classList.toggle('no-glow', !settings.glowEffects);

  // Animations
  if (!settings.animationsEnabled) {
    document.body.classList.add('animations-disabled');
  } else {
    document.body.classList.remove('animations-disabled');
  }

  // Colorblind mode
  if (settings.colorblindMode !== 'none') {
    document.body.classList.add(`colorblind-${settings.colorblindMode}`);
  } else {
    document.body.classList.remove('colorblind-protanopia', 'colorblind-deuteranopia', 'colorblind-tritanopia');
  }
}

export function applyAudioSettings(settings) {
  // Audio context is handled by the audio engine hook
  // This is mainly for reference
  return {
    masterMute: settings.masterMute,
    sfxEnabled: settings.sfxEnabled && !settings.masterMute,
    sfxVolume: settings.sfxVolume / 100,
    uiSoundsEnabled: settings.uiSoundsEnabled && !settings.masterMute,
    uiSoundsVolume: settings.uiSoundsVolume / 100,
    musicEnabled: settings.musicEnabled && !settings.masterMute,
    musicVolume: settings.musicVolume / 100
  };
}

export function applyGameplaySettings(settings) {
  // Gameplay settings are applied contextually by components
  // This provides a centralized reference
  return {
    autoCalculateModifiers: settings.autoCalculateModifiers,
    autoSaveEnabled: settings.autoSaveEnabled,
    autoSaveInterval: settings.autoSaveInterval * 60 * 1000, // convert to ms
    showTutorials: settings.showTutorials,
    confirmDangerousActions: settings.confirmDangerousActions,
    diceAnimations: settings.diceAnimations && settings.animationsEnabled,
    criticalHitEffects: settings.criticalHitEffects,
    floatingDamageNumbers: settings.floatingDamageNumbers,
    initiativeReminders: settings.initiativeReminders,
    autoRollInitiative: settings.autoRollInitiative,
    showGridLines: settings.showGridLines,
    compactMode: settings.compactMode
  };
}

// Subscribe to setting changes and apply them globally
export function initializeSettingsApplication() {
  const store = getSettingsStore();
  
  // Apply initial settings
  const settings = store.getAll();
  applyVisualSettings(settings);

  // Listen for changes
  store.subscribe((key, newValue, oldValue) => {
    const allSettings = store.getAll();
    
    if (key.startsWith('fontSize') || key.startsWith('compact') || 
        key.startsWith('highContrast') || key.startsWith('reducedMotion') ||
        key.startsWith('particleEffects') || key.startsWith('scanline') ||
        key.startsWith('glowEffects') || key.startsWith('animationsEnabled') ||
        key.startsWith('colorblind')) {
      applyVisualSettings(allSettings);
    }

    // Dispatch event for components that need to react
    window.dispatchEvent(new CustomEvent('settingsApplied', {
      detail: { key, newValue, oldValue, allSettings }
    }));
  });
}