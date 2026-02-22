import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import {
  MANHATTAN_BOUNDS, MAP_CENTER, MAP_INITIAL_ZOOM,
  MAP_MIN_ZOOM, MAP_MAX_ZOOM, MAP_STYLE,
  FACTION_COLORS,
} from './mapConfig';
import { base44 } from '@/api/base44Client';

const TYPE_EMOJI = {
  poi: '📍', missions: '🎯', safehouses: '🏠',
  drops: '📦', sos: '🆘',
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

function initMap(container, token, onMapClick) {
  mapboxgl.accessToken = token;
  const m = new mapboxgl.Map({
    container,
    style: MAP_STYLE,
    center: MAP_CENTER,
    zoom: MAP_INITIAL_ZOOM,
    minZoom: MAP_MIN_ZOOM,
    maxZoom: MAP_MAX_ZOOM,
    maxBounds: [
      [MANHATTAN_BOUNDS[0][0] - 0.05, MANHATTAN_BOUNDS[0][1] - 0.05],
      [MANHATTAN_BOUNDS[1][0] + 0.05, MANHATTAN_BOUNDS[1][1] + 0.05],
    ],
  });
  m.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-left');
  m.on('click', (e) => onMapClick([e.lngLat.lng, e.lngLat.lat]));
  return m;
}

function addMapLayers(m) {
  // Theater boundary mask
  m.addSource('theater-mask', {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: [{
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [
            [[-180, -90], [180, -90], [180, 90], [-180, 90], [-180, -90]],
            [
              [MANHATTAN_BOUNDS[0][0], MANHATTAN_BOUNDS[0][1]],
              [MANHATTAN_BOUNDS[1][0], MANHATTAN_BOUNDS[0][1]],
              [MANHATTAN_BOUNDS[1][0], MANHATTAN_BOUNDS[1][1]],
              [MANHATTAN_BOUNDS[0][0], MANHATTAN_BOUNDS[1][1]],
              [MANHATTAN_BOUNDS[0][0], MANHATTAN_BOUNDS[0][1]],
            ]
          ]
        }
      }]
    }
  });
  m.addLayer({ id: 'theater-mask-fill', type: 'fill', source: 'theater-mask', paint: { 'fill-color': '#000000', 'fill-opacity': 0.65 } });

  // Territories
  m.addSource('territories', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
  m.addLayer({ id: 'territories-fill', type: 'fill', source: 'territories', paint: { 'fill-color': ['get', 'color'], 'fill-opacity': ['*', ['/', ['get', 'control'], 100], 0.4] } }, 'theater-mask-fill');
  m.addLayer({ id: 'territories-line', type: 'line', source: 'territories', paint: { 'line-color': ['get', 'color'], 'line-width': 2, 'line-opacity': 0.8 } });

  // Fog
  m.addSource('fog', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
  m.addLayer({ id: 'fog-fill', type: 'fill', source: 'fog', paint: { 'fill-color': '#000', 'fill-opacity': 0.55 } });

  // Mission zones
  m.addSource('missions-zones', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
  m.addLayer({ id: 'missions-zones-fill', type: 'fill', source: 'missions-zones', paint: { 'fill-color': '#F59E0B', 'fill-opacity': 0.15 } });
  m.addLayer({ id: 'missions-zones-line', type: 'line', source: 'missions-zones', paint: { 'line-color': '#F59E0B', 'line-width': 2, 'line-dasharray': [4, 2] } });
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
    map.current.getSource('territories')?.setData(toGeoJSON(ter, f => ({ id: f.id, color: FACTION_COLORS[f.faction] || '#64748B', control: f.metadata?.control ?? 50 })));

    const fog = state.visibleLayers.fog ? getVisibleFeatures('fog') : [];
    map.current.getSource('fog')?.setData(toGeoJSON(fog));

    const mz = state.visibleLayers.missions ? getVisibleFeatures('missions') : [];
    map.current.getSource('missions-zones')?.setData(toGeoJSON(mz));
  }, [mapReady, state.layers, state.visibleLayers, state.mode, state.revealHidden]);

  if (tokenError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-950">
        <div className="text-center text-slate-500">
          <div className="text-4xl mb-3">🗺️</div>
          <p className="text-sm">Map unavailable — Mapbox token not configured.</p>
          <p className="text-xs mt-1">Please set MAPBOX_TOKEN in app secrets.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .ops-marker { display:flex; align-items:center; justify-content:center; width:32px; height:32px; background:rgba(15,23,42,0.85); border:2px solid rgba(139,92,246,0.6); border-radius:50%; transition:transform 0.15s; box-shadow:0 0 10px rgba(0,229,255,0.2); }
        .ops-marker:hover { transform:scale(1.2); border-color:#00E5FF; }
        @keyframes ops-pulse-anim { 0%,100%{box-shadow:0 0 6px 2px rgba(239,68,68,0.4);} 50%{box-shadow:0 0 18px 6px rgba(239,68,68,0.8);} }
        .ops-pulse { animation:ops-pulse-anim 1.5s ease-in-out infinite; border-color:#EF4444; }
        .mapboxgl-ctrl-top-left { top:60px !important; }
      `}</style>
      <div ref={mapContainer} className="w-full h-full" />
    </>
  );
}