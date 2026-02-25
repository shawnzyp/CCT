import { useState, useEffect, useCallback } from 'react';
import { getTheme, applyThemeToDom, DEFAULT_FACTION } from './themeEngine';

const STORAGE_KEY = 'catalystCoreTheme';

export function useTheme() {
  const [factionId, setFactionId] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) || DEFAULT_FACTION;
  });

  const theme = getTheme(factionId);

  useEffect(() => {
    applyThemeToDom(theme);
  }, [factionId, theme]);

  // Listen for cross-component changes
  useEffect(() => {
    const handler = (e) => {
      if (e.detail?.faction) setFactionId(e.detail.faction);
    };
    window.addEventListener('themeChanged', handler);
    return () => window.removeEventListener('themeChanged', handler);
  }, []);

  const setFaction = useCallback((id) => {
    setFactionId(id);
    localStorage.setItem(STORAGE_KEY, id);
    window.dispatchEvent(new CustomEvent('themeChanged', { detail: { faction: id } }));
  }, []);

  return { theme, factionId, setFaction };
}