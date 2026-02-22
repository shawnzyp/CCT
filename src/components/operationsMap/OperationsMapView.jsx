import React, { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import {
  MANHATTAN_BOUNDS, MAP_CENTER, MAP_INITIAL_ZOOM,
  MAP_MIN_ZOOM, MAP_MAX_ZOOM, MAP_STYLE,
  FACTION_COLORS, URGENCY_COLORS, LAYER_TYPES,
} from './mapConfig';
import { cn } from '@/lib/utils';
import { base44 } from '@/api/base44Client';

// Marker emoji per type
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
  el.innerHTML = `
    <div class="ops-marker ${isPulse ? 'ops-pulse' : ''}" title="${feature.label}">
      <span style="font-size:20px;line-height:1">${emoji}</span>
    </div>`;
  el.style.cursor = 'pointer';
  return el;
}

export default function OperationsMapView({
  state,
  isDM,
  activeTool,
  activePlaceLayer,
  getVisibleFeatures,
  onMapClick,
  onFeatureClick,
}) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markersRef = useRef({});
  const [mapReady, setMapReady] = useState(false);

  // Init map
  useEffect(() => {
    if (map.current) return;
    mapboxgl.accessToken = MAPBOX_TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
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

    map.current.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-left');

    map.current.on('load', () => {
      // Theater boundary mask (darken outside manhattan)
      map.current.addSource('theater-mask', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [{
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: [[
                [-180, -90], [180, -90], [180, 90], [-180, 90], [-180, -90]
              ], [
                [MANHATTAN_BOUNDS[0][0], MANHATTAN_BOUNDS[0][1]],
                [MANHATTAN_BOUNDS[1][0], MANHATTAN_BOUNDS[0][1]],
                [MANHATTAN_BOUNDS[1][0], MANHATTAN_BOUNDS[1][1]],
                [MANHATTAN_BOUNDS[0][0], MANHATTAN_BOUNDS[1][1]],
                [MANHATTAN_BOUNDS[0][0], MANHATTAN_BOUNDS[0][1]],
              ]]
            }
          }]
        }
      });
      map.current.addLayer({
        id: 'theater-mask-fill',
        type: 'fill',
        source: 'theater-mask',
        paint: { 'fill-color': '#000000', 'fill-opacity': 0.65 },
      });

      // Territory source
      map.current.addSource('territories', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
      map.current.addLayer({
        id: 'territories-fill',
        type: 'fill',
        source: 'territories',
        paint: {
          'fill-color': ['get', 'color'],
          'fill-opacity': ['*', ['/', ['get', 'control'], 100], 0.4],
        },
      }, 'theater-mask-fill');
      map.current.addLayer({
        id: 'territories-line',
        type: 'line',
        source: 'territories',
        paint: {
          'line-color': ['get', 'color'],
          'line-width': 2,
          'line-opacity': 0.8,
        },
      });

      // Fog source
      map.current.addSource('fog', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
      map.current.addLayer({
        id: 'fog-fill',
        type: 'fill',
        source: 'fog',
        paint: { 'fill-color': '#000', 'fill-opacity': 0.55 },
      });

      // Mission zones source
      map.current.addSource('missions-zones', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
      map.current.addLayer({
        id: 'missions-zones-fill',
        type: 'fill',
        source: 'missions-zones',
        paint: { 'fill-color': '#F59E0B', 'fill-opacity': 0.15 },
      });
      map.current.addLayer({
        id: 'missions-zones-line',
        type: 'line',
        source: 'missions-zones',
        paint: { 'line-color': '#F59E0B', 'line-width': 2, 'line-dasharray': [4, 2] },
      });

      setMapReady(true);
    });

    map.current.on('click', (e) => {
      onMapClick([e.lngLat.lng, e.lngLat.lat]);
    });

    return () => { map.current?.remove(); map.current = null; };
  }, []);

  // Update cursor based on tool
  useEffect(() => {
    if (!map.current) return;
    if (activeTool === 'place') {
      map.current.getCanvas().style.cursor = 'crosshair';
    } else if (activeTool === 'delete') {
      map.current.getCanvas().style.cursor = 'not-allowed';
    } else {
      map.current.getCanvas().style.cursor = '';
    }
  }, [activeTool]);

  // Render point markers
  useEffect(() => {
    if (!mapReady || !map.current) return;
    const pointLayers = ['poi', 'missions', 'safehouses', 'drops', 'sos'];

    // Remove old markers
    Object.values(markersRef.current).forEach(m => m.remove());
    markersRef.current = {};

    pointLayers.forEach(key => {
      if (!state.visibleLayers[key]) return;
      const features = getVisibleFeatures(key);
      features.forEach(feature => {
        if (!feature.coords) return;
        const el = createMarkerEl(feature);
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          onFeatureClick(feature);
        });
        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat(feature.coords)
          .addTo(map.current);
        markersRef.current[feature.id] = marker;
      });
    });
  }, [mapReady, state.layers, state.visibleLayers, state.mode, state.revealHidden, activeTool]);

  // Update polygon layers
  useEffect(() => {
    if (!mapReady || !map.current) return;

    // Territories
    const territories = state.visibleLayers.territories
      ? getVisibleFeatures('territories').filter(f => f.polygon)
      : [];
    const terSource = map.current.getSource('territories');
    if (terSource) terSource.setData({
      type: 'FeatureCollection',
      features: territories.map(f => ({
        type: 'Feature',
        geometry: { type: 'Polygon', coordinates: [f.polygon] },
        properties: {
          id: f.id,
          color: FACTION_COLORS[f.faction] || '#64748B',
          control: f.metadata?.control ?? 50,
        },
      })),
    });

    // Fog
    const fog = state.visibleLayers.fog
      ? getVisibleFeatures('fog').filter(f => f.polygon)
      : [];
    const fogSource = map.current.getSource('fog');
    if (fogSource) fogSource.setData({
      type: 'FeatureCollection',
      features: fog.map(f => ({
        type: 'Feature',
        geometry: { type: 'Polygon', coordinates: [f.polygon] },
        properties: { id: f.id },
      })),
    });

    // Mission zones
    const missionZones = state.visibleLayers.missions
      ? getVisibleFeatures('missions').filter(f => f.polygon)
      : [];
    const mzSource = map.current.getSource('missions-zones');
    if (mzSource) mzSource.setData({
      type: 'FeatureCollection',
      features: missionZones.map(f => ({
        type: 'Feature',
        geometry: { type: 'Polygon', coordinates: [f.polygon] },
        properties: { id: f.id },
      })),
    });
  }, [mapReady, state.layers, state.visibleLayers, state.mode, state.revealHidden]);

  return (
    <>
      <style>{`
        .ops-marker {
          display:flex; align-items:center; justify-content:center;
          width:32px; height:32px;
          background:rgba(15,23,42,0.85); border:2px solid rgba(139,92,246,0.6);
          border-radius:50%; transition:transform 0.15s;
          box-shadow:0 0 10px rgba(0,229,255,0.2);
        }
        .ops-marker:hover { transform:scale(1.2); border-color:#00E5FF; }
        @keyframes ops-pulse-anim {
          0%,100%{box-shadow:0 0 6px 2px rgba(239,68,68,0.4);}
          50%{box-shadow:0 0 18px 6px rgba(239,68,68,0.8);}
        }
        .ops-pulse { animation:ops-pulse-anim 1.5s ease-in-out infinite; border-color:#EF4444; }
        .mapboxgl-ctrl-top-left { top:60px !important; }
      `}</style>
      <div ref={mapContainer} className="w-full h-full" />
    </>
  );
}