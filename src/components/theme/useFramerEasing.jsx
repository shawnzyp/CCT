/**
 * Converts theme motion.easing strings to framer-motion-compatible easing arrays.
 * Framer Motion does NOT accept CSS cubic-bezier() strings — use this everywhere.
 */

const EASING_MAP = {
  'cubic-bezier(0.2, 0.8, 0.2, 1)': [0.2, 0.8, 0.2, 1],
  'cubic-bezier(0.0, 0.0, 0.2, 1)': [0.0, 0.0, 0.2, 1],
  'cubic-bezier(0.4, 0.0, 0.2, 1)': [0.4, 0.0, 0.2, 1],
  'linear': 'linear',
};

/**
 * Returns a framer-motion safe easing value from a theme motion.easing string.
 * Falls back to easeOut if unknown.
 */
export function toFramerEasing(easingString) {
  if (!easingString) return 'easeOut';
  if (Array.isArray(easingString)) return easingString;
  return EASING_MAP[easingString] ?? 'easeOut';
}

/**
 * Hook: returns { fast, med, slow, ease } in framer-motion-safe formats.
 */
import { useTheme } from './useTheme';

export function useMotion() {
  const { theme } = useTheme();
  const m = theme?.motion || {};
  return {
    fast: (m.fast || 120) / 1000,
    med: (m.med || 220) / 1000,
    slow: (m.slow || 420) / 1000,
    ease: toFramerEasing(m.easing),
  };
}