import { useState, useEffect, useCallback } from 'react';
import { DEFAULT_OPERATIONS_STATE } from './mapConfig';

const STORAGE_KEY = 'catalyst_operations_map';

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return { ...DEFAULT_OPERATIONS_STATE, ...JSON.parse(saved) };
  } catch {}
  return DEFAULT_OPERATIONS_STATE;
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      layers: state.layers,
      visibleLayers: state.visibleLayers,
    }));
  } catch {}
}

export default function useOperationsState(isDM) {
  const [state, setState] = useState(() => {
    const loaded = loadState();
    return { ...loaded, mode: isDM ? 'gm' : 'player', revealHidden: false };
  });

  useEffect(() => {
    setState(prev => ({ ...prev, mode: isDM ? 'gm' : 'player' }));
  }, [isDM]);

  useEffect(() => {
    saveState(state);
  }, [state.layers, state.visibleLayers]);

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