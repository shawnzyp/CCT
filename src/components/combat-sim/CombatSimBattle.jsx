import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Swords, Zap, Flame, Wind, CloudLightning } from 'lucide-react';
import CombatArena from './CombatArena';

const ENV_EFFECTS = {
  urban:                ['city noise', 'traffic', 'bystanders scatter'],
  underground:          ['tunnel echo', 'low visibility', 'concrete dust'],
  rooftop:              ['high wind', 'dizzying heights', 'rain'],
  'corporate HQ':       ['glass shatters', 'alarms blare', 'sprinklers activate'],
  'port district':      ['sea spray', 'crane shadows', 'fog bank'],
  suburbs:              ['property damage', 'civilians flee', 'car alarms'],
  'abandoned facility': ['structural collapse risk', 'exposed wiring', 'darkness'],
  'government building':['security lockdown', 'bulletproof glass', 'armored doors'],
};

export default function CombatSimBattle({ combatants, onComplete, colors, battleConfig = {} }) {
  const { accentA, panel0, panel1, text0, text1, muted } = colors;

  const [phase, setPhase] = useState('analyzing');
  const [displayedLines, setDisplayedLines] = useState([]);
  const [hpA, setHpA] = useState(combatants.a?.current_hp || combatants.a?.max_hp || 100);
  const [hpB, setHpB] = useState(combatants.b?.current_hp || combatants.b?.max_hp || 100);
  const [maxHpA] = useState(combatants.a?.max_hp || combatants.a?.current_hp || 100);
  const [maxHpB] = useState(combatants.b?.max_hp || combatants.b?.current_hp || 100);
  const [currentAttacker, setCurrentAttacker] = useState(null);
  const [lastRound, setLastRound] = useState(null);
  const [statusA, setStatusA] = useState([]);
  const [statusB, setStatusB] = useState([]);
  const [envTrigger, setEnvTrigger] = useState(null);
  const [envActive, setEnvActive] = useState(false);

  const environment = battleConfig.environment || 'urban';
  const speedMultiplier = { slow: 1.8, normal: 1.0, fast: 0.5 }[battleConfig.speed || 'normal'];
  const envEffects = ENV_EFFECTS[environment] || ENV_EFFECTS['urban'];

  useEffect(() => { runSimulation(); }, []);

  const runSimulation = async () => {
    setPhase('analyzing');
    const a = combatants.a;
    const b = combatants.b;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are simulating a tactical combat encounter in the "Catalyst Core" TTRPG.

Environment: ${environment}
Environmental effects available: ${envEffects.join(', ')}
Intensity: ${battleConfig.intensity || 'standard'}
Rounds: ${battleConfig.rounds || '6-8'}
${battleConfig.narrative_style ? `Narrative style: ${battleConfig.narrative_style}` : ''}

Character A: ${a.name}
- Classification: ${a.classification || 'unknown'}
- Power Style: ${a.primary_power_style || 'unknown'}
- HP: ${a.current_hp || a.max_hp || 100}
- Toughness Class: ${a.toughness_class || 10}
- STR: ${a.ability_scores?.STR || 10}, DEX: ${a.ability_scores?.DEX || 10}, CON: ${a.ability_scores?.CON || 10}, INT: ${a.ability_scores?.INT || 10}
- Alignment: ${a.alignment || 'unknown'}
- Powers: ${a.powers?.slice(0,3).map(p => p.name).join(', ') || 'standard powers'}

Character B: ${b.name}
- Classification: ${b.classification || 'unknown'}
- Power Style: ${b.primary_power_style || 'unknown'}
- HP: ${b.current_hp || b.max_hp || 100}
- Toughness Class: ${b.toughness_class || 10}
- STR: ${b.ability_scores?.STR || 10}, DEX: ${b.ability_scores?.DEX || 10}, CON: ${b.ability_scores?.CON || 10}, INT: ${b.ability_scores?.INT || 10}
- Alignment: ${b.alignment || 'unknown'}
- Powers: ${b.powers?.slice(0,3).map(p => p.name).join(', ') || 'standard powers'}

Simulate a ${battleConfig.rounds || '6-8'} round dramatic combat. Use the environment actively.

Return JSON with:
- rounds: array of round objects each with:
  - round_number: number
  - attacker: "A" or "B"
  - action: short action description
  - damage: number 5-40
  - roll: number 1-20
  - hit: boolean
  - narration: 1-2 cinematic sentences
  - env_trigger: optional environmental effect string (e.g. "glass shatters overhead")
  - status_effect_on_target: optional status string applied (e.g. "STUNNED", "BURNING", "BLINDED") — null if none
  - status_clears_target: boolean (clears previous status if true)
  - critical: boolean (roll >= 18 AND hit)
- winner: "A" or "B"
- victory_narration: 2-3 sentence dramatic conclusion
- analysis: 2-3 sentence tactical breakdown
- mvp_moment: the single most dramatic moment of the fight
- performance_score_a: number 0-100 rating Character A's tactical performance based on their choices, positioning, and use of powers
- performance_score_b: number 0-100 rating Character B's tactical performance
- performance_analysis_a: 1-2 sentences evaluating Character A's combat style and decisions
- performance_analysis_b: 1-2 sentences evaluating Character B's combat style and decisions
- hero_code_rating: "EXEMPLARY"|"COMMENDABLE"|"ACCEPTABLE"|"CONCERNING"|"VIOLATION" — based on how the victor handled the fight (use of proportionate force, minimizing environmental damage)
- hero_code_note: 1 sentence justifying the hero code rating`,
      response_json_schema: {
        type: 'object',
        properties: {
          rounds: { type: 'array', items: { type: 'object', properties: {
            round_number: { type: 'number' }, attacker: { type: 'string' }, action: { type: 'string' },
            damage: { type: 'number' }, roll: { type: 'number' }, hit: { type: 'boolean' },
            narration: { type: 'string' }, env_trigger: { type: 'string' },
            status_effect_on_target: { type: 'string' }, status_clears_target: { type: 'boolean' },
            critical: { type: 'boolean' }
          } } },
          winner: { type: 'string' },
          victory_narration: { type: 'string' },
          analysis: { type: 'string' },
          mvp_moment: { type: 'string' },
          performance_score_a: { type: 'number' },
          performance_score_b: { type: 'number' },
          performance_analysis_a: { type: 'string' },
          performance_analysis_b: { type: 'string' },
          hero_code_rating: { type: 'string' },
          hero_code_note: { type: 'string' },
        }
      }
    });

    setPhase('simulating');

    let currentHpA = hpA;
    let currentHpB = hpB;
    const log = [];
    let curStatusA = [];
    let curStatusB = [];

    for (let i = 0; i < (result.rounds?.length || 0); i++) {
      const round = result.rounds[i];
      await new Promise(r => setTimeout(r, 900 * speedMultiplier));

      setCurrentAttacker(round.attacker);

      if (round.hit && round.damage) {
        const dmg = round.critical ? round.damage * 2 : round.damage;
        if (round.attacker === 'A') {
          currentHpB = Math.max(0, currentHpB - dmg);
          setHpB(currentHpB);
          if (round.status_clears_target) curStatusB = [];
          if (round.status_effect_on_target) curStatusB = [...curStatusB.filter(s => s !== round.status_effect_on_target), round.status_effect_on_target];
          setStatusB([...curStatusB]);
        } else {
          currentHpA = Math.max(0, currentHpA - dmg);
          setHpA(currentHpA);
          if (round.status_clears_target) curStatusA = [];
          if (round.status_effect_on_target) curStatusA = [...curStatusA.filter(s => s !== round.status_effect_on_target), round.status_effect_on_target];
          setStatusA([...curStatusA]);
        }
      }

      if (round.env_trigger) {
        setEnvTrigger(round.env_trigger);
        setEnvActive(true);
        setTimeout(() => setEnvActive(false), 1000);
      }

      const line = {
        round: round.round_number,
        attacker: round.attacker === 'A' ? combatants.a.name : combatants.b.name,
        action: round.action,
        hit: round.hit,
        damage: round.critical ? round.damage * 2 : round.damage,
        roll: round.roll,
        narration: round.narration,
        env_trigger: round.env_trigger,
        critical: round.critical,
        status: round.status_effect_on_target,
      };

      setLastRound({ ...line, attacker: line.attacker });
      log.push(line);
      setDisplayedLines(prev => [...prev, line]);

      await new Promise(r => setTimeout(r, 200 * speedMultiplier));
      setCurrentAttacker(null);
      setEnvTrigger(null);
    }

    await new Promise(r => setTimeout(r, 400));
    setPhase('finishing');

    const winnerName = result.winner === 'A' ? combatants.a.name : combatants.b.name;
    setTimeout(() => {
      onComplete([
        ...log,
        {
          isConclusion: true,
          narration: result.victory_narration,
          analysis: result.analysis,
          winner: winnerName,
          mvp_moment: result.mvp_moment,
          performance_score_a: result.performance_score_a,
          performance_score_b: result.performance_score_b,
          performance_analysis_a: result.performance_analysis_a,
          performance_analysis_b: result.performance_analysis_b,
          hero_code_rating: result.hero_code_rating,
          hero_code_note: result.hero_code_note,
        }
      ], winnerName);
    }, 1000);
  };

  return (
    <div className="space-y-4">
      {/* Arena */}
      <CombatArena
        charA={combatants.a}
        charB={combatants.b}
        hpA={hpA} hpB={hpB}
        maxHpA={maxHpA} maxHpB={maxHpB}
        currentAttacker={currentAttacker}
        lastRound={lastRound}
        environment={environment}
        statusA={statusA}
        statusB={statusB}
        envActive={envActive}
      />

      {/* Environmental trigger flash */}
      <AnimatePresence>
        {envTrigger && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="text-center text-xs font-mono italic py-1.5 rounded"
            style={{ background: '#FFC85720', color: '#FFC857', border: '1px solid #FFC85740' }}>
            ⚡ {envTrigger}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status */}
      <div className="text-center text-xs font-mono" style={{ color: phase === 'analyzing' ? muted : phase === 'finishing' ? accentA : accentA }}>
        {phase === 'analyzing' && <span className="animate-pulse">ANALYZING COMBATANTS...</span>}
        {phase === 'simulating' && <span className="flex items-center justify-center gap-2"><Swords className="h-3.5 w-3.5 animate-pulse" />SIMULATION IN PROGRESS</span>}
        {phase === 'finishing' && 'COMPILING RESULTS...'}
      </div>

      {/* Combat log */}
      <div className="rounded-lg p-3 space-y-2 max-h-80 overflow-y-auto" style={{ background: panel0, border: `1px solid ${accentA}20` }}>
        <div className="text-[10px] font-mono uppercase tracking-widest mb-2" style={{ color: muted }}>Combat Log</div>
        <AnimatePresence>
          {displayedLines.map((line, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, x: line.attacker === combatants.a.name ? -10 : 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-2.5 rounded text-xs"
              style={{ background: line.critical ? accentA + '12' : panel1, border: line.critical ? `1px solid ${accentA}40` : 'none' }}>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="font-mono text-[9px] uppercase tracking-wide" style={{ color: muted }}>RND {line.round}</span>
                {line.critical && <span className="text-[9px] font-mono font-black px-1 rounded" style={{ background: '#FFD700', color: '#000' }}>CRIT!</span>}
                <span className="font-mono font-bold" style={{ color: line.attacker === combatants.a.name ? accentA : '#FF6B6B' }}>{line.attacker}</span>
                <span style={{ color: text1 }}>{line.action}</span>
                <span className="ml-auto font-mono text-[10px]" style={{ color: line.roll >= 18 ? '#FFD700' : line.roll >= 12 ? '#00D1B2' : line.roll >= 8 ? '#FFC857' : '#FF3B3B' }}>[{line.roll}]</span>
                {line.hit && <span className="font-mono text-[10px]" style={{ color: '#FF3B3B' }}>-{line.damage}</span>}
                {!line.hit && <span className="font-mono text-[10px]" style={{ color: muted }}>MISS</span>}
                {line.status && <span className="text-[9px] font-mono px-1 rounded" style={{ background: '#A855F730', color: '#A855F7' }}>{line.status}</span>}
              </div>
              <p className="italic" style={{ color: muted }}>{line.narration}</p>
              {line.env_trigger && <p className="text-[10px] mt-0.5" style={{ color: '#FFC857' }}>⚡ {line.env_trigger}</p>}
            </motion.div>
          ))}
        </AnimatePresence>
        {displayedLines.length === 0 && (
          <div className="text-center py-8 text-xs font-mono animate-pulse" style={{ color: muted }}>Awaiting combat data...</div>
        )}
      </div>
    </div>
  );
}