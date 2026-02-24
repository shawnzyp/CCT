import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import {
  OPERATIONAL_BOUNDS, OPERATIONAL_POLYGON,
  MAP_CENTER, MAP_INITIAL_ZOOM, MAP_MIN_ZOOM, MAP_MAX_ZOOM, MAP_STYLE,
  FACTION_COLORS,
} from './mapConfig.js';
import { base44 } from '@/api/base44Client';

const TYPE_EMOJI = {
  poi: '📍', missions: '🎯', safehouses: '🏠',
  drops: '📦', sos: '🆘',
};

// Background color to match app bg – hard mask edge blends cleanly
const MASK_BG = '#0F1216';

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

// World-minus-polygon: everything OUTSIDE the operational polygon becomes the mask
function buildMaskData(polygon) {
  return {
    type: 'FeatureCollection',
    features: [{
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        // Outer ring = full world; inner ring = operational zone (hole = visible area)
        coordinates: [
          // World bounding box
          [[-180, -90], [180, -90], [180, 90], [-180, 90], [-180, -90]],
          // Operational polygon (hole) — counter-clockwise winding
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
    // Hard pan lock — cannot pan beyond operational region
    maxBounds: OPERATIONAL_BOUNDS,
    // Smooth zoom
    scrollZoom: { around: 'cursor' },
    fadeDuration: 200,
    // Ensure tiles load only what's needed
    renderWorldCopies: false,
  });

  m.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-left');
  m.on('click', (e) => onMapClick([e.lngLat.lng, e.lngLat.lat]));
  return m;
}

function addMapLayers(m) {
  // ── OUTER MASK (hard clip — covers everything outside operational polygon) ──
  m.addSource('op-mask', {
    type: 'geojson',
    data: buildMaskData(OPERATIONAL_POLYGON),
  });
  m.addLayer({
    id: 'op-mask-fill',
    type: 'fill',
    source: 'op-mask',
    paint: {
      'fill-color': MASK_BG,
      'fill-opacity': 1,     // HARD mask, not dimmed
    },
  });

  // ── OPERATIONAL BOUNDARY LINE (clean edge indicator) ─────────────────────
  m.addSource('op-boundary', {
    type: 'geojson',
    data: {
      type: 'Feature',
      geometry: { type: 'Polygon', coordinates: [[...OPERATIONAL_POLYGON, OPERATIONAL_POLYGON[0]]] },
    },
  });
  m.addLayer({
    id: 'op-boundary-line',
    type: 'line',
    source: 'op-boundary',
    paint: {
      'line-color': '#00E5FF',
      'line-width': 1.5,
      'line-opacity': 0.35,
      'line-dasharray': [6, 4],
    },
  });

  // ── FACTION TERRITORIES ───────────────────────────────────────────────────
  m.addSource('territories', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
  m.addLayer({
    id: 'territories-fill', type: 'fill', source: 'territories',
    paint: {
      'fill-color': ['get', 'color'],
      'fill-opacity': ['*', ['/', ['get', 'control'], 100], 0.4],
    }
  }, 'op-mask-fill'); // render BELOW mask so they stay inside boundary visually
  m.addLayer({
    id: 'territories-line', type: 'line', source: 'territories',
    paint: { 'line-color': ['get', 'color'], 'line-width': 2, 'line-opacity': 0.8 },
  }, 'op-mask-fill');

  // ── EVENT FOG ─────────────────────────────────────────────────────────────
  m.addSource('fog', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
  m.addLayer({
    id: 'fog-fill', type: 'fill', source: 'fog',
    paint: { 'fill-color': '#000', 'fill-opacity': 0.55 },
  }, 'op-mask-fill');

  // ── MISSION ZONES ─────────────────────────────────────────────────────────
  m.addSource('missions-zones', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
  m.addLayer({
    id: 'missions-zones-fill', type: 'fill', source: 'missions-zones',
    paint: { 'fill-color': '#F59E0B', 'fill-opacity': 0.15 },
  }, 'op-mask-fill');
  m.addLayer({
    id: 'missions-zones-line', type: 'line', source: 'missions-zones',
    paint: { 'line-color': '#F59E0B', 'line-width': 2, 'line-dasharray': [4, 2] },
  }, 'op-mask-fill');
}

export default function OperationsMapView({ state, isDM, activeTool, getVisibleFeatures, onMapClick, onFeatureClick }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markersRef = useRef({});
  const [mapReady, setMapReady] = useState(false);
  const [tokenError, setTokenError] = useState(false);

  // Init map once
  useEffect(() => {
    let destroyed = false;
    base44.functions.invoke('getMapToken', {})
      .then((res) => {
        const token = res.data?.token;
        if (!token || destroyed) { setTokenError(true); return; }
        const m = initMap(mapContainer.current, token, onMapClick);
        map.current = m;
        m.on('load', () => {
          if (destroyed) return;
          addMapLayers(m);
          setMapReady(true);
        });
      })
      .catch(() => setTokenError(true));

    return () => {
      destroyed = true;
      if (map.current) { map.current.remove(); map.current = null; }
    };
  }, []); // eslint-disable-line

  // Cursor style
  useEffect(() => {
    if (!map.current) return;
    const canvas = map.current.getCanvas();
    if (activeTool === 'place') canvas.style.cursor = 'crosshair';
    else if (activeTool === 'delete') canvas.style.cursor = 'not-allowed';
    else canvas.style.cursor = '';
  }, [activeTool]);

  // Point markers
  useEffect(() => {
    if (!mapReady || !map.current) return;
    Object.values(markersRef.current).forEach(m => m.remove());
    markersRef.current = {};
    ['poi', 'missions', 'safehouses', 'drops', 'sos'].forEach(key => {
      if (!state.visibleLayers[key]) return;
      getVisibleFeatures(key).forEach(feature => {
        if (!feature.coords) return;
        const el = createMarkerEl(feature);
        el.addEventListener('click', (e) => { e.stopPropagation(); onFeatureClick(feature); });
        const marker = new mapboxgl.Marker({ element: el }).setLngLat(feature.coords).addTo(map.current);
        markersRef.current[feature.id] = marker;
      });
    });
  }, [mapReady, state.layers, state.visibleLayers, state.mode, state.revealHidden, activeTool]);

  // Polygon layers
  useEffect(() => {
    if (!mapReady || !map.current) return;

    const toGeoJSON = (features, colorFn) => ({
      type: 'FeatureCollection',
      features: features.filter(f => f.polygon).map(f => ({
        type: 'Feature',
        geometry: { type: 'Polygon', coordinates: [f.polygon] },
        properties: colorFn ? colorFn(f) : { id: f.id },
      })),
    });

    const ter = state.visibleLayers.territories ? getVisibleFeatures('territories') : [];
    map.current.getSource('territories')?.setData(toGeoJSON(ter, f => ({
      id: f.id,
      color: FACTION_COLORS[f.faction] || '#64748B',
      control: f.metadata?.control ?? 50,
    })));

    const fog = state.visibleLayers.fog ? getVisibleFeatures('fog') : [];
    map.current.getSource('fog')?.setData(toGeoJSON(fog));

    const mz = state.visibleLayers.missions ? getVisibleFeatures('missions') : [];
    map.current.getSource('missions-zones')?.setData(toGeoJSON(mz));
  }, [mapReady, state.layers, state.visibleLayers, state.mode, state.revealHidden]);

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
        .ops-marker {
          display: flex; align-items: center; justify-content: center;
          width: 32px; height: 32px;
          background: rgba(15,18,22,0.88);
          border: 2px solid color-mix(in srgb, var(--cc-accent-a, #00E5FF) 55%, transparent);
          border-radius: 50%;
          transition: transform 0.15s, border-color 0.15s;
          box-shadow: 0 0 10px color-mix(in srgb, var(--cc-accent-a, #00E5FF) 25%, transparent);
          pointer-events: auto;
        }
        .ops-marker:hover { transform: scale(1.2); border-color: var(--cc-accent-a, #00E5FF); }
        @keyframes ops-pulse-anim {
          0%,100% { box-shadow: 0 0 6px 2px rgba(239,68,68,0.4); }
          50%      { box-shadow: 0 0 18px 6px rgba(239,68,68,0.8); }
        }
        .ops-pulse { animation: ops-pulse-anim 1.5s ease-in-out infinite; border-color: #EF4444; }
        .mapboxgl-ctrl-top-left { top: 60px !important; }
        /* Hide Mapbox attribution branding */
        .mapboxgl-ctrl-attrib-inner a[href*="mapbox"] { display: none; }
      `}</style>
      <div ref={mapContainer} className="w-full h-full" style={{ background: MASK_BG }} />
    </>
  );
}