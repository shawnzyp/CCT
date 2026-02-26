import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Check, AlertCircle } from 'lucide-react';

const STATES = {
  IDLE: 'IDLE',
  ACQUIRING: 'ACQUIRING',
  VERIFYING: 'VERIFYING',
  SUCCESS: 'SUCCESS',
  FAIL: 'FAIL',
  LOCKOUT: 'LOCKOUT'
};

// Fingerprint paths – concentric arch/loop shape, top-to-bottom ordering
const RIDGES = [
  // outermost → innermost, arranged so y increases downward
  "M 18 82 C 18 30, 82 30, 82 82",
  "M 22 82 C 22 34, 78 34, 78 82",
  "M 26 82 C 26 37, 74 37, 74 82",
  "M 30 82 C 30 40, 70 40, 70 82",
  "M 34 82 C 34 43, 66 43, 66 82",
  "M 38 82 C 38 46, 62 46, 62 82",
  "M 42 82 C 42 49, 58 49, 58 82",
  "M 46 82 C 46 52, 54 52, 54 82",
  // whorl centre
  "M 48 60 C 48 56, 52 56, 52 60 C 52 64, 48 64, 48 60",
];

// The "top" of each ridge arch (approximate min-y in the 0-100 viewBox)
const RIDGE_TOPS = [30, 34, 37, 40, 43, 46, 49, 52, 56];

