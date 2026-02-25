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

      {/* O.M.N.I. Seal */}
      {(phase === 'seal' || phase === 'readouts') && (
        <motion.div
          className="absolute top-1/4 text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        >
          <svg className="w-32 h-32 mx-auto" viewBox="0 0 100 100">
            <motion.circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#00E5FF"
              strokeWidth="1"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2 }}
            />
            <motion.polygon
              points="50,20 80,50 50,80 20,50"
              fill="none"
              stroke="#00E5FF"
              strokeWidth="1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            />
            <motion.text
              x="50"
              y="55"
              textAnchor="middle"
              className="text-[8px] font-mono"
              fill="#00E5FF"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
            >
              O.M.N.I.
            </motion.text>
          </svg>
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