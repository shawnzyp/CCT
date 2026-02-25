import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import BiometricScanner from '../BiometricScanner';
import { useSoundEffects } from '@/components/sounds/useSoundEffects';

export default function CosmicConcaveBootSequence({ onComplete, glitchIntensity = 0.1 }) {
  const [phase, setPhase] = useState('darkness');
  const { play } = useSoundEffects();

  useEffect(() => {
    if (phase === 'darkness') {
      const t = setTimeout(() => {
        play?.('system_startup');
        setPhase('constellation');
      }, 1500);
      return () => clearTimeout(t);
    }
    if (phase === 'constellation') {
      const t = setTimeout(() => setPhase('sigil'), 2000);
      return () => clearTimeout(t);
    }
    if (phase === 'sigil') {
      const t = setTimeout(() => setPhase('glyphs'), 1800);
      return () => clearTimeout(t);
    }
    if (phase === 'glyphs') {
      const t = setTimeout(() => setPhase('biometric'), 1500);
      return () => clearTimeout(t);
    }
  }, [phase, play]);

  // Generate particle/constellation data
  const stars = Array.from({ length: 40 }, () => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 0.5,
    delay: Math.random() * 2,
  }));

  return (
    <div className="w-full h-screen bg-gradient-to-b from-indigo-950 via-slate-950 to-purple-950 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Starfield */}
      <div className="absolute inset-0">
        {stars.map((star, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: star.size,
              height: star.size,
              background: '#9C27B0',
            }}
            initial={{ opacity: 0 }}
            animate={phase !== 'darkness' ? { opacity: [0.3, 0.8, 0.3] } : { opacity: 0 }}
            transition={{
              delay: star.delay,
              duration: 4,
              repeat: Infinity,
            }}
          />
        ))}
      </div>

      {/* Constellations */}
      {(phase === 'constellation' || phase === 'sigil' || phase === 'glyphs') && (
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 400">
          <motion.circle
            cx="200"
            cy="200"
            r="80"
            fill="none"
            stroke="#7C4DFF"
            strokeWidth="1"
            opacity="0.5"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 2 }}
          />
          {[[100, 100], [300, 100], [150, 300], [250, 300]].map((pos, i) => (
            <motion.circle
              key={i}
              cx={pos[0]}
              cy={pos[1]}
              r="6"
              fill="#9C27B0"
              initial={{ opacity: 0 }}
              animate={phase !== 'darkness' ? { opacity: 1 } : { opacity: 0 }}
              transition={{ delay: 1 + i * 0.2 }}
            />
          ))}
        </svg>
      )}

      {/* Sigil */}
      {(phase === 'sigil' || phase === 'glyphs') && (
        <motion.div
          className="absolute text-center"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5 }}
        >
          <svg className="w-48 h-48 mx-auto" viewBox="0 0 100 100">
            <motion.polygon
              points="50,10 90,90 10,90"
              fill="none"
              stroke="#9C27B0"
              strokeWidth="1"
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            />
            <motion.circle cx="50" cy="50" r="20" fill="none" stroke="#7C4DFF" strokeWidth="1" />
            <motion.text
              x="50"
              y="55"
              textAnchor="middle"
              className="text-[6px] font-mono"
              fill="#9C27B0"
            >
              ∞
            </motion.text>
          </svg>
        </motion.div>
      )}

      {/* Floating Glyphs */}
      {phase === 'glyphs' && (
        <motion.div className="absolute bottom-1/3 flex gap-8 justify-center">
          {['◆', '◇', '✦', '✧'].map((glyph, i) => (
            <motion.div
              key={i}
              className="text-2xl"
              style={{ color: '#7C4DFF' }}
              initial={{ y: 0, opacity: 0 }}
              animate={{ y: [-20, 0, -20], opacity: [0, 1, 0] }}
              transition={{
                delay: i * 0.3,
                duration: 3,
                repeat: Infinity,
              }}
            >
              {glyph}
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
            faction="COSMIC"
            onAuthenticate={() => {
              play?.('system_startup');
              setTimeout(onComplete, 800);
            }}
          />
        </motion.div>
      )}

      {/* Dissolve Transition */}
      {phase !== 'biometric' && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at center, transparent 0%, rgba(15,23,42,1) 100%)',
          }}
          animate={phase === 'glyphs' ? { opacity: [0, 1] } : { opacity: 0 }}
          transition={{ duration: 1 }}
        />
      )}
    </div>
  );
}