// ─── CATALYST CORE THEME ENGINE ───────────────────────────────────────────────
// Centralized token system. All UI consumes from here.

export const FACTION_THEMES = {
  omni: {
    id: 'omni',
    name: 'O.M.N.I. Tactical',
    faction: 'O.M.N.I.',
    bootIdent: 'O.M.N.I. FIELD INTERFACE',
    bootStyle: 'typein',
    colors: {
      bg0: '#0F1216',
      bg1: '#141A22',
      panel0: '#1A1F26',
      panel1: '#202833',
      text0: '#E6F1FF',
      text1: '#8EA0B5',
      muted: '#5F6E80',
      accentA: '#00E5FF',
      accentB: '#5CCFFF',
      success: '#00D1B2',
      warning: '#FFC857',
      danger: '#FF3B3B',
    },
    hud: {
      cornerStyle: 'sharp',
      borderStyle: 'hairline',
      dividerStyle: 'segmented',
      glowColor: '#00E5FF',
      glowIntensity: '0 0 12px rgba(0,229,255,0.35)',
      panelRadius: '0.5rem',
      headerTracking: '0.2em',
    },
    background: {
      gridOpacity: 0.04,
      scanlineOpacity: 0.03,
      noiseOpacity: 0,
      gradient: 'linear-gradient(135deg, #0F1216 0%, #141A22 60%, #0d1520 100%)',
    },
    motion: {
      easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
      fast: 120,
      med: 220,
      slow: 420,
    },
    css: {
      '--cc-bg0': '#0F1216',
      '--cc-bg1': '#141A22',
      '--cc-panel0': '#1A1F26',
      '--cc-panel1': '#202833',
      '--cc-text0': '#E6F1FF',
      '--cc-text1': '#8EA0B5',
      '--cc-muted': '#5F6E80',
      '--cc-accent-a': '#00E5FF',
      '--cc-accent-b': '#5CCFFF',
      '--cc-success': '#00D1B2',
      '--cc-warning': '#FFC857',
      '--cc-danger': '#FF3B3B',
      '--cc-glow': '0 0 12px rgba(0,229,255,0.35)',
      '--cc-fast': '120ms',
      '--cc-med': '220ms',
      '--cc-slow': '420ms',
      '--cc-easing': 'cubic-bezier(0.2, 0.8, 0.2, 1)',
    }
  },

  pfv: {
    id: 'pfv',
    name: 'PFV Radiant',
    faction: 'P.F.V.',
    bootIdent: 'PFV VIGILANCE LINK',
    bootStyle: 'fadeslide',
    colors: {
      bg0: '#111C2D',
      bg1: '#162538',
      panel0: '#1E2F46',
      panel1: '#243A57',
      text0: '#F5F9FF',
      text1: '#C6D4E6',
      muted: '#7F93A8',
      accentA: '#F4C95D',
      accentB: '#4DD0FF',
      success: '#4CD964',
      warning: '#FFB703',
      danger: '#FF595E',
    },
    hud: {
      cornerStyle: 'rounded',
      borderStyle: 'soft-gold',
      glowColor: '#F4C95D',
      glowIntensity: '0 0 14px rgba(244,201,93,0.3)',
      panelRadius: '0.75rem',
      headerTracking: '0.15em',
    },
    background: {
      gridOpacity: 0,
      scanlineOpacity: 0,
      noiseOpacity: 0,
      gradient: 'radial-gradient(ellipse at 30% 20%, #1a2d47 0%, #111C2D 60%, #0d1520 100%)',
    },
    motion: {
      easing: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
      fast: 150,
      med: 260,
      slow: 450,
    },
    css: {
      '--cc-bg0': '#111C2D',
      '--cc-bg1': '#162538',
      '--cc-panel0': '#1E2F46',
      '--cc-panel1': '#243A57',
      '--cc-text0': '#F5F9FF',
      '--cc-text1': '#C6D4E6',
      '--cc-muted': '#7F93A8',
      '--cc-accent-a': '#F4C95D',
      '--cc-accent-b': '#4DD0FF',
      '--cc-success': '#4CD964',
      '--cc-warning': '#FFB703',
      '--cc-danger': '#FF595E',
      '--cc-glow': '0 0 14px rgba(244,201,93,0.3)',
      '--cc-fast': '150ms',
      '--cc-med': '260ms',
      '--cc-slow': '450ms',
      '--cc-easing': 'cubic-bezier(0.0, 0.0, 0.2, 1)',
    }
  },

  greyline: {
    id: 'greyline',
    name: 'Greyline Contract',
    faction: 'GREYLINE',
    bootIdent: 'GREYLINE CONTRACT CONSOLE',
    bootStyle: 'hardpop',
    colors: {
      bg0: '#0D0D0D',
      bg1: '#141414',
      panel0: '#1C1C1C',
      panel1: '#242424',
      text0: '#D9D9D9',
      text1: '#9A9A9A',
      muted: '#6E6E6E',
      accentA: '#C9C9C9',
      accentB: '#7F8C8D',
      success: '#27AE60',
      warning: '#E67E22',
      danger: '#C0392B',
    },
    hud: {
      cornerStyle: 'hard',
      borderStyle: 'solid',
      glowColor: '#C9C9C9',
      glowIntensity: 'none',
      panelRadius: '0.25rem',
      headerTracking: '0.25em',
    },
    background: {
      gridOpacity: 0,
      scanlineOpacity: 0,
      noiseOpacity: 0.02,
      gradient: 'linear-gradient(180deg, #0D0D0D 0%, #141414 100%)',
    },
    motion: {
      easing: 'linear',
      fast: 100,
      med: 180,
      slow: 320,
    },
    css: {
      '--cc-bg0': '#0D0D0D',
      '--cc-bg1': '#141414',
      '--cc-panel0': '#1C1C1C',
      '--cc-panel1': '#242424',
      '--cc-text0': '#D9D9D9',
      '--cc-text1': '#9A9A9A',
      '--cc-muted': '#6E6E6E',
      '--cc-accent-a': '#C9C9C9',
      '--cc-accent-b': '#7F8C8D',
      '--cc-success': '#27AE60',
      '--cc-warning': '#E67E22',
      '--cc-danger': '#C0392B',
      '--cc-glow': 'none',
      '--cc-fast': '100ms',
      '--cc-med': '180ms',
      '--cc-slow': '320ms',
      '--cc-easing': 'linear',
    }
  },

  conclave: {
    id: 'conclave',
    name: 'Cosmic Conclave',
    faction: 'CONCLAVE',
    bootIdent: 'CONCLAVE OBSERVATION LAYER',
    bootStyle: 'dissolve',
    colors: {
      bg0: '#0B0F1C',
      bg1: '#10172A',
      panel0: '#182041',
      panel1: '#1F2A5C',
      text0: '#E0E6FF',
      text1: '#A6B4FF',
      muted: '#6F7ACB',
      accentA: '#7C4DFF',
      accentB: '#00E1FF',
      success: '#3ED598',
      warning: '#FFB86C',
      danger: '#FF5370',
    },
    hud: {
      cornerStyle: 'curved',
      borderStyle: 'gradient',
      glowColor: '#7C4DFF',
      glowIntensity: '0 0 16px rgba(124,77,255,0.4)',
      panelRadius: '1rem',
      headerTracking: '0.18em',
    },
    background: {
      gridOpacity: 0,
      scanlineOpacity: 0,
      noiseOpacity: 0,
      gradient: 'radial-gradient(ellipse at 50% 0%, #1a1060 0%, #0B0F1C 55%, #050813 100%)',
    },
    motion: {
      easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
      fast: 160,
      med: 300,
      slow: 500,
    },
    css: {
      '--cc-bg0': '#0B0F1C',
      '--cc-bg1': '#10172A',
      '--cc-panel0': '#182041',
      '--cc-panel1': '#1F2A5C',
      '--cc-text0': '#E0E6FF',
      '--cc-text1': '#A6B4FF',
      '--cc-muted': '#6F7ACB',
      '--cc-accent-a': '#7C4DFF',
      '--cc-accent-b': '#00E1FF',
      '--cc-success': '#3ED598',
      '--cc-warning': '#FFB86C',
      '--cc-danger': '#FF5370',
      '--cc-glow': '0 0 16px rgba(124,77,255,0.4)',
      '--cc-fast': '160ms',
      '--cc-med': '300ms',
      '--cc-slow': '500ms',
      '--cc-easing': 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    }
  }
};

export const DEFAULT_FACTION = 'omni';

export function getTheme(factionId) {
  return FACTION_THEMES[factionId] || FACTION_THEMES[DEFAULT_FACTION];
}

export function applyThemeToDom(theme) {
  const root = document.documentElement;
  Object.entries(theme.css).forEach(([key, val]) => {
    root.style.setProperty(key, val);
  });
  // Apply background
  document.body.style.background = theme.background.gradient;
}