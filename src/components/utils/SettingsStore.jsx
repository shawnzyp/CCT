// Canonical settings schema with defaults
export const DEFAULT_SETTINGS = {
  // Visual
  fontSize: 'medium', // small, medium, large, xlarge
  colorblindMode: 'none', // none, protanopia, deuteranopia, tritanopia
  highContrast: false,
  reducedMotion: false,
  scanlineEffect: false,
  glowEffects: true,
  particleEffects: true,
  animationsEnabled: true,
  compactMode: false,

  // Audio
  masterMute: false,
  sfxEnabled: true,
  sfxVolume: 80,
  uiSoundsEnabled: true,
  uiSoundsVolume: 70,
  musicEnabled: true,
  musicVolume: 50,

  // Gameplay
  autoCalculateModifiers: true,
  autoSaveEnabled: true,
  autoSaveInterval: 5, // minutes: 1, 3, 5, 10
  showTutorials: true,
  confirmDangerousActions: true,
  diceAnimations: true,
  criticalHitEffects: true,
  floatingDamageNumbers: true,
  initiativeReminders: true,
  autoRollInitiative: false,
  showGridLines: false,

  // A.E.G.I.S.
  aegisEnabled: true,
  aegisActionModules: true,
  aegisConversationHistory: false,
  aegisTone: 'tactical', // tactical, friendly, clinical, cinematic
  aegisFocusAreas: ['Combat Tactics', 'Rules & Mechanics'], // min 1
  aegisProactiveTips: true,
  aegisAdvisoryInterval: 90, // seconds: 30, 90, 300

  // Session
  autoLinkSession: true,
  sessionAutoRefresh: true,

  // Last saved metadata
  _lastSaved: null,
  _version: 1
};

const STORAGE_KEY = 'catalystCoreSettings';

class SettingsStore {
  constructor() {
    this.listeners = [];
    this.settings = this.load();
  }

  load() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge with defaults to handle new settings
        return { ...DEFAULT_SETTINGS, ...parsed };
      }
    } catch (e) {
      console.error('Failed to load settings:', e);
    }
    return { ...DEFAULT_SETTINGS };
  }

  save() {
    try {
      const toSave = {
        ...this.settings,
        _lastSaved: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
      return true;
    } catch (e) {
      console.error('Failed to save settings:', e);
      return false;
    }
  }

  get(key) {
    return this.settings[key];
  }

  set(key, value) {
    const oldValue = this.settings[key];
    if (oldValue === value) return;

    this.settings[key] = value;
    this.save();
    this.notifyListeners(key, value, oldValue);
  }

  getAll() {
    return { ...this.settings };
  }

  setMultiple(updates) {
    const changes = {};
    let changed = false;

    Object.entries(updates).forEach(([key, value]) => {
      if (this.settings[key] !== value) {
        this.settings[key] = value;
        changes[key] = value;
        changed = true;
      }
    });

    if (changed) {
      this.save();
      Object.entries(changes).forEach(([key, value]) => {
        this.notifyListeners(key, value, null);
      });
    }
  }

  reset(category = null) {
    if (category === null) {
      this.settings = { ...DEFAULT_SETTINGS };
    } else {
      // Reset category settings
      Object.keys(DEFAULT_SETTINGS).forEach(key => {
        if (key.startsWith(category.toLowerCase())) {
          this.settings[key] = DEFAULT_SETTINGS[key];
        }
      });
    }
    this.save();
    this.notifyListeners('__reset__', category, null);
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notifyListeners(key, newValue, oldValue) {
    this.listeners.forEach(listener => {
      try {
        listener(key, newValue, oldValue);
      } catch (e) {
        console.error('Settings listener error:', e);
      }
    });
  }

  getLastSaved() {
    return this.settings._lastSaved;
  }

  getDiagnostics() {
    return {
      version: this.settings._version,
      lastSaved: this.settings._lastSaved,
      storageLocation: 'localStorage',
      totalSettings: Object.keys(this.settings).length,
      settings: this.getAll()
    };
  }
}

// Singleton instance
let store = null;

export function getSettingsStore() {
  if (!store) {
    store = new SettingsStore();
  }
  return store;
}

// Reset store (for testing)
export function resetSettingsStore() {
  store = null;
}