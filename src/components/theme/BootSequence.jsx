import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useBiometricAuth } from './useBiometricAuth';
import OMNIBootSequence from './faction-boots/OMNIBootSequence';
import PFVBootSequence from './faction-boots/PFVBootSequence';
import GreylineBootSequence from './faction-boots/GreylineBootSequence';
import CosmicConcaveBootSequence from './faction-boots/CosmicConcaveBootSequence';
import { useSettings } from '@/components/utils/useSettings';

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
  const { isAuthenticated, authenticate } = useBiometricAuth();
  const { settings } = useSettings();

  // If already authenticated, skip boot
  if (isAuthenticated) {
    return null;
  }

  // Select faction-specific boot sequence
  const getFactionBoot = () => {
    const faction = theme?.faction || 'OMNI';
    const bootProps = {
      onComplete: () => {
        authenticate();
        onComplete?.();
      },
      glitchIntensity: settings?.glitchIntensity || 0.3
    };

    switch (faction) {
      case 'P.F.V.':
        return <PFVBootSequence {...bootProps} />;
      case 'Greyline PMC':
        return <GreylineBootSequence {...bootProps} />;
      case 'Cosmic Conclave':
        return <CosmicConcaveBootSequence {...bootProps} />;
      default:
        return <OMNIBootSequence {...bootProps} />;
    }
  };

  return getFactionBoot();


}