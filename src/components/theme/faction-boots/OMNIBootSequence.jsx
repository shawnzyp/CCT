import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import BiometricScanner from '../BiometricScanner';
import { useSoundEffects } from '@/components/sounds/useSoundEffects';

export default function OMNIBootSequence({ onComplete, glitchIntensity = 0.3 }) {
  const [phase, setPhase] = useState('grid');
  const { play } = useSoundEffects();

  useEffect(() => {
    if (phase === 'grid') {
      const t = setTimeout(() => {
        play?.('system_startup');
        setPhase('seal');
      }, 2000);
      return () => clearTimeout(t);
    }
    if (phase === 'seal') {
      const t = setTimeout(() => setPhase('readouts'), 1500);
      return () => clearTimeout(t);
    }
    if (phase === 'readouts') {
      const t = setTimeout(() => setPhase('scan'), 2000);
      return () => clearTimeout(t);
    }
  }, [phase, play]);

  return (
    <div className="w-full h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden">
      {/* Grid background */}
      {phase !== 'biometric' && (
        <motion.div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'linear-gradient(rgba(0,229,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.1) 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: phase === 'grid' || phase === 'seal' ? 0.15 : 0 }}
          transition={{ duration: 1 }}
        />
      )}

      {/* Scanning beam */}
      {(phase === 'seal' || phase === 'readouts') && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400 to-transparent"
          initial={{ y: '-100%', opacity: 0 }}
          animate={{ y: '100%', opacity: [0, 0.1, 0] }}
          transition={{ duration: 3, ease: 'easeInOut' }}
          style={{ height: '3px', pointerEvents: 'none' }}
        />
      )}

      {/* O.M.N.I. Seal — logo image with layered animation */}
      {(phase === 'seal' || phase === 'readouts') && (
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center gap-4"
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: [0.2, 0.8, 0.2, 1] }}
        >
          {/* Outer glow ring */}
          <motion.div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: 260, height: 260,
              background: 'radial-gradient(circle, rgba(0,229,255,0.12) 0%, transparent 70%)',
              boxShadow: '0 0 60px 20px rgba(0,229,255,0.08)',
            }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: [0, 1, 0.6], scale: [0.5, 1.1, 1] }}
            transition={{ duration: 1.8, ease: 'easeOut' }}
          />

          {/* Rotating scan ring */}
          <motion.div
            className="absolute pointer-events-none"
            style={{ width: 240, height: 240 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          >
            <svg width="240" height="240" viewBox="0 0 240 240">
              <circle cx="120" cy="120" r="115" fill="none" stroke="#00E5FF" strokeWidth="0.5"
                strokeDasharray="12 8" opacity="0.3" />
            </svg>
          </motion.div>

          {/* Counter-rotating inner ring */}
          <motion.div
            className="absolute pointer-events-none"
            style={{ width: 200, height: 200 }}
            animate={{ rotate: -360 }}
            transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
          >
            <svg width="200" height="200" viewBox="0 0 200 200">
              <circle cx="100" cy="100" r="95" fill="none" stroke="#00E5FF" strokeWidth="0.4"
                strokeDasharray="4 16" opacity="0.2" />
            </svg>
          </motion.div>

          {/* The actual logo */}
          <motion.img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/696d1e71c654a257ffdf4599/6581787fa_B06D525E-EF70-4793-8658-76FD6C825B2B.png"
            alt="O.M.N.I. Seal"
            style={{
              width: 200,
              height: 200,
              objectFit: 'contain',
              position: 'relative',
              zIndex: 10,
              filter: 'invert(1) sepia(1) saturate(3) hue-rotate(155deg) brightness(1.1) drop-shadow(0 0 12px rgba(0,229,255,0.6))',
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.4, ease: 'easeOut' }}
          />

          {/* Cyan tint overlay pulse */}
          <motion.div
            className="absolute pointer-events-none rounded-full"
            style={{
              width: 180, height: 180,
              background: 'radial-gradient(circle, rgba(0,229,255,0.15) 0%, transparent 65%)',
            }}
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>
      )}

      {/* System Readouts */}
      {phase === 'readouts' && (
        <motion.div
          className="absolute bottom-1/3 space-y-2 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {['Satellite Array: Online', 'Civic Monitoring: Active', 'Metahuman Registry: Synced'].map(
            (text, i) => (
              <motion.div
                key={i}
                className="text-xs font-mono tracking-widest"
                style={{ color: '#00E5FF' }}
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: i * 0.4 }}
              >
                {text}
              </motion.div>
            )
          )}
        </motion.div>
      )}

      {/* Biometric Scanner */}
      {phase === 'biometric' && (
        <motion.div
          className="relative z-10"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <BiometricScanner
            faction="OMNI"
            onAuthenticate={() => {
              play?.('system_startup');
              setTimeout(onComplete, 800);
            }}
          />
        </motion.div>
      )}

      {/* Phase Transition */}
      {phase !== 'biometric' && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-b from-black to-transparent pointer-events-none"
          animate={phase === 'scan' ? { opacity: [0, 1] } : { opacity: 0 }}
          transition={{ duration: 0.8 }}
          onAnimationComplete={() => {
            if (phase === 'scan') setPhase('biometric');
          }}
        />
      )}
    </div>
  );
}