export default function BiometricScanner({
  onAuthenticate,
  faction = 'OMNI',
  disabled = false,
  scanDuration = 2000
}) {
  const [state, setState] = useState(STATES.IDLE);
  const [scanProgress, setScanProgress] = useState(0);
  const [ridgeClarity, setRidgeClarity] = useState(0);
  const [pressure, setPressure] = useState('—');
  const [motionStatus, setMotionStatus] = useState('STABLE');
  const [failCount, setFailCount] = useState(0);
  const [lockoutTime, setLockoutTime] = useState(0);

  const animationRef = useRef(null);
  const stateRef = useRef(state);
  const failCountRef = useRef(failCount);

  useEffect(() => { stateRef.current = state; }, [state]);
  useEffect(() => { failCountRef.current = failCount; }, [failCount]);

  const factionConfig = {
    OMNI:    { accentColor: '#00E5FF', accentBg: 'rgba(0,229,255,0.08)',   labels: { contact:'CONTACT DETECTED', acquiring:'ACQUIRING RIDGES',    verifying:'CLEARANCE LOOKUP',       success:'AUTHORIZED',          interrupt:'SCAN INTERRUPTED', lockout:'LOCKOUT ACTIVE'   }},
    PFV:     { accentColor: '#FF1744', accentBg: 'rgba(255,23,68,0.08)',   labels: { contact:'CONTACT DETECTED', acquiring:'ACQUIRING RIDGES',    verifying:'IDENTITY VERIFICATION',  success:'IDENTITY CONFIRMED',  interrupt:'SCAN INTERRUPTED', lockout:'LOCKOUT ACTIVE'   }},
    GREYLINE:{ accentColor: '#FFA500', accentBg: 'rgba(255,165,0,0.08)',   labels: { contact:'CONTACT DETECTED', acquiring:'SAMPLE COLLECTION',   verifying:'BIOMETRIC ANALYSIS',     success:'ASSET VERIFIED',      interrupt:'SCAN ABORTED',     lockout:'SECURITY LOCKOUT' }},
    COSMIC:  { accentColor: '#9C27B0', accentBg: 'rgba(156,39,176,0.08)', labels: { contact:'PRESENCE DETECTED',acquiring:'SIGNATURE CAPTURE',   verifying:'SIGNATURE MATCH',        success:'PRESENCE RECOGNIZED', interrupt:'CONTACT LOST',     lockout:'PRESENCE DENIED'  }},
  };

  const config = factionConfig[faction] || factionConfig.OMNI;
  const ac = config.accentColor;

  // Lockout countdown
  useEffect(() => {
    if (state !== STATES.LOCKOUT) return;
    if (lockoutTime <= 0) { setState(STATES.IDLE); setFailCount(0); return; }
    const t = setTimeout(() => setLockoutTime(n => n - 1), 1000);
    return () => clearTimeout(t);
  }, [lockoutTime, state]);

  const startScan = useCallback(() => {
    if (disabled || stateRef.current === STATES.SUCCESS || stateRef.current === STATES.LOCKOUT) return;
    setScanProgress(0);
    setRidgeClarity(72);
    setMotionStatus('STABLE');
    setPressure('OK');
    setState(STATES.ACQUIRING);

    const startTime = Date.now();
    const tick = () => {
      const progress = Math.min((Date.now() - startTime) / scanDuration, 1);
      setScanProgress(progress);
      setRidgeClarity(Math.floor(72 + progress * 21));
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(tick);
      } else {
        setState(STATES.VERIFYING);
        setTimeout(() => {
          setState(STATES.SUCCESS);
          setTimeout(() => onAuthenticate?.(), 800);
        }, 700);
      }
    };
    animationRef.current = requestAnimationFrame(tick);
  }, [disabled, scanDuration, onAuthenticate]);

  const endScan = useCallback(() => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    if (stateRef.current === STATES.ACQUIRING) {
      const newFail = failCountRef.current + 1;
      setFailCount(newFail);
      if (newFail >= 3) {
        setState(STATES.LOCKOUT);
        setLockoutTime(30);
      } else {
        setState(STATES.FAIL);
        setTimeout(() => setState(STATES.IDLE), 1500);
      }
    }
  }, []);

  // Attach mouse + touch events
  useEffect(() => {
    const prevent = (e) => e.preventDefault();
    const el = document.getElementById('bio-scan-pad');
    if (!el) return;
    el.addEventListener('mousedown', startScan);
    el.addEventListener('touchstart', startScan, { passive: true });
    el.addEventListener('touchend', endScan, { passive: true });
    el.addEventListener('contextmenu', prevent);
    document.addEventListener('mouseup', endScan);
    return () => {
      el.removeEventListener('mousedown', startScan);
      el.removeEventListener('touchstart', startScan);
      el.removeEventListener('touchend', endScan);
      el.removeEventListener('contextmenu', prevent);
      document.removeEventListener('mouseup', endScan);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [startScan, endScan]);

  const getStatusLabel = () => {
    switch (state) {
      case STATES.ACQUIRING: return config.labels.acquiring;
      case STATES.VERIFYING: return config.labels.verifying;
      case STATES.SUCCESS:   return config.labels.success;
      case STATES.FAIL:      return config.labels.interrupt;
      case STATES.LOCKOUT:   return config.labels.lockout;
      default:               return 'SENSOR READY';
    }
  };

  // Scan-line Y position (0-100 viewBox units), top to bottom
  const scanLineY = scanProgress * 100;

  // A ridge is revealed if the scan line has passed its topmost point
  const isRidgeRevealed = (idx) => scanLineY >= RIDGE_TOPS[idx];
  // Partial opacity for the ridge the scan line is currently crossing
  const ridgeOpacity = (idx) => {
    if (!isRidgeRevealed(idx)) return 0;
    const dist = scanLineY - RIDGE_TOPS[idx];
    return Math.min(dist / 8, 1); // fade in over 8 units
  };

  const isScanning = state === STATES.ACQUIRING;
  const isActive   = [STATES.ACQUIRING, STATES.VERIFYING].includes(state);

  return (
    <div className="flex flex-col items-center justify-center gap-6 select-none">

      {/* ── Scanner Pad ── */}
      <div
        id="bio-scan-pad"
        className={cn(
          'relative w-44 h-52 rounded-3xl transition-all duration-200',
          state === STATES.LOCKOUT ? 'cursor-not-allowed opacity-40' : 'cursor-pointer',
          state === STATES.SUCCESS  ? 'opacity-70' : '',
        )}
        style={{
          background: `linear-gradient(160deg, rgba(10,14,20,0.95) 0%, rgba(5,8,12,0.98) 100%)`,
          border: `1px solid ${[STATES.FAIL, STATES.LOCKOUT].includes(state) ? '#FF3B3B60' : ac + '50'}`,
          boxShadow: isScanning
            ? `inset 0 2px 10px rgba(0,0,0,0.9), 0 0 18px ${ac}30`
            : `inset 0 2px 8px rgba(0,0,0,0.8), 0 0 4px ${ac}15`,
          backdropFilter: 'blur(2px)',
          transition: 'box-shadow 0.3s ease, border-color 0.3s ease',
          userSelect: 'none',
          WebkitUserSelect: 'none',
        }}
      >
        {/* Corner brackets */}
        {[['top-2 left-2','border-l border-t'],['top-2 right-2','border-r border-t'],['bottom-2 left-2','border-l border-b'],['bottom-2 right-2','border-r border-b']].map(([pos, cls],i) => (
          <div key={i} className={`absolute w-3 h-3 ${pos} ${cls}`} style={{ borderColor: ac + '70' }} />
        ))}

        {/* Label */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 text-[7px] font-mono uppercase tracking-[0.25em]" style={{ color: ac + '55' }}>
          BIO-SENSOR
        </div>

        {/* Fingerprint SVG */}
        <svg
          className="absolute left-1/2 -translate-x-1/2"
          style={{ top: '18%', width: '70%', height: '60%', overflow: 'visible' }}
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Glow filter */}
            <filter id="ridgeGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>

          {/* Ghost / dim print always visible in idle */}
          {state === STATES.IDLE && RIDGES.map((d, i) => (
            <path key={`ghost-${i}`} d={d} fill="none" stroke={ac} strokeWidth="0.7" opacity="0.08" strokeLinecap="round" />
          ))}

          {/* Revealed ridges — top-to-bottom progressive */}
          {(isActive || state === STATES.SUCCESS) && RIDGES.map((d, i) => {
            const opacity = state === STATES.SUCCESS ? 0.85 : ridgeOpacity(i);
            return (
              <path
                key={`ridge-${i}`}
                d={d}
                fill="none"
                stroke={ac}
                strokeWidth="1"
                strokeLinecap="round"
                opacity={opacity}
                filter={opacity > 0.5 ? 'url(#ridgeGlow)' : undefined}
                style={{ transition: 'opacity 0.15s ease' }}
              />
            );
          })}

          {/* Scan sweep line */}
          {isScanning && (
            <line
              x1="10" y1={scanLineY} x2="90" y2={scanLineY}
              stroke={ac}
              strokeWidth="0.6"
              opacity="0.7"
              strokeDasharray="4 3"
            />
          )}

          {/* Scan glow band */}
          {isScanning && (
            <rect
              x="10" y={Math.max(0, scanLineY - 6)}
              width="80" height="10"
              fill={`url(#sweepGrad)`}
              opacity="0.18"
            />
          )}

          {isScanning && (
            <defs>
              <linearGradient id="sweepGrad" x1="0" y1="0" x2="0" y2="1" gradientUnits="userSpaceOnUse"
                gradientTransform={`translate(0,${Math.max(0,scanLineY-6)})`}>
                <stop offset="0%" stopColor={ac} stopOpacity="0" />
                <stop offset="50%" stopColor={ac} stopOpacity="1" />
                <stop offset="100%" stopColor={ac} stopOpacity="0" />
              </linearGradient>
            </defs>
          )}
        </svg>

        {/* Progress ring */}
        {isScanning && (
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="50" cy="50" r="47" fill="none" stroke={ac} strokeWidth="0.8"
              strokeDasharray={`${Math.PI * 94 * scanProgress} ${Math.PI * 94}`} opacity="0.35" />
          </svg>
        )}

        {/* Percent */}
        {isActive && (
          <motion.div
            className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] font-mono font-bold tracking-widest"
            style={{ color: ac }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          >
            {state === STATES.ACQUIRING ? `${Math.floor(scanProgress * 100)}%` : '···'}
          </motion.div>
        )}

        {/* Success */}
        <AnimatePresence>
          {state === STATES.SUCCESS && (
            <motion.div className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.4 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
              <Check className="w-14 h-14" style={{ color: ac }} strokeWidth={1.2} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Fail */}
        <AnimatePresence>
          {state === STATES.FAIL && (
            <motion.div className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.4 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
              <AlertCircle className="w-12 h-12 text-red-500" strokeWidth={1.2} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Telemetry */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            className="w-56 p-2.5 rounded-lg border text-[10px] font-mono space-y-1"
            style={{ borderColor: ac + '40', background: config.accentBg }}
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
          >
            {[['RIDGE CLARITY', `${ridgeClarity}%`], ['PRESSURE', pressure], ['MOTION', motionStatus]].map(([label, val]) => (
              <div key={label} className="flex justify-between">
                <span style={{ color: ac + '70' }}>{label}:</span>
                <span style={{ color: ac }}>{val}</span>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status */}
      <motion.div className="text-center" key={state} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="text-xs font-mono uppercase tracking-[0.15em] font-bold" style={{ color: ac }}>
          {getStatusLabel()}
        </div>
        {state === STATES.IDLE    && <div className="text-[9px] font-mono mt-1" style={{ color: ac + '60' }}>CLICK AND HOLD · TAP AND HOLD</div>}
        {state === STATES.FAIL    && <div className="text-[9px] font-mono mt-1 text-red-400">HOLD STEADY</div>}
        {state === STATES.LOCKOUT && <div className="text-[9px] font-mono mt-1 text-red-400">{lockoutTime}s</div>}
        {state === STATES.SUCCESS && <div className="text-[9px] font-mono mt-1" style={{ color: ac }}>SESSION: ACTIVE</div>}
      </motion.div>
    </div>
  );
}