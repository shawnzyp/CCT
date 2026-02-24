import React, { useState, useCallback, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Map, Radio, User, Shield, Settings2, Zap } from 'lucide-react';
import { LAYER_TYPES } from '@/components/operationsMap/mapConfig';
import useOperationsState from '@/components/operationsMap/useOperationsState';
import useLiveLayers from '@/components/operationsMap/useLiveLayers';
import OperationsMapView from '@/components/operationsMap/OperationsMapView';
import LiveLayersCanvas from '@/components/operationsMap/LiveLayersCanvas';
import LiveLayersSettings from '@/components/operationsMap/LiveLayersSettings';
import FactionHeatmapLegend from '@/components/operationsMap/FactionHeatmapLegend';
import GMDrawer from '@/components/operationsMap/GMDrawer';
import FeatureFormModal from '@/components/operationsMap/FeatureFormModal';
import FeaturePopup from '@/components/operationsMap/FeaturePopup';
import FilterBar from '@/components/operationsMap/FilterBar';

export default function OperationsMap() {
  const isDM = localStorage.getItem('isDM') === 'true';
  const [dmStatus, setDmStatus] = useState(isDM);
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const [showLiveSettings, setShowLiveSettings] = useState(false);

  // Detect reduced motion
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const {
    state, addFeature, updateFeature, deleteFeature,
    toggleLayer, toggleRevealHidden, setUrgencyFilter, exportData, getVisibleFeatures,
  } = useOperationsState(isDM);

  const { settings, updateSettings, activePulses, addPulse } = useLiveLayers();

  const [activeTool, setActiveTool] = useState('place');
  const [activePlaceLayer, setActivePlaceLayer] = useState('poi');
  const [pendingCoords, setPendingCoords] = useState(null);
  const [editingFeature, setEditingFeature] = useState(null);
  const [selectedFeature, setSelectedFeature] = useState(null);

  useEffect(() => {
    const handler = () => setDmStatus(localStorage.getItem('isDM') === 'true');
    window.addEventListener('dm-status-changed', handler);
    return () => window.removeEventListener('dm-status-changed', handler);
  }, []);

  // Demo: add a pulse when a SOS feature is placed (illustrates the system)
  useEffect(() => {
    const handler = (e) => {
      const f = e.detail;
      if (!f) return;
      const PULSE_MAP = {
        sos:      { type: 'SOS',     durationMs: 10000, radiusMiles: 0.8 },
        drops:    { type: 'SUPPLY',  durationMs: 8000,  radiusMiles: 0.6 },
        missions: { type: 'MISSION', durationMs: 9000,  radiusMiles: 1.0 },
      };
      const cfg = PULSE_MAP[f.type];
      if (cfg && f.coords) {
        addPulse({ ...cfg, location: { lng: f.coords[0], lat: f.coords[1] }, strength: 3 });
      }
    };
    window.addEventListener('ops_feature_placed', handler);
    return () => window.removeEventListener('ops_feature_placed', handler);
  }, [addPulse]);

  const handleMapClick = useCallback((coords) => {
    if (!dmStatus) return;
    if (activeTool === 'place') {
      const isPolygon = ['territories', 'fog'].includes(activePlaceLayer);
      if (!isPolygon) { setPendingCoords(coords); setEditingFeature(null); }
    }
    setSelectedFeature(null);
  }, [dmStatus, activeTool, activePlaceLayer]);

  const handleFeatureClick = useCallback((feature) => {
    if (dmStatus && activeTool === 'delete') {
      deleteFeature(feature.type, feature.id);
      setSelectedFeature(null);
      return;
    }
    setSelectedFeature(feature);
  }, [dmStatus, activeTool, deleteFeature]);

  const handleSaveFeature = useCallback((feature) => {
    if (editingFeature) { updateFeature(feature.type, feature.id, feature); }
    else {
      addFeature(feature.type, feature);
      // Dispatch for pulse system
      window.dispatchEvent(new CustomEvent('ops_feature_placed', { detail: feature }));
    }
    setPendingCoords(null); setEditingFeature(null); setSelectedFeature(null);
  }, [editingFeature, addFeature, updateFeature]);

  const handleEditFeature = useCallback(() => {
    setEditingFeature(selectedFeature);
    setPendingCoords(selectedFeature?.coords);
    setSelectedFeature(null);
  }, [selectedFeature]);

  const handleDeleteFeature = useCallback(() => {
    if (selectedFeature) { deleteFeature(selectedFeature.type, selectedFeature.id); setSelectedFeature(null); }
  }, [selectedFeature, deleteFeature]);

  const showModal = (pendingCoords || editingFeature) && dmStatus;

  return (
    <div ref={mapContainerRef} className="fixed inset-0 flex flex-col" style={{ top: 56, background: '#0F1216' }}>
      {/* Top bar */}
      <div className="flex-shrink-0 h-10 border-b flex items-center px-4 gap-3 z-10"
        style={{ background: 'color-mix(in srgb, var(--cc-bg0, #0F1216) 95%, transparent)', borderColor: 'color-mix(in srgb, var(--cc-accent-a, #00E5FF) 15%, transparent)' }}>
        <div className="flex items-center gap-2">
          <Map className="h-4 w-4" style={{ color: 'var(--cc-accent-a, #00E5FF)' }} />
          <span className="text-sm font-mono font-bold tracking-widest uppercase" style={{ color: 'var(--cc-text0, #E6F1FF)' }}>Operations Map</span>
          <Radio className="h-2.5 w-2.5 animate-pulse" style={{ color: 'var(--cc-accent-a, #00E5FF)' }} />
        </div>
        <div className="flex-1" />

        {/* Live layers settings button */}
        <div className="relative">
          <button
            onClick={() => setShowLiveSettings(s => !s)}
            className={cn('flex items-center gap-1.5 px-2.5 h-7 rounded-md text-xs font-mono transition-all')}
            style={{
              background: showLiveSettings ? 'color-mix(in srgb, var(--cc-accent-a) 20%, transparent)' : 'var(--cc-panel1, #202833)',
              color: showLiveSettings ? 'var(--cc-accent-a)' : 'var(--cc-muted)',
              border: `1px solid color-mix(in srgb, var(--cc-accent-a) ${showLiveSettings ? 40 : 15}%, transparent)`,
            }}
          >
            <Zap className="h-3 w-3" />
            <span className="hidden sm:inline">Live Feed</span>
          </button>
          {showLiveSettings && (
            <LiveLayersSettings
              settings={settings}
              onUpdate={updateSettings}
              onClose={() => setShowLiveSettings(false)}
            />
          )}
        </div>

        {/* Mode badge */}
        <div className={cn('flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border font-mono')}
          style={{
            background: dmStatus ? 'color-mix(in srgb, var(--cc-accent-a) 15%, transparent)' : 'var(--cc-panel1, #202833)',
            borderColor: dmStatus ? 'color-mix(in srgb, var(--cc-accent-a) 35%, transparent)' : 'color-mix(in srgb, var(--cc-muted) 30%, transparent)',
            color: dmStatus ? 'var(--cc-accent-a)' : 'var(--cc-muted)',
          }}>
          {dmStatus ? <Shield className="h-3 w-3" /> : <User className="h-3 w-3" />}
          {dmStatus ? 'GM MODE' : 'PLAYER MODE'}
        </div>
        <div className="text-[10px] font-mono hidden sm:block" style={{ color: 'var(--cc-muted, #5F6E80)' }}>
          NYC // FULL THEATER
        </div>
      </div>

      {/* Map area */}
      <div className="flex-1 relative overflow-hidden">
        {/* Mapbox map */}
        <OperationsMapView
          state={state}
          isDM={dmStatus}
          activeTool={activeTool}
          activePlaceLayer={activePlaceLayer}
          getVisibleFeatures={getVisibleFeatures}
          onMapClick={handleMapClick}
          onFeatureClick={handleFeatureClick}
          heatmapSettings={settings.heatmap}
          mapRef={mapRef}
        />

        {/* Live canvas layers (sweep + ambient + pulses) */}
        <LiveLayersCanvas
          settings={settings}
          activePulses={activePulses}
          reducedMotion={reducedMotion}
          mapRef={mapRef}
          containerRef={mapContainerRef}
        />

        {/* Faction heatmap legend */}
        <FactionHeatmapLegend visible={settings.heatmap.enabled && settings.heatmap.showLegend} />

        {/* GM Drawer */}
        {dmStatus && (
          <GMDrawer
            state={state}
            activeTool={activeTool}
            activePlaceLayer={activePlaceLayer}
            onToolChange={setActiveTool}
            onPlaceLayerChange={setActivePlaceLayer}
            onToggleLayer={toggleLayer}
            onToggleRevealHidden={toggleRevealHidden}
            onExport={exportData}
          />
        )}

        {/* Feature popup */}
        {selectedFeature && (
          <FeaturePopup
            feature={selectedFeature}
            isDM={dmStatus}
            activeTool={activeTool}
            onEdit={handleEditFeature}
            onDelete={handleDeleteFeature}
            onClose={() => setSelectedFeature(null)}
          />
        )}

        {/* Filter bar */}
        <FilterBar
          state={state}
          onToggleLayer={toggleLayer}
          urgencyFilter={state.urgencyFilter}
          onUrgencyFilter={setUrgencyFilter}
        />

        {/* Tool hints */}
        {dmStatus && activeTool === 'place' && !showModal && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full px-4 py-2 text-xs font-mono pointer-events-none whitespace-nowrap"
            style={{ background: 'color-mix(in srgb, var(--cc-bg0) 90%, transparent)', border: '1px solid color-mix(in srgb, var(--cc-accent-a) 20%, transparent)', color: 'var(--cc-muted)' }}>
            Click map to place a{' '}
            <span style={{ color: 'var(--cc-accent-a)' }}>{LAYER_TYPES.find(l => l.key === activePlaceLayer)?.label?.replace(/s$/, '')}</span>
          </div>
        )}
        {dmStatus && activeTool === 'delete' && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full px-4 py-2 text-xs font-mono pointer-events-none whitespace-nowrap"
            style={{ background: 'color-mix(in srgb, var(--cc-danger, #FF3B3B) 12%, transparent)', border: '1px solid color-mix(in srgb, var(--cc-danger) 30%, transparent)', color: 'var(--cc-danger, #FF3B3B)' }}>
            Click a marker to delete it
          </div>
        )}
      </div>

      {/* Feature Form Modal */}
      {showModal && (
        <FeatureFormModal
          layerKey={editingFeature?.type || activePlaceLayer}
          coords={pendingCoords}
          existingFeature={editingFeature}
          onSave={handleSaveFeature}
          onClose={() => { setPendingCoords(null); setEditingFeature(null); }}
        />
      )}
    </div>
  );
}