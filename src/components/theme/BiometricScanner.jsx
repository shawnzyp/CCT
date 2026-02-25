import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Check, AlertCircle } from 'lucide-react';

// States
const STATES = {
  IDLE: 'IDLE',
  CONTACT: 'CONTACT',
  ACQUIRING: 'ACQUIRING',
  VERIFYING: 'VERIFYING',
  SUCCESS: 'SUCCESS',
  FAIL: 'FAIL',
  LOCKOUT: 'LOCKOUT'
};

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
  const [motion, setMotion] = useState('STABLE');
  const [failCount, setFailCount] = useState(0);
  const [lockoutTime, setLockoutTime] = useState(0);
  
  const scanRef = useRef(null);
  const touchStartRef = useRef(null);
  const animationRef = useRef(null);
  const lockoutTimerRef = useRef(null);

  // Faction-specific config
  const factionConfig = {
    OMNI: {
      accentColor: '#00E5FF',
      accentBg: 'rgba(0, 229, 255, 0.1)',
      labels: {
        contact: 'CONTACT DETECTED',
        acquiring: 'ACQUIRING RIDGES',
        verifying: 'CLEARANCE LOOKUP',
        success: 'AUTHORIZED',
        interrupt: 'SCAN INTERRUPTED',
        fail: 'MATCH FAILED',
        lockout: 'LOCKOUT ACTIVE'
      }
    },
    PFV: {
      accentColor: '#FF1744',
      accentBg: 'rgba(255, 23, 68, 0.1)',
      labels: {
        contact: 'CONTACT DETECTED',
        acquiring: 'ACQUIRING RIDGES',
        verifying: 'IDENTITY VERIFICATION',
        success: 'IDENTITY CONFIRMED',
        interrupt: 'SCAN INTERRUPTED',
        fail: 'IDENTITY UNKNOWN',
        lockout: 'LOCKOUT ACTIVE'
      }
    },
    GREYLINE: {
      accentColor: '#FFA500',
      accentBg: 'rgba(255, 165, 0, 0.1)',
      labels: {
        contact: 'CONTACT DETECTED',
        acquiring: 'SAMPLE COLLECTION',
        verifying: 'BIOMETRIC ANALYSIS',
        success: 'ASSET VERIFIED',
        interrupt: 'SCAN ABORTED',
        fail: 'VERIFICATION FAILED',
        lockout: 'SECURITY LOCKOUT'
      }
    },
    COSMIC: {
      accentColor: '#9C27B0',
      accentBg: 'rgba(156, 39, 176, 0.1)',
      labels: {
        contact: 'PRESENCE DETECTED',
        acquiring: 'SIGNATURE CAPTURE',
        verifying: 'SIGNATURE MATCH',
        success: 'PRESENCE RECOGNIZED',
        interrupt: 'CONTACT LOST',
        fail: 'SIGNATURE MISMATCH',
        lockout: 'PRESENCE DENIED'
      }
    }
  };

  const config = factionConfig[faction] || factionConfig.OMNI;

  // Lockout timer
  useEffect(() => {
    if (state === STATES.LOCKOUT && lockoutTime > 0) {
      const timer = setTimeout(() => setLockoutTime(t => t - 1), 1000);
      return () => clearTimeout(timer);
    }
    if (lockoutTime === 0 && state === STATES.LOCKOUT) {
      setState(STATES.IDLE);
      setFailCount(0);
    }
  }, [lockoutTime, state]);

  const handleScanStart = () => {
    if (disabled || state === STATES.SUCCESS || state === STATES.LOCKOUT) return;
    
    touchStartRef.current = Date.now();
    setState(STATES.CONTACT);
    setScanProgress(0);
    setRidgeClarity(0);
    setMotion('STABLE');
    setPressure('OK');

    // Simulate telemetry
    let clarity = 0;
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / scanDuration, 1);

      setScanProgress(progress);
      setRidgeClarity(Math.floor(72 + progress * 21)); // 72% → 93%

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setState(STATES.VERIFYING);
        // Simulate verification
        setTimeout(() => {
          setState(STATES.SUCCESS);
          setTimeout(() => onAuthenticate?.(), 800);
        }, 700);
      }
    };

    setState(STATES.ACQUIRING);
    animationRef.current = requestAnimationFrame(animate);
  };

  const handleScanEnd = () => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);

    if (state === STATES.ACQUIRING) {
      // Early release = interrupted
      setState(STATES.FAIL);
      setFailCount(f => f + 1);
      
      if (failCount + 1 >= 3) {
        setState(STATES.LOCKOUT);
        setLockoutTime(30);
      } else {
        setTimeout(() => setState(STATES.IDLE), 1500);
      }
    }
  };

  useEffect(() => {
    const ref = scanRef.current;
    if (!ref) return;

    ref.addEventListener('mousedown', handleScanStart);
    ref.addEventListener('touchstart', handleScanStart);
    document.addEventListener('mouseup', handleScanEnd);
    document.addEventListener('touchend', handleScanEnd);

    return () => {
      ref?.removeEventListener('mousedown', handleScanStart);
      ref?.removeEventListener('touchstart', handleScanStart);
      document.removeEventListener('mouseup', handleScanEnd);
      document.removeEventListener('touchend', handleScanEnd);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [disabled, state, failCount]);

  const getStatusLabel = () => {
    switch (state) {
      case STATES.CONTACT: return config.labels.contact;
      case STATES.ACQUIRING: return config.labels.acquiring;
      case STATES.VERIFYING: return config.labels.verifying;
      case STATES.SUCCESS: return config.labels.success;
      case STATES.FAIL: return config.labels.interrupt;
      case STATES.LOCKOUT: return config.labels.lockout;
      default: return 'SENSOR READY';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-8">
      {/* Scanner Pad */}
      <div
        ref={scanRef}
        className={cn(
          'relative w-40 h-48 rounded-3xl cursor-pointer transition-all duration-200 min-h-[176px]',
          state === STATES.SUCCESS ? 'opacity-60' : 'hover:opacity-90',
          state === STATES.LOCKOUT ? 'opacity-40 cursor-not-allowed' : '',
          [STATES.FAIL, STATES.LOCKOUT].includes(state) && 'border-red-500/40'
        )}
        style={{
          background: `linear-gradient(135deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.3) 100%)`,
          border: `1px solid ${config.accentColor}40`,
          boxShadow: `inset 0 2px 8px rgba(0,0,0,0.8), 0 0 1px ${config.accentColor}20`,
          backdropFilter: 'blur(1px)'
        }}
      >
        {/* Corner Marks */}
        <div className="absolute top-2 left-2 w-3 h-3 border-l border-t" style={{ borderColor: config.accentColor + '60' }} />
        <div className="absolute top-2 right-2 w-3 h-3 border-r border-t" style={{ borderColor: config.accentColor + '60' }} />
        <div className="absolute bottom-2 left-2 w-3 h-3 border-l border-b" style={{ borderColor: config.accentColor + '60' }} />
        <div className="absolute bottom-2 right-2 w-3 h-3 border-r border-b" style={{ borderColor: config.accentColor + '60' }} />

        {/* Sensor Label */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 text-[8px] font-mono uppercase tracking-[0.2em]" style={{ color: config.accentColor + '50' }}>
          SENSOR
        </div>

        {/* Fingerprint SVG */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="fingerprintGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: config.accentColor, stopOpacity: 0.3 }} />
              <stop offset="100%" style={{ stopColor: config.accentColor, stopOpacity: 0.8 }} />
            </linearGradient>
          </defs>

          {/* Ridge Lines - Progressive Reveal */}
          {[10, 20, 30, 40, 50, 60, 70, 80, 90].map((y, idx) => {
            const isRevealed = scanProgress > (idx / 9);
            return (
              <motion.path
                key={`ridge-${y}`}
                d={`M 20 ${y} Q 50 ${y - 5}, 80 ${y}`}
                fill="none"
                stroke={config.accentColor}
                strokeWidth="0.8"
                initial={{ opacity: 0, pathLength: 0 }}
                animate={isRevealed ? { opacity: 1, pathLength: 1 } : { opacity: 0, pathLength: 0 }}
                transition={{ duration: 0.3 }}
              />
            );
          })}

          {/* Center Whorl */}
          <motion.circle
            cx="50"
            cy="50"
            r="8"
            fill="none"
            stroke={config.accentColor}
            strokeWidth="0.5"
            initial={{ opacity: 0, r: 5 }}
            animate={scanProgress > 0.3 ? { opacity: 0.6, r: 8 } : { opacity: 0, r: 5 }}
            transition={{ type: 'tween' }}
          />
        </svg>

        {/* Success Checkmark */}
        <AnimatePresence>
          {state === STATES.SUCCESS && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
            >
              <Check className="w-12 h-12" style={{ color: config.accentColor }} strokeWidth={1.5} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Failure Icon */}
        <AnimatePresence>
          {state === STATES.FAIL && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
            >
              <AlertCircle className="w-12 h-12 text-red-500" strokeWidth={1.5} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress Ring (Acquiring State) */}
        {state === STATES.ACQUIRING && (
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
            <circle
              cx="50"
              cy="50"
              r="46"
              fill="none"
              stroke={config.accentColor}
              strokeWidth="1"
              strokeDasharray={`${Math.PI * 92 * scanProgress} ${Math.PI * 92}`}
              opacity="0.4"
            />
          </svg>
        )}

        {/* Percentage Counter - Acquiring */}
        {[STATES.ACQUIRING, STATES.VERIFYING].includes(state) && (
          <motion.div
            className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center text-xs font-mono font-bold tracking-wider"
            style={{ color: config.accentColor }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {state === STATES.ACQUIRING ? `${Math.floor(scanProgress * 100)}%` : '...'}
          </motion.div>
        )}
      </div>

      {/* Telemetry Readout */}
      {[STATES.CONTACT, STATES.ACQUIRING, STATES.VERIFYING].includes(state) && (
        <motion.div
          className="w-56 p-2.5 rounded-lg border text-xs font-mono space-y-1"
          style={{ borderColor: config.accentColor + '40', background: config.accentBg }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
        >
          <div className="flex justify-between">
            <span style={{ color: config.accentColor + '80' }}>RIDGE CLARITY:</span>
            <span style={{ color: config.accentColor }}>{ridgeClarity}%</span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: config.accentColor + '80' }}>PRESSURE:</span>
            <span style={{ color: config.accentColor }}>{pressure}</span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: config.accentColor + '80' }}>MOTION:</span>
            <span style={{ color: config.accentColor }}>{motion}</span>
          </div>
        </motion.div>
      )}

      {/* Status Label */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        key={state}
      >
        <div className="text-xs font-mono uppercase tracking-[0.15em] font-bold" style={{ color: config.accentColor }}>
          {getStatusLabel()}
        </div>
        {state === STATES.IDLE && (
          <div className="text-[10px] font-mono mt-1" style={{ color: config.accentColor + '70' }}>
            TAP AND HOLD
          </div>
        )}
        {state === STATES.FAIL && (
          <div className="text-[10px] font-mono mt-1 text-red-500">
            HOLD STEADY
          </div>
        )}
        {state === STATES.LOCKOUT && (
          <div className="text-[10px] font-mono mt-1 text-red-500">
            {lockoutTime}s
          </div>
        )}
        {state === STATES.SUCCESS && (
          <div className="text-[10px] font-mono mt-1" style={{ color: config.accentColor }}>
            SESSION: ACTIVE
          </div>
        )}
      </motion.div>
    </div>
  );
}