import { useState, useEffect, useCallback } from 'react';
import { getTheme, applyThemeToDom, DEFAULT_FACTION } from './themeEngine';

const STORAGE_KEY = 'catalystCoreTheme';
const MODE_KEY = 'catalystCoreMode';

export function useTheme() {
  const [factionId, setFactionId] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) || DEFAULT_FACTION;
  });

  const [mode, setMode] = useState(() => {
    return localStorage.getItem(MODE_KEY) || 'command';
  });

  const theme = getTheme(factionId);

  useEffect(() => {
    applyThemeToDom(theme);
  }, [factionId, theme]);

  // Listen for cross-component changes
  useEffect(() => {
    const handler = (e) => {
      if (e.detail?.faction) setFactionId(e.detail.faction);
      if (e.detail?.mode) setMode(e.detail.mode);
    };
    window.addEventListener('themeChanged', handler);
    return () => window.removeEventListener('themeChanged', handler);
  }, []);

  const setFaction = useCallback((id) => {
    setFactionId(id);
    localStorage.setItem(STORAGE_KEY, id);
    window.dispatchEvent(new CustomEvent('themeChanged', { detail: { faction: id } }));
  }, []);

  const setUiMode = useCallback((m) => {
    setMode(m);
    localStorage.setItem(MODE_KEY, m);
    window.dispatchEvent(new CustomEvent('themeChanged', { detail: { mode: m } }));
  }, []);

  return { theme, factionId, mode, setFaction, setUiMode };
}