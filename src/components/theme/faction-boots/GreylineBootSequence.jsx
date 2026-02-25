import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import BiometricScanner from '../BiometricScanner';
import { useSoundEffects } from '@/components/sounds/useSoundEffects';

export default function GreylineBootSequence({ onComplete, glitchIntensity = 0.4 }) {
  const [phase, setPhase] = useState('shutter');
  const { play } = useSoundEffects();

  useEffect(() => {
    if (phase === 'shutter') {
      const t = setTimeout(() => {
        play?.('system_startup');
        setPhase('hud');
      }, 1800);
      return () => clearTimeout(t);
    }
    if (phase === 'hud') {
      const t = setTimeout(() => setPhase('reticle'), 1200);
      return () => clearTimeout(t);
    }
    if (phase === 'reticle') {
      const t = setTimeout(() => setPhase('status'), 1500);
      return () => clearTimeout(t);
    }
    if (phase === 'status') {
      const t = setTimeout(() => setPhase('biometric'), 1200);
      return () => clearTimeout(t);
    }
  }, [phase, play]);

  return (
    <div className="w-full h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Hazard stripe pattern */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: 'repeating-linear-gradient(45deg, #FF9800 0px, #FF9800 10px, transparent 10px, transparent 20px)',
      }} />

      {/* Shutter Effect */}
      {phase === 'shutter' && (
        <>
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className="absolute h-1/4 w-full bg-gray-950"
              style={{ top: `${i * 25}%` }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: i * 0.15, duration: 0.4, ease: 'easeInOut' }}
            />
          ))}
        </>
      )}

      {/* HUD Overlays */}
      {(phase === 'hud' || phase === 'reticle' || phase === 'status') && (
        <motion.svg
          className="absolute w-64 h-64 inset-0 m-auto"
          viewBox="0 0 200 200"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          {/* Corner brackets */}
          {[[0, 0], [200, 0], [0, 200], [200, 200]].map((pos, i) => (
            <motion.g key={i}>
              <line x1={pos[0]} y1={pos[1] + 15} x2={pos[0]} y2={pos[1]} stroke="#FF9800" strokeWidth="2" />
              <line
                x1={pos[0] + (pos[0] === 0 ? 15 : -15)}
                y1={pos[1]}
                x2={pos[0]}
                y2={pos[1]}
                stroke="#FF9800"
                strokeWidth="2"
              />
            </motion.g>
          ))}

          {/* Target Reticle */}
          {phase === 'reticle' && (
            <>
              <motion.circle cx="100" cy="100" r="30" fill="none" stroke="#FF9800" strokeWidth="1" />
              <motion.circle cx="100" cy="100" r="40" fill="none" stroke="#FF9800" strokeWidth="1" opacity="0.5" />
              <motion.line x1="100" y1="50" x2="100" y2="70" stroke="#FF9800" strokeWidth="2" />
              <motion.line x1="100" y1="130" x2="100" y2="150" stroke="#FF9800" strokeWidth="2" />
              <motion.line x1="50" y1="100" x2="70" y2="100" stroke="#FF9800" strokeWidth="2" />
              <motion.line x1="130" y1="100" x2="150" y2="100" stroke="#FF9800" strokeWidth="2" />
            </>
          )}
        </motion.svg>
      )}

      {/* Status Text */}
      {phase === 'status' && (
        <motion.div
          className="absolute top-1/3 text-center space-y-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="text-xs font-mono tracking-widest" style={{ color: '#FF9800' }}>
            ASSET AUTHENTICATION REQUIRED
          </div>
          <div className="text-[10px] font-mono opacity-60">
            [ VERIFY CREDENTIALS ]
          </div>
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
            faction="GREYLINE"
            onAuthenticate={() => {
              play?.('system_startup');
              setTimeout(onComplete, 800);
            }}
          />
        </motion.div>
      )}

      {/* Transition Wipe */}
      {phase !== 'biometric' && (
        <motion.div
          className="absolute inset-0 bg-gray-950 pointer-events-none"
          animate={phase === 'status' ? { scaleX: [0, 1] } : { scaleX: 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          style={{ transformOrigin: 'left' }}
        />
      )}
    </div>
  );
}