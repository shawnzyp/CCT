import { useEffect, useRef } from 'react';
import { useSettings } from './useSettings';
import { toast } from 'sonner';

/**
 * Hook to auto-save character progress at set intervals
 * Saves to local storage + dispatches event
 */
export function useAutoSave(characterId, saveFunction) {
  const { settings, updateSetting } = useSettings();
  const timerRef = useRef(null);

  useEffect(() => {
    if (!settings.autoSaveEnabled || !characterId || !saveFunction) return;

    const intervalMs = settings.autoSaveInterval * 60 * 1000;

    const doSave = async () => {
      try {
        await saveFunction();
        updateSetting('_lastAutoSaveTime', new Date().toISOString());
        // Silent save, no toast
      } catch (err) {
        console.error('Auto-save failed:', err);
      }
    };

    // Initial save after interval
    timerRef.current = setInterval(doSave, intervalMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [settings.autoSaveEnabled, settings.autoSaveInterval, characterId, saveFunction, updateSetting]);

  return {
    isAutoSaveEnabled: settings.autoSaveEnabled,
    lastAutoSaveTime: settings._lastAutoSaveTime
  };
}