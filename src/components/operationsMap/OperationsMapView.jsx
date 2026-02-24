import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import {
  OPERATIONAL_BOUNDS, OPERATIONAL_POLYGON,
  MAP_CENTER, MAP_INITIAL_ZOOM, MAP_MIN_ZOOM, MAP_MAX_ZOOM, MAP_STYLE,
  FACTION_COLORS,
} from './mapConfig';
import { base44 } from '@/api/base44Client';

const TYPE_EMOJI = {
  poi: '📍', missions: '🎯', safehouses: '🏠',
  drops: '📦', sos: '🆘',
};
const MASK_BG = '#0F1216';

// Faction heatmap colors (independent of theme — faction identity is fixed)
const FACTION_HEAT_COLORS = {
  OMNI:     '#00E5FF',
  PFV:      '#F59E0B',
  GREYLINE: '#64748B',
  CONCLAVE: '#8B5CF6',
  NEUTRAL:  '#334155',
};

function createMarkerEl(feature) {
  const el = document.createElement('div');
  const emoji = TYPE_EMOJI[feature.type] || '📍';
  const isPulse = (
    (feature.type === 'drops' && feature.metadata?.eta_minutes != null && feature.metadata.eta_minutes < 10) ||
    (feature.type === 'sos' && feature.metadata?.urgency >= 4)
  );
  el.innerHTML = `<div class="ops-marker ${isPulse ? 'ops-pulse' : ''}" title="${feature.label}"><span style="font-size:20px;line-height:1">${emoji}</span></div>`;
  el.style.cursor = 'pointer';
  return el;
}

function buildMaskData(polygon) {
  return {
    type: 'FeatureCollection',
    features: [{
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [[-180, -90], [180, -90], [180, 90], [-180, 90], [-180, -90]],
          [...polygon, polygon[0]],
        ]
      }
    }]
  };
}

function initMap(container, token, onMapClick) {
  mapboxgl.accessToken = token;
  const m = new mapboxgl.Map({
    container,
    style: MAP_STYLE,
    center: MAP_CENTER,
    zoom: MAP_INITIAL_ZOOM,
    minZoom: MAP_MIN_ZOOM,
    maxZoom: MAP_MAX_ZOOM,
    maxBounds: OPERATIONAL_BOUNDS,
    scrollZoom: { around: 'cursor' },
    fadeDuration: 200,
    renderWorldCopies: false,
  });
  m.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-left');
  m.on('click', (e) => onMapClick([e.lngLat.lng, e.lngLat.lat]));
  return m;
}

