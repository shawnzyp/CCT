import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '@/components/theme/useTheme';
import { Button } from '@/components/ui/button';
import { Swords, RotateCcw } from 'lucide-react';
import CombatSimSetup from '@/components/combat-sim/CombatSimSetup';
import CombatSimBattle from '@/components/combat-sim/CombatSimBattle';
import CombatSimResults from '@/components/combat-sim/CombatSimResults';

export default function CombatSimulator() {
  const { theme } = useTheme();
  const c = theme?.colors || {};
  const accentA = c.accentA || '#00E5FF';
  const panel0 = c.panel0 || '#1A1F26';
  const panel1 = c.panel1 || '#202833';
  const text0 = c.text0 || '#E6F1FF';
  const text1 = c.text1 || '#8EA0B5';
  const muted = c.muted || '#5F6E80';

  const [phase, setPhase] = useState('setup');
  const [combatants, setCombatants] = useState({ a: null, b: null });
  const [battleConfig, setBattleConfig] = useState({});
  const [battleLog, setBattleLog] = useState([]);
  const [winner, setWinner] = useState(null);

  const { data: characters = [] } = useQuery({
    queryKey: ['characters'],
    queryFn: () => base44.entities.Character.list('-created_date'),
  });

  const handleStartBattle = (selected, config) => {
    setCombatants(selected);
    setBattleConfig(config || {});
    setPhase('battle');
  };

  const handleBattleComplete = (log, winnerName) => {
    setBattleLog(log);
    setWinner(winnerName);
    setPhase('results');
  };

  const handleReset = () => {
    setPhase('setup');
    setCombatants({ a: null, b: null });
    setBattleConfig({});
    setBattleLog([]);
    setWinner(null);
  };

  const colors = { accentA, panel0, panel1, text0, text1, muted };

  return (
    <div className="min-h-screen p-4 sm:p-6 max-w-4xl mx-auto pb-24">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: accentA + '20', border: `1px solid ${accentA}40` }}>
            <Swords className="h-5 w-5" style={{ color: accentA }} />
          </div>
          <div>
            <h1 className="font-mono font-bold text-lg tracking-wider" style={{ color: text0 }}>COMBAT SIMULATOR</h1>
            <p className="text-[10px] font-mono uppercase tracking-widest" style={{ color: muted }}>AI-Driven Battle Analysis</p>
          </div>
        </div>
        {phase !== 'setup' && (
          <Button onClick={handleReset} variant="outline" size="sm" className="gap-2">
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </Button>
        )}
      </div>

      {/* Phase indicator */}
      <div className="flex items-center gap-2 mb-6">
        {['setup', 'battle', 'results'].map((p, i) => (
          <React.Fragment key={p}>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ background: phase === p || (phase === 'results' && p !== 'results') || (phase === 'battle' && p === 'setup') ? accentA : muted + '40' }} />
              <span className="text-[10px] font-mono uppercase" style={{ color: phase === p ? accentA : muted }}>{p}</span>
            </div>
            {i < 2 && <div className="flex-1 h-px" style={{ background: muted + '30' }} />}
          </React.Fragment>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {phase === 'setup' && (
          <motion.div key="setup" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
            <CombatSimSetup characters={characters} onStart={handleStartBattle} colors={colors} />
          </motion.div>
        )}
        {phase === 'battle' && (
          <motion.div key="battle" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
            <CombatSimBattle combatants={combatants} onComplete={handleBattleComplete} colors={colors} battleConfig={battleConfig} />
          </motion.div>
        )}
        {phase === 'results' && (
          <motion.div key="results" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
            <CombatSimResults battleLog={battleLog} winner={winner} combatants={combatants} onReset={handleReset} colors={colors} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}