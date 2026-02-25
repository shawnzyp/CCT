import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import BiometricScanner from '../BiometricScanner';
import { useSoundEffects } from '@/components/sounds/useSoundEffects';

export default function PFVBootSequence({ onComplete, glitchIntensity = 0.2 }) {
  const [phase, setPhase] = useState('crest');
  const { play } = useSoundEffects();

  useEffect(() => {
    if (phase === 'crest') {
      const t = setTimeout(() => {
        play?.('system_startup');
        setPhase('pulse');
      }, 2500);
      return () => clearTimeout(t);
    }
    if (phase === 'pulse') {
      const t = setTimeout(() => setPhase('slogans'), 1800);
      return () => clearTimeout(t);
    }
    if (phase === 'slogans') {
      const t = setTimeout(() => setPhase('biometric'), 2200);
      return () => clearTimeout(t);
    }
  }, [phase, play]);

  const slogans = ['Vigilance', 'Duty', 'Honor', 'Protection'];

  return (
    <div className="w-full h-screen bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Crest */}
      {(phase === 'crest' || phase === 'pulse' || phase === 'slogans') && (
        <motion.div
          className="absolute top-1/4"
          initial={{ scale: 0, opacity: 0 }}
          animate={phase === 'crest' ? { scale: 1, opacity: 1 } : { scale: 1.05, opacity: 0.9 }}
          transition={{ type: 'spring', damping: 8 }}
        >
          <svg className="w-40 h-40 drop-shadow-2xl" viewBox="0 0 100 100">
            <motion.circle
              cx="50"
              cy="50"
              r="45"
              fill="#1E3A5F"
              stroke="#FF1744"
              strokeWidth="2"
            />
            <motion.path
              d="M 50 30 L 65 55 L 50 65 L 35 55 Z"
              fill="#FF1744"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            />
          </svg>
        </motion.div>
      )}

      {/* Shockwave Ripple */}
      {phase === 'pulse' && (
        <>
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className="absolute top-1/4 w-40 h-40 rounded-full border-2 border-red-500"
              initial={{ scale: 1, opacity: 0.8 }}
              animate={{ scale: 3, opacity: 0 }}
              transition={{ delay: i * 0.2, duration: 0.8 }}
              style={{ pointerEvents: 'none' }}
            />
          ))}
        </>
      )}

      {/* Slogans */}
      {phase === 'slogans' && (
        <motion.div className="absolute bottom-1/3 text-center space-y-3">
          {slogans.map((slogan, i) => (
            <motion.div
              key={i}
              className="text-lg font-bold tracking-widest"
              style={{ color: i % 2 === 0 ? '#FF1744' : '#2196F3' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: i * 0.4, duration: 0.6 }}
            >
              {slogan}
            </motion.div>
          ))}
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
            faction="PFV"
            onAuthenticate={() => {
              play?.('system_startup');
              setTimeout(onComplete, 800);
            }}
          />
        </motion.div>
      )}

      {/* Transition */}
      {phase !== 'biometric' && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-b from-transparent to-black pointer-events-none"
          animate={phase === 'slogans' ? { opacity: [0, 1] } : { opacity: 0 }}
          transition={{ duration: 1 }}
        />
      )}
    </div>
  );
}