function addMapLayers(m) {
  // ── OUTER MASK ────────────────────────────────────────────────────────────
  m.addSource('op-mask', { type: 'geojson', data: buildMaskData(OPERATIONAL_POLYGON) });
  m.addLayer({
    id: 'op-mask-fill', type: 'fill', source: 'op-mask',
    paint: { 'fill-color': MASK_BG, 'fill-opacity': 1 },
  });

  // ── BOUNDARY LINE ─────────────────────────────────────────────────────────
  m.addSource('op-boundary', {
    type: 'geojson',
    data: { type: 'Feature', geometry: { type: 'Polygon', coordinates: [[...OPERATIONAL_POLYGON, OPERATIONAL_POLYGON[0]]] } },
  });
  m.addLayer({
    id: 'op-boundary-line', type: 'line', source: 'op-boundary',
    paint: { 'line-color': '#00E5FF', 'line-width': 1.5, 'line-opacity': 0.35, 'line-dasharray': [6, 4] },
  });

  // ── FACTION HEATMAP (blend mode default) ─────────────────────────────────
  m.addSource('heatmap-zones', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
  m.addLayer({
    id: 'heatmap-zones-fill', type: 'fill', source: 'heatmap-zones',
    paint: { 'fill-color': ['get', 'color'], 'fill-opacity': ['get', 'opacity'] },
  }, 'op-mask-fill');
  m.addLayer({
    id: 'heatmap-zones-outline', type: 'line', source: 'heatmap-zones',
    paint: { 'line-color': ['get', 'color'], 'line-width': 1.5, 'line-opacity': ['get', 'lineOpacity'] },
    layout: { visibility: 'none' },
  }, 'op-mask-fill');

  // ── FACTION TERRITORIES ───────────────────────────────────────────────────
  m.addSource('territories', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
  m.addLayer({ id: 'territories-fill', type: 'fill', source: 'territories', paint: { 'fill-color': ['get', 'color'], 'fill-opacity': ['*', ['/', ['get', 'control'], 100], 0.4] } }, 'op-mask-fill');
  m.addLayer({ id: 'territories-line', type: 'line', source: 'territories', paint: { 'line-color': ['get', 'color'], 'line-width': 2, 'line-opacity': 0.8 } }, 'op-mask-fill');

  // ── EVENT FOG ─────────────────────────────────────────────────────────────
  m.addSource('fog', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
  m.addLayer({ id: 'fog-fill', type: 'fill', source: 'fog', paint: { 'fill-color': '#000', 'fill-opacity': 0.55 } }, 'op-mask-fill');

  // ── MISSION ZONES ─────────────────────────────────────────────────────────
  m.addSource('missions-zones', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
  m.addLayer({ id: 'missions-zones-fill', type: 'fill', source: 'missions-zones', paint: { 'fill-color': '#F59E0B', 'fill-opacity': 0.15 } }, 'op-mask-fill');
  m.addLayer({ id: 'missions-zones-line', type: 'line', source: 'missions-zones', paint: { 'line-color': '#F59E0B', 'line-width': 2, 'line-dasharray': [4, 2] } }, 'op-mask-fill');
}

// Build heatmap GeoJSON from territory features + settings
function buildHeatmapGeoJSON(territories, heatmapSettings) {
  const { mode, opacity } = heatmapSettings;
  const opF = opacity / 100;

  const features = territories
    .filter(f => f.polygon && f.faction)
    .map(f => {
      const color = FACTION_HEAT_COLORS[f.faction?.toUpperCase()] || FACTION_HEAT_COLORS.NEUTRAL;
      const intensity = f.metadata?.intensity ?? 0.6;
      const fillOpacity = mode === 'outline' ? 0 : opF * intensity * 0.45;
      const lineOpacity = mode === 'outline' ? opF * 0.9 : mode === 'exclusive' ? 0 : opF * 0.6;
      return {
        type: 'Feature',
        geometry: { type: 'Polygon', coordinates: [f.polygon] },
        properties: { color, opacity: fillOpacity, lineOpacity },
      };
    });

  return { type: 'FeatureCollection', features };
}

export default function OperationsMapView({ state, isDM, activeTool, getVisibleFeatures, onMapClick, onFeatureClick, heatmapSettings, mapRef: externalMapRef }) {
  const mapContainer = useRef(null);
  const internalMapRef = useRef(null);
  const markersRef = useRef({});
  const [mapReady, setMapReady] = useState(false);
  const [tokenError, setTokenError] = useState(false);

  // Expose map ref upward so LiveLayersCanvas can project coords
  const setMapRef = (m) => {
    internalMapRef.current = m;
    if (externalMapRef) externalMapRef.current = m;
  };

  useEffect(() => {
    let destroyed = false;
    base44.functions.invoke('getMapToken', {})
      .then((res) => {
        const token = res.data?.token;
        if (!token || destroyed) { setTokenError(true); return; }
        const m = initMap(mapContainer.current, token, onMapClick);
        setMapRef(m);
        m.on('load', () => {
          if (destroyed) return;
          addMapLayers(m);
          setMapReady(true);
        });
      })
      .catch(() => setTokenError(true));

    return () => {
      destroyed = true;
      if (internalMapRef.current) { internalMapRef.current.remove(); internalMapRef.current = null; }
    };
  }, []); // eslint-disable-line

  // Cursor
  useEffect(() => {
    if (!internalMapRef.current) return;
    const canvas = internalMapRef.current.getCanvas();
    if (activeTool === 'place') canvas.style.cursor = 'crosshair';
    else if (activeTool === 'delete') canvas.style.cursor = 'not-allowed';
    else canvas.style.cursor = '';
  }, [activeTool]);

  // Point markers
  useEffect(() => {
    if (!mapReady || !internalMapRef.current) return;
    Object.values(markersRef.current).forEach(m => m.remove());
    markersRef.current = {};
    ['poi', 'missions', 'safehouses', 'drops', 'sos'].forEach(key => {
      if (!state.visibleLayers[key]) return;
      getVisibleFeatures(key).forEach(feature => {
        if (!feature.coords) return;
        const el = createMarkerEl(feature);
        el.addEventListener('click', (e) => { e.stopPropagation(); onFeatureClick(feature); });
        const marker = new mapboxgl.Marker({ element: el }).setLngLat(feature.coords).addTo(internalMapRef.current);
        markersRef.current[feature.id] = marker;
      });
    });
  }, [mapReady, state.layers, state.visibleLayers, state.mode, state.revealHidden, activeTool]);

  // Polygon layers + heatmap
  useEffect(() => {
    if (!mapReady || !internalMapRef.current) return;
    const m = internalMapRef.current;

    const toGeoJSON = (features, colorFn) => ({
      type: 'FeatureCollection',
      features: features.filter(f => f.polygon).map(f => ({
        type: 'Feature',
        geometry: { type: 'Polygon', coordinates: [f.polygon] },
        properties: colorFn ? colorFn(f) : { id: f.id },
      })),
    });

    const ter = state.visibleLayers.territories ? getVisibleFeatures('territories') : [];
    m.getSource('territories')?.setData(toGeoJSON(ter, f => ({ id: f.id, color: FACTION_COLORS[f.faction] || '#64748B', control: f.metadata?.control ?? 50 })));

    const fog = state.visibleLayers.fog ? getVisibleFeatures('fog') : [];
    m.getSource('fog')?.setData(toGeoJSON(fog));

    const mz = state.visibleLayers.missions ? getVisibleFeatures('missions') : [];
    m.getSource('missions-zones')?.setData(toGeoJSON(mz));

    // Heatmap
    const heatVisible = heatmapSettings?.enabled;
    const allTer = getVisibleFeatures('territories');
    if (heatVisible && heatmapSettings) {
      const gj = buildHeatmapGeoJSON(allTer, heatmapSettings);
      m.getSource('heatmap-zones')?.setData(gj);
      // Outline mode: show outline layer, hide fill
      const isOutline = heatmapSettings.mode === 'outline';
      m.setLayoutProperty('heatmap-zones-fill', 'visibility', isOutline ? 'none' : 'visible');
      m.setLayoutProperty('heatmap-zones-outline', 'visibility', 'visible');
    } else {
      m.getSource('heatmap-zones')?.setData({ type: 'FeatureCollection', features: [] });
    }
  }, [mapReady, state.layers, state.visibleLayers, state.mode, state.revealHidden, heatmapSettings]);

  if (tokenError) {
    return (
      <div className="w-full h-full flex items-center justify-center" style={{ background: MASK_BG }}>
        <div className="text-center" style={{ color: 'var(--cc-muted, #5F6E80)' }}>
          <div className="text-4xl mb-3">🗺️</div>
          <p className="text-sm font-mono">Map unavailable — Mapbox token not configured.</p>
          <p className="text-xs mt-1 font-mono">Set MAPBOX_TOKEN in app secrets.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .ops-marker { display:flex; align-items:center; justify-content:center; width:32px; height:32px; background:rgba(15,18,22,0.88); border:2px solid color-mix(in srgb, var(--cc-accent-a, #00E5FF) 55%, transparent); border-radius:50%; transition:transform 0.15s, border-color 0.15s; box-shadow:0 0 10px color-mix(in srgb, var(--cc-accent-a, #00E5FF) 25%, transparent); pointer-events:auto; }
        .ops-marker:hover { transform:scale(1.2); border-color:var(--cc-accent-a, #00E5FF); }
        @keyframes ops-pulse-anim { 0%,100%{box-shadow:0 0 6px 2px rgba(239,68,68,0.4);} 50%{box-shadow:0 0 18px 6px rgba(239,68,68,0.8);} }
        .ops-pulse { animation:ops-pulse-anim 1.5s ease-in-out infinite; border-color:#EF4444; }
        .mapboxgl-ctrl-top-left { top:60px !important; }
        .mapboxgl-ctrl-attrib-inner a[href*="mapbox"] { display:none; }
      `}</style>
      <div ref={mapContainer} className="w-full h-full" style={{ background: MASK_BG }} />
    </>
  );
}