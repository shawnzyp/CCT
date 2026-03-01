import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Trophy, RotateCcw, Swords, Shield, Target } from 'lucide-react';

export default function CombatSimResults({ battleLog, winner, combatants, onReset, colors }) {
  const { accentA, panel0, panel1, text0, text1, muted } = colors;
  const conclusion = battleLog.find(l => l.isConclusion);
  const rounds = battleLog.filter(l => !l.isConclusion);

  const hitsA = rounds.filter(r => r.attacker === combatants.a?.name && r.hit).length;
  const hitsB = rounds.filter(r => r.attacker === combatants.b?.name && r.hit).length;
  const dmgA = rounds.filter(r => r.attacker === combatants.a?.name && r.hit).reduce((sum, r) => sum + (r.damage || 0), 0);
  const dmgB = rounds.filter(r => r.attacker === combatants.b?.name && r.hit).reduce((sum, r) => sum + (r.damage || 0), 0);
  const avgRollA = rounds.filter(r => r.attacker === combatants.a?.name).reduce((s, r) => s + r.roll, 0) / Math.max(1, rounds.filter(r => r.attacker === combatants.a?.name).length);
  const avgRollB = rounds.filter(r => r.attacker === combatants.b?.name).reduce((s, r) => s + r.roll, 0) / Math.max(1, rounds.filter(r => r.attacker === combatants.b?.name).length);

  return (
    <div className="space-y-4">
      {/* Winner banner */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center rounded-lg p-6"
        style={{ background: accentA + '15', border: `1px solid ${accentA}50` }}
      >
        <motion.div animate={{ rotate: [0, -10, 10, -10, 0] }} transition={{ delay: 0.3 }}>
          <Trophy className="h-10 w-10 mx-auto mb-3" style={{ color: accentA }} />
        </motion.div>
        <div className="text-[10px] font-mono uppercase tracking-widest mb-1" style={{ color: muted }}>VICTOR</div>
        <div className="text-2xl font-mono font-bold tracking-wider" style={{ color: text0 }}>{winner}</div>
        {conclusion?.narration && (
          <p className="text-sm italic mt-3 max-w-md mx-auto" style={{ color: text1 }}>"{conclusion.narration}"</p>
        )}
      </motion.div>

      {/* Stats comparison */}
      <div className="rounded-lg p-4" style={{ background: panel0, border: `1px solid ${accentA}20` }}>
        <div className="text-[10px] font-mono uppercase tracking-widest mb-3" style={{ color: accentA }}>Combat Statistics</div>
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div style={{ color: accentA }} className="font-mono font-bold">{combatants.a?.name}</div>
          <div style={{ color: muted }} className="font-mono uppercase text-[9px] self-end pb-0.5">STAT</div>
          <div style={{ color: '#FF6B6B' }} className="font-mono font-bold">{combatants.b?.name}</div>
          {[
            [hitsA, 'Hits', hitsB],
            [dmgA, 'Damage', dmgB],
            [avgRollA.toFixed(1), 'Avg Roll', avgRollB.toFixed(1)],
            [rounds.length, 'Rounds', rounds.length],
          ].map(([valA, label, valB]) => (
            <React.Fragment key={label}>
              <div className="py-1.5 rounded" style={{ background: panel1, color: text0 }}>{valA}</div>
              <div className="py-1.5 self-center" style={{ color: muted }}>{label}</div>
              <div className="py-1.5 rounded" style={{ background: panel1, color: text0 }}>{valB}</div>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* AI Analysis */}
      {conclusion?.analysis && (
        <div className="rounded-lg p-4" style={{ background: panel0, border: `1px solid ${accentA}20` }}>
          <div className="text-[10px] font-mono uppercase tracking-widest mb-2" style={{ color: accentA }}>Tactical Analysis</div>
          <p className="text-sm leading-relaxed" style={{ color: text1 }}>{conclusion.analysis}</p>
        </div>
      )}

      {/* Full log toggle */}
      <details>
        <summary className="cursor-pointer text-xs font-mono uppercase tracking-wide py-2 px-3 rounded" style={{ background: panel0, color: muted }}>
          View Full Combat Log ({rounds.length} rounds)
        </summary>
        <div className="mt-2 space-y-1.5 max-h-72 overflow-y-auto">
          {rounds.map((line, i) => (
            <div key={i} className="p-2 rounded text-xs" style={{ background: panel1 }}>
              <span className="font-mono text-[9px]" style={{ color: muted }}>RND{line.round} </span>
              <span className="font-bold" style={{ color: line.attacker === combatants.a?.name ? accentA : '#FF6B6B' }}>{line.attacker}</span>
              <span style={{ color: text1 }}> {line.action} </span>
              <span style={{ color: line.hit ? '#FF3B3B' : muted }}>{line.hit ? `-${line.damage}` : 'MISS'}</span>
            </div>
          ))}
        </div>
      </details>

      <Button onClick={onReset} className="w-full gap-2" style={{ background: accentA, color: '#000' }}>
        <RotateCcw className="h-4 w-4" />
        NEW SIMULATION
      </Button>
    </div>
  );
}