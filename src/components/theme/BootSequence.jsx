import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const BOOT_LINES = [
  'BOOT VERIFIED',
  'AUTH LOCAL',
  'BEACON CHECK',
  'UI CALIBRATING',
];

function useReducedMotion() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

// Typein effect for OMNI
function TypeIn({ text, onDone, color }) {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    let i = 0;
    const t = setInterval(() => {
      setDisplayed(text.slice(0, i + 1));
      i++;
      if (i >= text.length) { clearInterval(t); onDone?.(); }
    }, 38);
    return () => clearInterval(t);
  }, [text]);
  return <span style={{ color, fontFamily: 'monospace' }}>{displayed}<span className="animate-pulse">_</span></span>;
}

function BootLine({ text, style, color, delay, accentA }) {
  const [visible, setVisible] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  if (!visible) return null;

  if (style === 'typein') {
    return (
      <div className="flex items-center gap-3 text-xs font-mono">
        <span style={{ color: accentA }}>▸</span>
        <TypeIn text={text} color={color} onDone={() => setDone(true)} />
        {done && <span style={{ color: accentA }} className="text-xs">OK</span>}
      </div>
    );
  }

  if (style === 'hardpop') {
    return (
      <div className="flex items-center gap-3 text-xs font-mono" style={{ color }}>
        <span style={{ color: accentA }}>■</span>
        {text}
        <span style={{ color: accentA }} className="ml-auto">✓</span>
      </div>
    );
  }

  // fadeslide / dissolve
  return (
    <motion.div
      initial={{ opacity: 0, x: style === 'fadeslide' ? -10 : 0 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-center gap-3 text-xs font-mono"
      style={{ color }}
    >
      <span style={{ color: accentA }}>◆</span>
      {text}
      <span style={{ color: accentA }} className="ml-auto">◉</span>
    </motion.div>
  );
}

export default function BootSequence({ theme, onComplete, reducedMotion }) {
  const [phase, setPhase] = useState(0); // 0=black,1=frame,2=ident,3=sync,4=done
  const [skippable, setSkippable] = useState(false);
  const [beaconOnline] = useState(navigator.onLine);
  const skipped = useRef(false);

  const skip = () => {
    if (!skippable || skipped.current) return;
    skipped.current = true;
    setPhase(4);
    setTimeout(() => onComplete?.(), 400);
  };

  useEffect(() => {
    if (reducedMotion) {
      setTimeout(() => { setPhase(4); onComplete?.(); }, 700);
      return;
    }

    const timers = [];
    timers.push(setTimeout(() => setPhase(1), 80));
    timers.push(setTimeout(() => setPhase(2), 480));
    timers.push(setTimeout(() => setSkippable(true), 700));
    timers.push(setTimeout(() => setPhase(3), 1380));
    timers.push(setTimeout(() => setPhase(4), 2080));
    timers.push(setTimeout(() => onComplete?.(), 2680));

    return () => timers.forEach(clearTimeout);
  }, []);

  const { colors, hud, motion: m } = theme;
  const bootStyle = theme.bootStyle;

  if (phase === 4) {
    return (
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed inset-0 z-[9999] pointer-events-none"
        style={{ background: colors.bg0 }}
      />
    );
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center cursor-pointer select-none"
      style={{ background: colors.bg0 }}
      onClick={skip}
    >
      {/* Ambient bg line */}
      {phase >= 1 && (
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
          className="absolute top-0 left-0 right-0 h-px origin-left"
          style={{ background: colors.accentA }}
        />
      )}
      {phase >= 1 && (
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1], delay: 0.05 }}
          className="absolute bottom-0 left-0 right-0 h-px origin-right"
          style={{ background: colors.accentA }}
        />
      )}

      <div className="w-full max-w-sm px-8 space-y-6">
        {/* IDENT */}
        <AnimatePresence>
          {phase >= 2 && (
            <motion.div
              initial={{ opacity: 0, y: bootStyle === 'fadeslide' ? 12 : 0 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: bootStyle === 'hardpop' ? 0.05 : 0.4 }}
              className="space-y-1"
            >
              {/* Faction logo line */}
              <div className="flex items-center gap-2 mb-4">
                <div className="h-px flex-1" style={{ background: colors.accentA, opacity: 0.4 }} />
                <span className="text-[10px] font-mono tracking-[0.3em]" style={{ color: colors.muted }}>
                  {theme.faction}
                </span>
                <div className="h-px flex-1" style={{ background: colors.accentA, opacity: 0.4 }} />
              </div>

              <div className="text-center space-y-1">
                {bootStyle === 'typein' ? (
                  <TypeIn
                    text={theme.bootIdent}
                    color={colors.accentA}
                  />
                ) : (
                  <div className="font-mono font-bold tracking-[0.15em] text-base" style={{ color: colors.accentA }}>
                    {theme.bootIdent}
                  </div>
                )}
                <div className="text-[10px] font-mono tracking-widest" style={{ color: colors.muted }}>
                  CATALYST CORE v2.0 // FIELD EDITION
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Boot lines */}
        {phase >= 2 && (
          <div className="space-y-2 border-l-2 pl-4" style={{ borderColor: colors.accentA + '40' }}>
            {BOOT_LINES.map((line, i) => (
              <BootLine
                key={line}
                text={line}
                style={bootStyle}
                color={colors.text1}
                accentA={colors.accentA}
                delay={i * 180}
              />
            ))}
          </div>
        )}

        {/* Sync status */}
        <AnimatePresence>
          {phase >= 3 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-3 pt-2 border-t"
              style={{ borderColor: colors.accentA + '30' }}
            >
              <div
                className="h-2 w-2 rounded-full"
                style={{
                  background: beaconOnline ? colors.success : colors.warning,
                  boxShadow: `0 0 6px ${beaconOnline ? colors.success : colors.warning}`
                }}
              />
              <span className="text-xs font-mono" style={{ color: beaconOnline ? colors.success : colors.warning }}>
                BEACON {beaconOnline ? 'SYNC ONLINE' : 'OFFLINE'}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Skip hint */}
      {skippable && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute bottom-8 text-[10px] font-mono tracking-widest"
          style={{ color: colors.muted }}
        >
          TAP TO SKIP
        </motion.div>
      )}

      {/* Corner brackets */}
      {['tl', 'tr', 'bl', 'br'].map(pos => (
        <div key={pos} className={cn(
          "absolute w-6 h-6 border-2",
          pos === 'tl' && "top-4 left-4 border-r-0 border-b-0",
          pos === 'tr' && "top-4 right-4 border-l-0 border-b-0",
          pos === 'bl' && "bottom-4 left-4 border-r-0 border-t-0",
          pos === 'br' && "bottom-4 right-4 border-l-0 border-t-0",
        )} style={{ borderColor: colors.accentA + '60' }} />
      ))}
    </div>
  );
}