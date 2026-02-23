import React, { useState, useEffect } from 'react';
import { Minus, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useSoundEffects from '@/components/sounds/useSoundEffects';
import { useTheme } from '@/components/theme/useTheme';

export default function ResourceBar({
  label,
  current,
  max,
  color, // legacy — now overridden by theme + HP state logic
  onChange,
  showControls = true,
  size = 'default',
  stateColors = true, // use dynamic HP state coloring
}) {
  const { theme } = useTheme();
  const c = theme?.colors || {};
  const { play } = useSoundEffects();
  const [prevValue, setPrevValue] = useState(current);
  const [delta, setDelta] = useState(null);

  const pct = Math.min(100, Math.max(0, ((current || 0) / (max || 1)) * 100));

  // Dynamic state color
  const barColor = stateColors
    ? pct >= 75 ? (c.success || '#00D1B2')
      : pct >= 40 ? (c.warning || '#FFC857')
      : (c.danger || '#FF3B3B')
    : (c.accentA || '#00E5FF');

  const isDangerous = stateColors && pct < 40 && pct > 0;

  useEffect(() => {
    if (current !== prevValue) {
      const isHP = label.toLowerCase().includes('hp') || label.toLowerCase().includes('hit');
      const isSP = label.toLowerCase().includes('sp') || label.toLowerCase().includes('stamina');
      if (current < prevValue) play(isHP ? 'hpLoss' : isSP ? 'spLoss' : 'error', 0.3);
      else if (current > prevValue) play(isHP ? 'hpGain' : isSP ? 'spGain' : 'success', 0.3);
      setDelta(current - prevValue);
      setTimeout(() => setDelta(null), 700);
      setPrevValue(current);
    }
  }, [current]);

  const adjust = (d) => {
    if (!onChange) return;
    play('click', 0.1);
    onChange(Math.min(max, Math.max(0, (current || 0) + d)));
  };

  const accentA = c.accentA || '#00E5FF';
  const text0 = c.text0 || '#E6F1FF';
  const muted = c.muted || '#5F6E80';
  const panel1 = c.panel1 || '#202833';

  return (
    <div className="space-y-1 relative">
      {/* Label row */}
      <div className="flex items-center justify-between gap-2 min-w-0">
        <span
          className="text-[10px] font-mono uppercase tracking-[0.12em] flex-shrink-0"
          style={{ color: barColor }}
        >
          {label}
        </span>
        <div className="relative">
          <span className="text-sm font-mono font-bold" style={{ color: text0 }}>
            {current ?? '—'}/{max ?? '—'}
          </span>
          <AnimatePresence>
            {delta !== null && (
              <motion.span
                key={delta}
                initial={{ opacity: 1, y: 0 }}
                animate={{ opacity: 0, y: -16 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="absolute right-0 -top-4 text-xs font-mono font-bold pointer-events-none"
                style={{ color: delta > 0 ? c.success : c.danger }}
              >
                {delta > 0 ? '+' : ''}{delta}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Bar + controls */}
      <div className="flex items-center gap-1.5">
        {showControls && onChange && (
          <>
            <button
              className="cc-sm-target flex-shrink-0 h-7 w-7 flex items-center justify-center rounded border text-[10px] font-mono font-bold"
              style={{ color: c.danger || '#FF3B3B', borderColor: (c.danger || '#FF3B3B') + '40', background: 'transparent' }}
              onClick={() => adjust(-5)}
              aria-label="Decrease by 5"
            >-5</button>
            <button
              className="cc-sm-target flex-shrink-0 h-7 w-7 flex items-center justify-center rounded border"
              style={{ color: muted, borderColor: accentA + '25', background: 'transparent' }}
              onClick={() => adjust(-1)}
              aria-label="Decrease by 1"
            ><Minus className="h-3 w-3" /></button>
          </>
        )}

        <div className="flex-1 cc-bar-track" style={{ background: 'rgba(255,255,255,0.07)' }}>
          <motion.div
            className="cc-bar-fill"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.35 }}
            style={{
              background: barColor,
              boxShadow: isDangerous ? `0 0 6px ${barColor}80` : 'none',
            }}
          />
        </div>

        {showControls && onChange && (
          <>
            <button
              className="cc-sm-target flex-shrink-0 h-7 w-7 flex items-center justify-center rounded border"
              style={{ color: muted, borderColor: accentA + '25', background: 'transparent' }}
              onClick={() => adjust(1)}
              aria-label="Increase by 1"
            ><Plus className="h-3 w-3" /></button>
            <button
              className="cc-sm-target flex-shrink-0 h-7 w-7 flex items-center justify-center rounded border text-[10px] font-mono font-bold"
              style={{ color: c.success || '#00D1B2', borderColor: (c.success || '#00D1B2') + '40', background: 'transparent' }}
              onClick={() => adjust(5)}
              aria-label="Increase by 5"
            >+5</button>
          </>
        )}
      </div>
    </div>
  );
}