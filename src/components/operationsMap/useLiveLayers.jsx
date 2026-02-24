// ── LIVE LAYER STATE: settings + event pulses ──────────────────────────────
import { useState, useCallback, useRef } from 'react';

const STORAGE_KEY = 'cc_ops_live_layers';

function load() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); } catch { return null; }
}

const DEFAULTS = {
  sweep: {
    enabled: true,
    intensity: 60,   // 0–100
    speed: 'normal', // 'slow'|'normal'|'fast'
  },
  heatmap: {
    enabled: true,
    opacity: 55,
    mode: 'blend',   // 'blend'|'exclusive'|'outline'
    showLegend: true,
  },
  pulses: {
    enabled: true,
    intensity: 75,
    detail: 'standard', // 'low'|'standard'|'high'
  },
  ambient: {
    enabled: true,
    density: 'standard', // 'low'|'standard'|'high'
    specks: true,
    drift: true,
    blooms: true,
    noise: true,
    gridFlicker: true,
  },
};

export default function useLiveLayers() {
  const saved = load();
  const [settings, setSettings] = useState(() => ({
    sweep:   { ...DEFAULTS.sweep,   ...(saved?.sweep   || {}) },
    heatmap: { ...DEFAULTS.heatmap, ...(saved?.heatmap || {}) },
    pulses:  { ...DEFAULTS.pulses,  ...(saved?.pulses  || {}) },
    ambient: { ...DEFAULTS.ambient, ...(saved?.ambient || {}) },
  }));

  const [activePulses, setActivePulses] = useState([]);
  const pulseIdRef = useRef(0);

  const updateSettings = useCallback((section, patch) => {
    setSettings(prev => {
      const next = { ...prev, [section]: { ...prev[section], ...patch } };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const addPulse = useCallback((pulse) => {
    const id = `pulse_${Date.now()}_${++pulseIdRef.current}`;
    const entry = { ...pulse, id, createdAt: Date.now() };
    setActivePulses(prev => {
      const next = [...prev, entry];
      return next.slice(-6); // max 6 active
    });
    // Auto-remove after duration
    const dur = pulse.durationMs || 8000;
    setTimeout(() => {
      setActivePulses(prev => prev.filter(p => p.id !== id));
    }, dur);
  }, []);

  const clearPulses = useCallback(() => setActivePulses([]), []);

  return { settings, updateSettings, activePulses, addPulse, clearPulses };
}