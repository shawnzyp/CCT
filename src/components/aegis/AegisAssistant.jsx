import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Sparkles, Radio } from 'lucide-react';
import { cn } from '@/lib/utils';
import useSoundEffects from '@/components/sounds/useSoundEffects';
import AegisInterface from './AegisInterface';

const ENCOURAGEMENTS = [
  "Threat assessment: manageable. You've got this, operative.",
  "SP economy looking optimal. Push when it matters.",
  "Tactical positioning noted. Solid work.",
  "Civilian safety maintained. Excellent judgment call.",
  "Combat efficiency: above average. Keep pressure steady.",
  "Adaptive response detected. That's doctrine-compliant thinking.",
  "Environmental awareness active. Stay sharp.",
  "Resource management on point. O.M.N.I. approves.",
  "Clean execution. Minimal collateral. Well done.",
  "Threat neutralization protocol: effective.",
  "Initiative control maintained. Momentum is yours.",
  "Decision logged. Consequences: favorable.",
  "Field performance: exemplary. Command is watching.",
  "Tactical pivot recognized. Smart adaptation.",
  "Clearance check: green. All systems nominal."
];

export default function AegisAssistant() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showEncouragement, setShowEncouragement] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const { play } = useSoundEffects();
  
  // Random encouragement system
  useEffect(() => {
    const showRandomEncouragement = () => {
      const randomMessage = ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)];
      setCurrentMessage(randomMessage);
      setShowEncouragement(true);
      play('navigate', 0.1);
      
      setTimeout(() => {
        setShowEncouragement(false);
      }, 5000);
    };
    
    // Show first encouragement after 10 seconds
    const initialTimer = setTimeout(showRandomEncouragement, 10000);
    
    // Then every 60-120 seconds randomly
    const interval = setInterval(() => {
      const randomDelay = 60000 + Math.random() * 60000; // 60-120 seconds
      setTimeout(showRandomEncouragement, randomDelay);
    }, 120000);
    
    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [play]);
  
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
    play('click', 0.2);
  };
  
  return (
    <>
      {/* Floating Assistant Icon */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed bottom-6 left-6 z-50"
      >
        <motion.button
          onClick={toggleExpanded}
          className="relative"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {/* Animated Face Icon */}
          <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-violet-600 to-purple-700 border-2 border-violet-400 shadow-lg shadow-violet-500/50 flex items-center justify-center overflow-hidden">
            {/* Scanning effect */}
            <motion.div
              animate={{ y: ['-100%', '100%'] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-400/30 to-transparent"
            />
            
            {/* Face - animated "eyes" */}
            <div className="relative z-10">
              <motion.div
                animate={isThinking ? {
                  scaleY: [1, 0.1, 1],
                } : {}}
                transition={{ duration: 0.3, repeat: isThinking ? Infinity : 0, repeatDelay: 2 }}
                className="flex gap-2 mb-1"
              >
                <div className="w-2 h-2 bg-white rounded-full" />
                <div className="w-2 h-2 bg-white rounded-full" />
              </motion.div>
              {/* Mouth line */}
              <motion.div 
                className="w-6 h-0.5 bg-white/70 rounded-full mx-auto"
                animate={{
                  width: isThinking ? ['24px', '16px', '24px'] : '24px'
                }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            </div>
            
            {/* Pulse ring */}
            <motion.div
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.5, 0, 0.5]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 rounded-full border-2 border-violet-400"
            />
          </div>
          
          {/* Activity indicator */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [1, 0.6, 1]
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-950"
          />
          
          {/* Label */}
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
            <div className="text-xs font-mono text-violet-400 uppercase tracking-wider">
              A.E.G.I.S.
            </div>
          </div>
        </motion.button>
      </motion.div>
      
      {/* Encouragement Speech Bubble */}
      <AnimatePresence>
        {showEncouragement && (
          <motion.div
            initial={{ opacity: 0, x: -20, y: 20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="fixed bottom-24 left-6 z-50 max-w-xs"
          >
            <div className="relative bg-slate-800 border-2 border-violet-500 rounded-xl p-4 shadow-xl shadow-violet-500/30">
              {/* Close button */}
              <button
                onClick={() => setShowEncouragement(false)}
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-slate-700 border-2 border-violet-500 flex items-center justify-center hover:bg-slate-600"
              >
                <X className="h-3 w-3 text-white" />
              </button>
              
              {/* Header */}
              <div className="flex items-center gap-2 mb-2">
                <Radio className="h-3 w-3 text-violet-400" />
                <span className="text-xs font-mono text-violet-400 uppercase tracking-wider">
                  A.E.G.I.S. Advisory
                </span>
              </div>
              
              {/* Message */}
              <p className="text-sm text-slate-300 leading-relaxed">
                {currentMessage}
              </p>
              
              {/* Speech bubble arrow */}
              <div className="absolute -bottom-2 left-8 w-4 h-4 bg-slate-800 border-r-2 border-b-2 border-violet-500 transform rotate-45" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Expanded Panel (Future: full A.E.G.I.S. interface) */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-28 left-6 z-50 w-96 max-h-[600px]"
          >
            <div className="bg-slate-900 border-2 border-violet-500 rounded-xl shadow-2xl shadow-violet-500/30 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-violet-600 to-purple-600 p-4 flex items-center justify-between border-b-2 border-violet-400">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/30 flex items-center justify-center border-2 border-white/50">
                    <Radio className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <div className="text-white font-bold font-mono">A.E.G.I.S.</div>
                    <div className="text-xs text-violet-100 font-mono">Adaptive Executive Governance & Intelligence System</div>
                  </div>
                </div>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="bg-white/20 hover:bg-white/30 text-white rounded-lg p-1 border-2 border-white/30"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              {/* Content */}
              <div className="p-0 max-h-[600px] overflow-hidden">
                <AegisInterface />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}