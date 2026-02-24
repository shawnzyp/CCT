// ── CATALYST CORE: OPERATIONS MAP CONFIG ─────────────────────────────────
// Theater: NYC 5 boroughs + Long Island + ~50-mile Atlantic maritime zone

// Manhattan center – operational core
export const MAP_CENTER = [-73.9857, 40.7484];
export const MAP_INITIAL_ZOOM = 12;
export const MAP_MIN_ZOOM = 8;   // allows zooming out to see full 50-mile maritime zone
export const MAP_MAX_ZOOM = 18;

// Hard maxBounds: prevents panning beyond the full operational region
// SW: far enough to include 50-mile Atlantic zone west/south
// NE: covers eastern tip of Long Island + 50-mile buffer
export const OPERATIONAL_BOUNDS = [
  [-74.65, 40.35], // SW — includes lower NY bay, NJ coast buffer
  [-71.50, 41.35], // NE — eastern Long Island tip + 50-mile Atlantic zone
];

// MAP_STYLE: Mapbox dark – we override water/land colors via addLayer paints
export const MAP_STYLE = 'mapbox://styles/mapbox/dark-v11';

// ── OPERATIONAL BOUNDARY POLYGON ─────────────────────────────────────────
// This defines the hard clip region. Everything OUTSIDE this polygon is masked.
// Shape covers: Manhattan, all boroughs, Long Island (Nassau + Suffolk),
//               plus ~50-mile Atlantic maritime buffer south + east.
//
// Coordinates are [lng, lat], wound counter-clockwise for the "hole" approach
// (the mask layer uses world polygon minus this shape).

export const OPERATIONAL_POLYGON = [
  // Starting from NW corner (Bronx/Westchester border), going clockwise around the perimeter
  // ── BRONX / YONKERS BORDER (northern edge) ──────────────────────────────
  [-73.94, 40.91],   // NW — Yonkers/Bronx, near Riverdale
  [-73.83, 40.91],   // N Bronx east
  [-73.75, 40.88],   // Pelham Bay / Sound edge

  // ── LONG ISLAND SOUND (north shore of LI) ───────────────────────────────
  [-73.68, 40.92],   // Little Neck Bay / Great Neck
  [-73.55, 40.93],   // Port Washington
  [-73.40, 40.95],   // Oyster Bay area
  [-73.25, 40.97],   // Cold Spring Harbor
  [-73.10, 40.99],   // Northport
  [-72.95, 40.97],   // Huntington
  [-72.75, 40.96],   // Smithtown
  [-72.55, 40.95],   // Stony Brook
  [-72.35, 40.95],   // Port Jefferson
  [-72.15, 40.95],   // Wading River
  [-71.95, 40.95],   // Riverhead
  [-71.80, 41.00],   // Jamesport
  [-71.65, 41.05],   // Greenport / Orient Point area
  [-71.55, 41.10],   // Orient Point tip (north)
  [-71.50, 41.10],   // Far NE tip

  // ── ATLANTIC MARITIME BUFFER: 50-mile sweep east + south ─────────────────
  [-71.52, 40.90],   // Turn south into Atlantic (east of Montauk)
  [-71.55, 40.65],   // Atlantic 50mi east of Montauk
  [-71.75, 40.40],   // Atlantic SE corner (50-mile zone)
  [-72.00, 40.38],   // Atlantic S — offshore Fire Island
  [-72.30, 40.36],   // Atlantic S — offshore Jones Beach
  [-72.60, 40.35],   // Atlantic S — ~50mi south of Long Island
  [-72.90, 40.35],   // Atlantic S
  [-73.20, 40.36],   // Atlantic S — offshore Rockaway
  [-73.50, 40.38],   // Atlantic S — Sandy Hook area
  [-73.70, 40.40],   // Lower NY Bay, outer
  [-74.05, 40.45],   // Raritan Bay / Staten Island south
  [-74.25, 40.48],   // NJ shore / outer bay

  // ── WESTERN BOUNDARY: NJ shore, through NY Harbor ───────────────────────
  [-74.25, 40.55],   // Perth Amboy / NJ
  [-74.20, 40.63],   // Bayonne / Newark Bay
  [-74.15, 40.68],   // Bayonne, north
  [-74.10, 40.73],   // Jersey City
  [-74.02, 40.78],   // Weehawken / GWB area
  [-73.99, 40.82],   // Fort Lee / Palisades
  [-73.96, 40.87],   // Rockland County border / Spuyten Duyvil
  [-73.94, 40.91],   // Back to start (NW Bronx)
];

// ── FACTION COLORS ────────────────────────────────────────────────────────
export const FACTION_COLORS = {
  aegis:     '#00E5FF',
  phantom:   '#8B5CF6',
  ironwall:  '#F59E0B',
  syndicate: '#EF4444',
  neutral:   '#64748B',
  unknown:   '#334155',
};

// ── LAYER DEFINITIONS ─────────────────────────────────────────────────────
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