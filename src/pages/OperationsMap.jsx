import React, { useState, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Map, Radio, User, Shield } from 'lucide-react';
import { LAYER_TYPES } from '@/components/operationsMap/mapConfig';
import useOperationsState from '@/components/operationsMap/useOperationsState';
import OperationsMapView from '@/components/operationsMap/OperationsMapView';
import GMDrawer from '@/components/operationsMap/GMDrawer';
import FeatureFormModal from '@/components/operationsMap/FeatureFormModal';
import FeaturePopup from '@/components/operationsMap/FeaturePopup';
import FilterBar from '@/components/operationsMap/FilterBar';

export default function OperationsMap() {
  const isDM = localStorage.getItem('isDM') === 'true';

  const {
    state,
    addFeature,
    updateFeature,
    deleteFeature,
    toggleLayer,
    toggleRevealHidden,
    setUrgencyFilter,
    exportData,
    getVisibleFeatures,
  } = useOperationsState(isDM);

  const [activeTool, setActiveTool] = useState('place');
  const [activePlaceLayer, setActivePlaceLayer] = useState('poi');
  const [pendingCoords, setPendingCoords] = useState(null);
  const [editingFeature, setEditingFeature] = useState(null);
  const [selectedFeature, setSelectedFeature] = useState(null);

  // Listen to DM status changes
  const [dmStatus, setDmStatus] = useState(isDM);
  useEffect(() => {
    const handler = () => setDmStatus(localStorage.getItem('isDM') === 'true');
    window.addEventListener('dm-status-changed', handler);
    return () => window.removeEventListener('dm-status-changed', handler);
  }, []);

  const handleMapClick = useCallback((coords) => {
    if (!dmStatus) return;
    if (activeTool === 'place') {
      const isPolygon = ['territories', 'fog'].includes(activePlaceLayer);
      if (!isPolygon) {
        setPendingCoords(coords);
        setEditingFeature(null);
      }
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
    if (editingFeature) {
      updateFeature(feature.type, feature.id, feature);
    } else {
      addFeature(feature.type, feature);
    }
    setPendingCoords(null);
    setEditingFeature(null);
    setSelectedFeature(null);
  }, [editingFeature, addFeature, updateFeature]);

  const handleEditFeature = useCallback(() => {
    setEditingFeature(selectedFeature);
    setPendingCoords(selectedFeature?.coords);
    setSelectedFeature(null);
  }, [selectedFeature]);

  const handleDeleteFeature = useCallback(() => {
    if (selectedFeature) {
      deleteFeature(selectedFeature.type, selectedFeature.id);
      setSelectedFeature(null);
    }
  }, [selectedFeature, deleteFeature]);

  const showModal = (pendingCoords || editingFeature) && dmStatus;

  return (
    <div className="fixed inset-0 bg-slate-950 flex flex-col" style={{ top: 56 }}>
      {/* Top bar */}
      <div className="flex-shrink-0 h-10 bg-slate-950/90 border-b border-violet-500/20 flex items-center px-4 gap-3 z-10">
        <div className="flex items-center gap-2">
          <Map className="h-4 w-4 text-violet-400" />
          <span className="text-sm font-bold text-white tracking-wider uppercase">Operations Map</span>
          <Radio className="h-2.5 w-2.5 text-cyan-400 animate-pulse" />
        </div>
        <div className="flex-1" />
        <div className={cn(
          "flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border font-mono",
          dmStatus
            ? "bg-violet-500/15 border-violet-500/40 text-violet-300"
            : "bg-slate-800 border-slate-600 text-slate-400"
        )}>
          {dmStatus ? <Shield className="h-3 w-3" /> : <User className="h-3 w-3" />}
          {dmStatus ? 'GM MODE' : 'PLAYER MODE'}
        </div>
        <div className="text-[10px] text-slate-600 font-mono">
          MANHATTAN THEATER
        </div>
      </div>

      {/* Map area */}
      <div className="flex-1 relative overflow-hidden">
        <OperationsMapView
          state={state}
          isDM={dmStatus}
          activeTool={activeTool}
          activePlaceLayer={activePlaceLayer}
          getVisibleFeatures={getVisibleFeatures}
          onMapClick={handleMapClick}
          onFeatureClick={handleFeatureClick}
        />

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

        {/* Tool hint */}
        {dmStatus && activeTool === 'place' && !showModal && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/90 border border-violet-500/30 rounded-full px-4 py-2 text-xs text-slate-400 pointer-events-none whitespace-nowrap">
            Click anywhere on the map to place a{' '}
            <span className="text-violet-300 font-medium">
              {LAYER_TYPES.find(l => l.key === activePlaceLayer)?.label?.replace(/s$/, '')}
            </span>
          </div>
        )}
        {dmStatus && activeTool === 'delete' && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-red-900/90 border border-red-500/30 rounded-full px-4 py-2 text-xs text-red-300 pointer-events-none whitespace-nowrap">
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