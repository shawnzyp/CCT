import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Swords, Zap, Shield } from 'lucide-react';

export default function CombatSimBattle({ combatants, onComplete, colors }) {
  const { accentA, panel0, panel1, text0, text1, muted } = colors;

  const [phase, setPhase] = useState('analyzing'); // analyzing | simulating | finishing
  const [displayedLines, setDisplayedLines] = useState([]);
  const [hpA, setHpA] = useState(combatants.a?.current_hp || combatants.a?.max_hp || 100);
  const [hpB, setHpB] = useState(combatants.b?.current_hp || combatants.b?.max_hp || 100);
  const [maxHpA] = useState(combatants.a?.max_hp || combatants.a?.current_hp || 100);
  const [maxHpB] = useState(combatants.b?.max_hp || combatants.b?.current_hp || 100);
  const [currentAttacker, setCurrentAttacker] = useState(null);

  useEffect(() => {
    runSimulation();
  }, []);

  const runSimulation = async () => {
    setPhase('analyzing');

    const a = combatants.a;
    const b = combatants.b;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are simulating a tactical combat encounter in the "Catalyst Core" TTRPG between two characters.

Character A: ${a.name}
- Classification: ${a.classification}
- Power Style: ${a.primary_power_style}
- HP: ${a.current_hp || a.max_hp}
- Toughness Class: ${a.toughness_class || 10}
- STR: ${a.ability_scores?.STR || 10}, DEX: ${a.ability_scores?.DEX || 10}, CON: ${a.ability_scores?.CON || 10}
- Alignment: ${a.alignment}

Character B: ${b.name}
- Classification: ${b.classification}
- Power Style: ${b.primary_power_style}
- HP: ${b.current_hp || b.max_hp}
- Toughness Class: ${b.toughness_class || 10}
- STR: ${b.ability_scores?.STR || 10}, DEX: ${b.ability_scores?.DEX || 10}, CON: ${b.ability_scores?.CON || 10}
- Alignment: ${b.alignment}

Simulate a 6-8 round dramatic combat. Each round should have cinematic flair.

Return JSON with:
- rounds: array of round objects, each with:
  - round_number: number
  - attacker: "A" or "B" 
  - action: short action description (e.g. "unleashes kinetic burst", "dodges and counters")
  - damage: number 5-35
  - roll: number 1-20
  - hit: boolean
  - narration: 1-2 sentence cinematic description
- winner: "A" or "B"
- victory_narration: 2-3 sentence dramatic conclusion
- analysis: 2-3 sentence tactical breakdown of why the winner prevailed`,
      response_json_schema: {
        type: 'object',
        properties: {
          rounds: { type: 'array', items: { type: 'object', properties: { round_number: { type: 'number' }, attacker: { type: 'string' }, action: { type: 'string' }, damage: { type: 'number' }, roll: { type: 'number' }, hit: { type: 'boolean' }, narration: { type: 'string' } } } },
          winner: { type: 'string' },
          victory_narration: { type: 'string' },
          analysis: { type: 'string' },
        }
      }
    });

    setPhase('simulating');

    // Animate rounds one by one
    let currentHpA = hpA;
    let currentHpB = hpB;
    const log = [];

    for (let i = 0; i < (result.rounds?.length || 0); i++) {
      const round = result.rounds[i];
      await new Promise(r => setTimeout(r, 900));

      setCurrentAttacker(round.attacker);

      if (round.hit && round.damage) {
        if (round.attacker === 'A') {
          currentHpB = Math.max(0, currentHpB - round.damage);
          setHpB(currentHpB);
        } else {
          currentHpA = Math.max(0, currentHpA - round.damage);
          setHpA(currentHpA);
        }
      }

      const line = {
        round: round.round_number,
        attacker: round.attacker === 'A' ? combatants.a.name : combatants.b.name,
        action: round.action,
        hit: round.hit,
        damage: round.damage,
        roll: round.roll,
        narration: round.narration,
      };

      log.push(line);
      setDisplayedLines(prev => [...prev, line]);
    }

    await new Promise(r => setTimeout(r, 500));
    setPhase('finishing');

    const winnerName = result.winner === 'A' ? combatants.a.name : combatants.b.name;

    setTimeout(() => {
      onComplete([
        ...log,
        { isConclusion: true, narration: result.victory_narration, analysis: result.analysis, winner: winnerName }
      ], winnerName);
    }, 1200);
  };

  const hpPctA = Math.max(0, (hpA / maxHpA) * 100);
  const hpPctB = Math.max(0, (hpB / maxHpB) * 100);
  const hpColorA = hpPctA > 50 ? accentA : hpPctA > 25 ? '#FFC857' : '#FF3B3B';
  const hpColorB = hpPctB > 50 ? '#FF6B6B' : hpPctB > 25 ? '#FFC857' : '#FF3B3B';

  return (
    <div className="space-y-4">
      {/* VS bar */}
      <div className="rounded-lg p-4" style={{ background: panel0, border: `1px solid ${accentA}20` }}>
        <div className="grid grid-cols-2 gap-4 mb-3">
          {[{ char: combatants.a, hp: hpA, maxHp: maxHpA, pct: hpPctA, color: accentA, isAttacking: currentAttacker === 'A' },
            { char: combatants.b, hp: hpB, maxHp: maxHpB, pct: hpPctB, color: '#FF6B6B', isAttacking: currentAttacker === 'B' }].map(({ char, hp, maxHp, pct, color, isAttacking }) => (
            <div key={char.id}>
              <div className="flex items-center gap-2 mb-1.5">
                {char.portrait_url && <img src={char.portrait_url} className="w-7 h-7 rounded object-cover" alt="" />}
                <div>
                  <div className="text-xs font-mono font-bold" style={{ color: isAttacking ? color : text0 }}>{char.name}</div>
                  <div className="text-[10px] font-mono" style={{ color: muted }}>{hp}/{maxHp} HP</div>
                </div>
                {isAttacking && <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 0.6 }}><Zap className="h-3.5 w-3.5" style={{ color }} /></motion.div>}
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: '#ffffff10' }}>
                <motion.div
                  className="h-full rounded-full"
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.4 }}
                  style={{ background: color }}
                />
              </div>
            </div>
          ))}
        </div>
        {phase === 'analyzing' && (
          <div className="text-center text-xs font-mono animate-pulse" style={{ color: muted }}>
            ANALYZING COMBATANTS...
          </div>
        )}
        {phase === 'simulating' && (
          <div className="flex items-center justify-center gap-2 text-xs font-mono" style={{ color: accentA }}>
            <Swords className="h-3.5 w-3.5" />
            SIMULATION IN PROGRESS
          </div>
        )}
        {phase === 'finishing' && (
          <div className="text-center text-xs font-mono" style={{ color: accentA }}>COMPILING RESULTS...</div>
        )}
      </div>

      {/* Combat log */}
      <div className="rounded-lg p-3 space-y-2 max-h-96 overflow-y-auto" style={{ background: panel0, border: `1px solid ${accentA}20` }}>
        <div className="text-[10px] font-mono uppercase tracking-widest mb-2" style={{ color: muted }}>Combat Log</div>
        <AnimatePresence>
          {displayedLines.map((line, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: line.attacker === combatants.a.name ? -10 : 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-2.5 rounded text-xs"
              style={{ background: panel1 }}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-[9px] uppercase tracking-wide" style={{ color: muted }}>RND {line.round}</span>
                <span className="font-mono font-bold" style={{ color: line.attacker === combatants.a.name ? accentA : '#FF6B6B' }}>
                  {line.attacker}
                </span>
                <span style={{ color: text1 }}>{line.action}</span>
                <span className="ml-auto font-mono text-[10px]" style={{ color: line.roll >= 15 ? '#00D1B2' : line.roll >= 10 ? '#FFC857' : '#FF3B3B' }}>
                  [{line.roll}]
                </span>
                {line.hit && <span className="font-mono text-[10px]" style={{ color: '#FF3B3B' }}>-{line.damage}</span>}
                {!line.hit && <span className="font-mono text-[10px]" style={{ color: muted }}>MISS</span>}
              </div>
              <p className="italic" style={{ color: muted }}>{line.narration}</p>
            </motion.div>
          ))}
        </AnimatePresence>
        {displayedLines.length === 0 && (
          <div className="text-center py-8 text-xs font-mono animate-pulse" style={{ color: muted }}>
            Awaiting combat data...
          </div>
        )}
      </div>
    </div>
  );
}