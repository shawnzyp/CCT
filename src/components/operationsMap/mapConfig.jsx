export const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';

export const MANHATTAN_BOUNDS = [
  [-74.08, 40.66], // SW
  [-73.90, 40.88]  // NE
];

export const MAP_CENTER = [-73.9857, 40.7484]; // Midtown Manhattan
export const MAP_INITIAL_ZOOM = 12;
export const MAP_MIN_ZOOM = 10;
export const MAP_MAX_ZOOM = 18;

export const MAP_STYLE = 'mapbox://styles/mapbox/dark-v11';

export const FACTION_COLORS = {
  aegis:     '#00E5FF',
  phantom:   '#8B5CF6',
  ironwall:  '#F59E0B',
  syndicate: '#EF4444',
  neutral:   '#64748B',
  unknown:   '#334155',
};

export const LAYER_TYPES = [
  { key: 'poi',         label: 'Points of Interest', icon: '📍', color: '#00E5FF' },
  { key: 'missions',    label: 'Mission Markers',     icon: '🎯', color: '#F59E0B' },
  { key: 'safehouses',  label: 'Safehouses',          icon: '🏠', color: '#10B981' },
  { key: 'territories', label: 'Faction Territories', icon: '⚔️',  color: '#8B5CF6' },
  { key: 'fog',         label: 'Event Fog',           icon: '🌫️',  color: '#1E293B' },
  { key: 'drops',       label: 'Supply Drops',        icon: '📦', color: '#F97316' },
  { key: 'sos',         label: 'S.O.S. Calls',        icon: '🆘', color: '#EF4444' },
];

export const URGENCY_COLORS = {
  1: '#64748B',
  2: '#10B981',
  3: '#F59E0B',
  4: '#EF4444',
  5: '#FF0000',
};

export const DEFAULT_OPERATIONS_STATE = {
  mode: 'player',
  visibleLayers: {
    poi: true,
    missions: true,
    safehouses: true,
    territories: true,
    fog: true,
    drops: true,
    sos: true,
  },
  revealHidden: false,
  layers: {
    poi: [],
    missions: [],
    safehouses: [],
    territories: [],
    fog: [],
    drops: [],
    sos: [],
  },
};