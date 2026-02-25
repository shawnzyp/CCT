import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function BiometricScanner({
  onAuthenticate,
  faction = 'OMNI',
  disabled = false,
  scanDuration = 1800 // 1.8s in ms
}) {
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanError, setScanError] = useState(null);
  const [isComplete, setIsComplete] = useState(false);
  const scanRef = useRef(null);
  const touchStartRef = useRef(null);
  const animationRef = useRef(null);

  // Faction-specific styles
  const factionStyles = {
    OMNI: {
      ringColor: '#00E5FF',
      lineColor: '#00E5FF',
      glowColor: 'rgba(0, 229, 255, 0.4)',
      rippleColor: 'rgba(0, 229, 255, 0.2)',
      scanLabel: 'Biometric Verification Required',
      scanSubtext: 'Tap and Hold to Authenticate',
      errorText: 'Scan Interrupted',
      successText: 'Clearance Level: Authorized',
      fingerStyle: 'wireframe'
    },
    PFV: {
      ringColor: '#FF1744',
      lineColor: '#2196F3',
      glowColor: 'rgba(255, 23, 68, 0.3)',
      rippleColor: 'rgba(33, 150, 243, 0.2)',
      scanLabel: 'Biometric Verification Required',
      scanSubtext: 'Tap and Hold to Authenticate',
      errorText: 'Scan Interrupted',
      successText: 'Vigilance Confirmed',
      fingerStyle: 'gradient'
    },
    GREYLINE: {
      ringColor: '#FF9800',
      lineColor: '#9E9E9E',
      glowColor: 'rgba(255, 152, 0, 0.3)',
      rippleColor: 'rgba(158, 158, 158, 0.2)',
      scanLabel: 'Biometric Verification Required',
      scanSubtext: 'Tap and Hold to Authenticate',
      errorText: 'Access Denied: Retry',
      successText: 'Asset Verified',
      fingerStyle: 'thermal'
    },
    COSMIC: {
      ringColor: '#9C27B0',
      lineColor: '#7C4DFF',
      glowColor: 'rgba(156, 39, 176, 0.3)',
      rippleColor: 'rgba(124, 77, 255, 0.2)',
      scanLabel: 'Biometric Verification Required',
      scanSubtext: 'Tap and Hold to Authenticate',
      errorText: 'Presence Not Recognized',
      successText: 'Presence Recognized',
      fingerStyle: 'energy'
    }
  };

  const style = factionStyles[faction] || factionStyles.OMNI;

  const handleTouchStart = (e) => {
    if (disabled || isComplete) return;
    e.preventDefault();
    touchStartRef.current = Date.now();
    setScanError(null);
    setIsScanning(true);
    setScanProgress(0);

    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / scanDuration, 1);
      setScanProgress(progress);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        // Scan complete
        setIsScanning(false);
        setIsComplete(true);
        setScanProgress(1);
        setTimeout(() => onAuthenticate?.(), 500);
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  };

  const handleTouchEnd = () => {
    if (!isScanning || isComplete) return;

    const elapsed = Date.now() - (touchStartRef.current || Date.now());
    if (elapsed < scanDuration * 0.8) {
      // Released too early
      setIsScanning(false);
      setScanError(true);
      setScanProgress(0);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      setTimeout(() => setScanError(false), 2000);
    }
  };

  const handleMouseDown = (e) => {
    if (disabled || isComplete) return;
    e.preventDefault();
    touchStartRef.current = Date.now();
    setScanError(null);
    setIsScanning(true);
    setScanProgress(0);

    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / scanDuration, 1);
      setScanProgress(progress);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setIsScanning(false);
        setIsComplete(true);
        setScanProgress(1);
        setTimeout(() => onAuthenticate?.(), 500);
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  };

  const handleMouseUp = () => {
    if (!isScanning || isComplete) return;

    const elapsed = Date.now() - (touchStartRef.current || Date.now());
    if (elapsed < scanDuration * 0.8) {
      setIsScanning(false);
      setScanError(true);
      setScanProgress(0);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      setTimeout(() => setScanError(false), 2000);
    }
  };

  useEffect(() => {
    const ref = scanRef.current;
    if (!ref) return;

    ref.addEventListener('touchstart', handleTouchStart);
    ref.addEventListener('touchend', handleTouchEnd);
    ref.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('touchend', handleTouchEnd);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      ref?.removeEventListener('touchstart', handleTouchStart);
      ref?.removeEventListener('touchend', handleTouchEnd);
      ref?.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('mouseup', handleMouseUp);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isScanning, isComplete, disabled]);

  return (
    <div className="flex flex-col items-center justify-center gap-6">
      {/* Fingerprint Pad */}
      <div
        ref={scanRef}
        className={cn(
          'relative w-32 h-40 rounded-2xl cursor-pointer transition-all duration-300',
          disabled || isComplete
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:shadow-lg',
          scanError && 'animate-pulse'
        )}
        style={{
          background: `radial-gradient(ellipse at center, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.6) 100%)`,
          border: `2px solid ${style.lineColor}`,
          boxShadow: `0 0 20px ${style.glowColor}`,
        }}
      >
        {/* Scan Ring */}
        <motion.div
          className="absolute inset-0 rounded-2xl"
          style={{
            border: `2px solid ${style.ringColor}`,
            opacity: scanProgress * 0.8,
          }}
          animate={isScanning ? { rotate: 360 } : {}}
          transition={
            isScanning ? { duration: 2, repeat: Infinity, ease: 'linear' } : {}
          }
        />

        {/* Progress Arc */}
        {scanProgress > 0 && !isComplete && (
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 100 100"
            style={{ transform: 'rotate(-90deg)' }}
          >
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke={style.ringColor}
              strokeWidth="2"
              strokeDasharray={`${Math.PI * 90 * scanProgress} ${Math.PI * 90}`}
              opacity={0.6}
            />
          </svg>
        )}

        {/* Fingerprint Lines */}
        {faction === 'OMNI' && (
          <svg
            className="absolute inset-0 w-full h-full opacity-60"
            viewBox="0 0 100 100"
          >
            {[0, 15, 30, 45, 60, 75].map((offset) => (
              <path
                key={offset}
                d={`M 50 20 Q ${50 + offset / 3} 50, 50 80`}
                fill="none"
                stroke={style.lineColor}
                strokeWidth="0.5"
                opacity={scanProgress * (1 - offset / 100)}
              />
            ))}
          </svg>
        )}

        {/* Success Checkmark */}
        {isComplete && (
          <motion.svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 100 100"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          >
            <path
              d="M 30 50 L 45 65 L 70 35"
              fill="none"
              stroke={style.ringColor}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </motion.svg>
        )}
      </div>

      {/* Status Text */}
      <div className="text-center">
        <motion.p
          className="text-xs font-mono uppercase tracking-widest"
          style={{ color: style.ringColor }}
          animate={isScanning ? { opacity: [0.6, 1, 0.6] } : {}}
          transition={isScanning ? { duration: 1, repeat: Infinity } : {}}
        >
          {scanError ? style.errorText : style.scanLabel}
        </motion.p>
        <p
          className="text-[10px] font-mono uppercase tracking-wider mt-1"
          style={{ color: 'rgba(255,255,255,0.5)' }}
        >
          {isComplete ? style.successText : style.scanSubtext}
        </p>
      </div>

      {/* Progress Bar */}
      <div
        className="w-24 h-1 rounded-full overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.1)' }}
      >
        <motion.div
          className="h-full"
          style={{ background: style.ringColor }}
          animate={{ width: `${scanProgress * 100}%` }}
          transition={{ type: 'tween', duration: 0.05 }}
        />
      </div>
    </div>
  );
}