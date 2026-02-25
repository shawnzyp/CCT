import { useState, useEffect, useCallback } from 'react';
import { getSettingsStore } from './SettingsStore';

export function useSettings() {
  const store = getSettingsStore();
  const [settings, setSettings] = useState(() => store.getAll());

  useEffect(() => {
    const unsubscribe = store.subscribe((key, newValue, oldValue) => {
      setSettings(store.getAll());
      window.dispatchEvent(new CustomEvent('settingChanged', {
        detail: { key, newValue, oldValue }
      }));
    });
    return unsubscribe;
  }, [store]);

  const updateSetting = useCallback((key, value) => {
    store.set(key, value);
  }, [store]);

  const updateSettings = useCallback((updates) => {
    store.setMultiple(updates);
  }, [store]);

  const reset = useCallback((category = null) => {
    store.reset(category);
  }, [store]);

  return { settings, updateSetting, updateSettings, reset };
}

export function getSettings() {
  const store = getSettingsStore();
  return store.getAll();
}