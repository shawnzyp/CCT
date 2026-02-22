import { useState, useEffect, useCallback, useRef } from 'react';
import { DEFAULT_OPERATIONS_STATE } from './mapConfig';

const STORAGE_KEY = 'catalyst_operations_map';
const BROADCAST_CHANNEL = 'ops_map_sync';

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return { ...DEFAULT_OPERATIONS_STATE, ...JSON.parse(saved) };
  } catch {}
  return DEFAULT_OPERATIONS_STATE;
}

function saveState(state) {
  try {
    const payload = { layers: state.layers, visibleLayers: state.visibleLayers };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    // Broadcast to other tabs/windows
    try {
      const bc = new BroadcastChannel(BROADCAST_CHANNEL);
      bc.postMessage(payload);
      bc.close();
    } catch {}
  } catch {}
}

export default function useOperationsState(isDM) {
  const [state, setState] = useState(() => {
    const loaded = loadState();
    return { ...loaded, mode: isDM ? 'gm' : 'player', revealHidden: false, urgencyFilter: 0 };
  });
  const bcRef = useRef(null);

  useEffect(() => {
    setState(prev => ({ ...prev, mode: isDM ? 'gm' : 'player' }));
  }, [isDM]);

  useEffect(() => {
    saveState(state);
  }, [state.layers, state.visibleLayers]);

  // Real-time sync: listen for changes from other tabs/windows
  useEffect(() => {
    let bc;
    try {
      bc = new BroadcastChannel(BROADCAST_CHANNEL);
      bc.onmessage = (e) => {
        const { layers, visibleLayers } = e.data || {};
        if (layers) {
          setState(prev => ({ ...prev, layers, visibleLayers: visibleLayers || prev.visibleLayers }));
        }
      };
      bcRef.current = bc;
    } catch {}

    // Also listen to storage events (cross-origin tabs)
    const onStorage = (e) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const { layers, visibleLayers } = JSON.parse(e.newValue);
          setState(prev => ({ ...prev, layers, visibleLayers: visibleLayers || prev.visibleLayers }));
        } catch {}
      }
    };
    window.addEventListener('storage', onStorage);

    return () => {
      if (bc) bc.close();
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const addFeature = useCallback((layerKey, feature) => {
    setState(prev => ({
      ...prev,
      layers: {
        ...prev.layers,
        [layerKey]: [...prev.layers[layerKey], feature],
      }
    }));
  }, []);

  const updateFeature = useCallback((layerKey, id, updates) => {
    setState(prev => ({
      ...prev,
      layers: {
        ...prev.layers,
        [layerKey]: prev.layers[layerKey].map(f => f.id === id ? { ...f, ...updates } : f),
      }
    }));
  }, []);

  const deleteFeature = useCallback((layerKey, id) => {
    setState(prev => ({
      ...prev,
      layers: {
        ...prev.layers,
        [layerKey]: prev.layers[layerKey].filter(f => f.id !== id),
      }
    }));
  }, []);

  const toggleLayer = useCallback((layerKey) => {
    setState(prev => ({
      ...prev,
      visibleLayers: { ...prev.visibleLayers, [layerKey]: !prev.visibleLayers[layerKey] }
    }));
  }, []);

  const toggleRevealHidden = useCallback(() => {
    setState(prev => ({ ...prev, revealHidden: !prev.revealHidden }));
  }, []);

  const setUrgencyFilter = useCallback((minUrgency) => {
    setState(prev => ({ ...prev, urgencyFilter: minUrgency }));
  }, []);

  const exportData = useCallback(() => {
    const bundle = {
      version: 1,
      exported_at: new Date().toISOString(),
      theater: 'manhattan',
      layers: state.layers,
    };
    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `operations_data_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [state.layers]);

  const getVisibleFeatures = useCallback((layerKey) => {
    const features = state.layers[layerKey] || [];
    if (state.mode === 'gm') {
      if (state.revealHidden) return features;
      return features.filter(f => f.visibility !== 'hidden');
    }
    return features.filter(f => f.visibility === 'player');
  }, [state.mode, state.revealHidden, state.layers]);

  return {
    state,
    addFeature,
    updateFeature,
    deleteFeature,
    toggleLayer,
    toggleRevealHidden,
    exportData,
    getVisibleFeatures,
  };
}