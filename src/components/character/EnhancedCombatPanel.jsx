import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Shield, Heart, Zap, Move, HelpCircle, Swords,
  Eye, HandMetal, Target, Dices, SkipForward,
  RefreshCw, AlertTriangle, CircleDot, Circle } from
"lucide-react";
import { getModifier, formatModifier } from "./StatBlock";
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger } from
"@/components/ui/tooltip";
import { toast } from 'sonner';
import { postRollToDiscord } from '@/components/utils/postRollToDiscord';

// ─── HP Bar ──────────────────────────────────────────────────────────────────
function HPBar({ current, max }) {
  const pct = max > 0 ? Math.max(0, Math.min(100, current / max * 100)) : 0;
  const color = current <= 0 ?
  'bg-red-600 animate-pulse' :
  pct <= 39 ? 'bg-red-500' :
  pct <= 74 ? 'bg-yellow-500' :
  'bg-emerald-500';

  return (
    <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden">
      <div
        className={cn("h-full rounded-full transition-all duration-300", color)}
        style={{ width: `${pct}%` }} />

    </div>);

}

// ─── Combat Status Block ─────────────────────────────────────────────────────
function CombatStatus({ character, onUpdate }) {
  const [editingHP, setEditingHP] = useState(false);
  const [hpInput, setHpInput] = useState('');
  const [editingAC, setEditingAC] = useState(false);
  const [acInput, setAcInput] = useState('');
  const [editingMaxHP, setEditingMaxHP] = useState(false);
  const [maxHpInput, setMaxHpInput] = useState('');
  const [editingInit, setEditingInit] = useState(false);
  const [initInput, setInitInput] = useState('');
  const [lastInitRoll, setLastInitRoll] = useState(null);
  const [showDeathSaves, setShowDeathSaves] = useState(false);
  const [deathSuccesses, setDeathSuccesses] = useState([false, false, false]);
  const [deathFailures, setDeathFailures] = useState([false, false, false]);

  const dexMod = getModifier(character.ability_scores?.DEX || 10);
  const initiativeMod = character.initiative_modifier ?? dexMod;
  const currentHP = character.current_hp ?? character.max_hp ?? 0;
  const maxHP = character.max_hp ?? 0;
  const ac = character.armor_class ?? character.toughness_class ?? 10;
  const hpPct = maxHP > 0 ? currentHP / maxHP * 100 : 0;

  const adjustHP = (delta) => {
    const newHP = Math.max(0, Math.min(maxHP, currentHP + delta));
    onUpdate({ current_hp: newHP });
  };

  const commitHP = () => {
    const val = parseInt(hpInput);
    if (!isNaN(val)) onUpdate({ current_hp: Math.max(0, Math.min(maxHP, val)) });
    setEditingHP(false);
  };

  const commitAC = () => {
    const val = parseInt(acInput);
    if (!isNaN(val)) onUpdate({ armor_class: Math.max(0, val) });
    setEditingAC(false);
  };

  const commitMaxHP = () => {
    const val = parseInt(maxHpInput);
    if (!isNaN(val)) onUpdate({ max_hp: Math.max(1, val) });
    setEditingMaxHP(false);
  };

  const commitInit = () => {
    const val = parseInt(initInput);
    if (!isNaN(val)) onUpdate({ initiative_modifier: val });
    setEditingInit(false);
  };

  const rollInitiative = () => {
    const d20 = Math.floor(Math.random() * 20) + 1;
    const total = d20 + initiativeMod;
    setLastInitRoll(total);
    toast(
      <div className="flex flex-col gap-1">
        <div className="font-semibold text-white">Initiative Roll</div>
        <div className="flex items-center gap-2">
          <span className={cn("text-lg font-bold", d20 === 20 && "text-green-400", d20 === 1 && "text-red-400")}>{d20}</span>
          <span className="text-slate-400">+ {formatModifier(initiativeMod)} =</span>
          <span className="text-lg font-bold text-violet-400">{total}</span>
        </div>
        {d20 === 20 && <span className="text-xs text-green-400">Natural 20!</span>}
      </div>,
      { duration: 5000 }
    );
    postRollToDiscord({
      characterName: character.name,
      diceLabel: 'd20 Initiative',
      rolls: [d20],
      modifier: initiativeMod,
      total,
      label: 'Initiative',
      isCrit: d20 === 20,
      isFail: d20 === 1
    });
  };

  const hpColor = currentHP <= 0 ? 'text-red-400' : hpPct <= 39 ? 'text-red-300' : hpPct <= 74 ? 'text-yellow-300' : 'text-emerald-300';

  return (
    <div className="space-y-3">
      {/* COMBAT STATUS Header */}
      <div className="flex items-center gap-2">
        <div className="h-px flex-1 bg-gradient-to-r from-violet-500/50 to-transparent" />
        <span className="text-xs font-bold text-violet-400 uppercase tracking-[0.2em]">Combat Status</span>
        <div className="h-px flex-1 bg-gradient-to-l from-violet-500/50 to-transparent" />
      </div>

      {/* Main combat stats row: AC | HP | Initiative */}
      <div className="grid grid-cols-3 gap-3">
        {/* AC */}
        <div className="bg-slate-800/70 border border-slate-700 rounded-xl p-3 flex flex-col items-center gap-1 relative group">
          <Shield className="h-4 w-4 text-blue-400" />
          <span className="text-slate-400 text-xs font-semibold text-center uppercase tracking-wider">TOUGHNESS CLASS</span>
          {editingAC ?
          <Input
            autoFocus
            type="number"
            value={acInput}
            onChange={(e) => setAcInput(e.target.value)}
            onBlur={commitAC}
            onKeyDown={(e) => {if (e.key === 'Enter') commitAC();if (e.key === 'Escape') setEditingAC(false);}}
            className="h-8 w-16 text-center text-lg font-bold bg-slate-900 border-violet-500 text-white" /> :


          <button onClick={() => {setAcInput(String(ac));setEditingAC(true);}}
          className="text-3xl font-bold text-white hover:text-violet-300 transition-colors tabular-nums">
              {ac}
            </button>
          }
        </div>

        {/* HP - central dominant */}
        <div className={cn(
          "border rounded-xl p-3 flex flex-col items-center gap-1 relative col-span-1",
          currentHP <= 0 ? "border-red-500/70 bg-red-950/30" : "border-red-900/50 bg-red-950/20"
        )}>
          <Heart className={cn("h-4 w-4", currentHP <= 0 ? "text-red-400 animate-pulse" : "text-red-400")} />
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Hit Points</span>
          
          {editingHP ?
          <Input
            autoFocus
            type="number"
            value={hpInput}
            onChange={(e) => setHpInput(e.target.value)}
            onBlur={commitHP}
            onKeyDown={(e) => {if (e.key === 'Enter') commitHP();if (e.key === 'Escape') setEditingHP(false);}}
            className="h-8 w-20 text-center text-lg font-bold bg-slate-900 border-red-500 text-white" /> :


          <button onClick={() => {setHpInput(String(currentHP));setEditingHP(true);}}
          className="hover:opacity-80 transition-opacity">
              <span className={cn("text-3xl font-bold tabular-nums", hpColor)}>{currentHP}</span>
              <span className="text-slate-500 text-sm"> / </span>
              {editingMaxHP ?
            <Input
              autoFocus
              type="number"
              value={maxHpInput}
              onChange={(e) => setMaxHpInput(e.target.value)}
              onBlur={commitMaxHP}
              onKeyDown={(e) => {if (e.key === 'Enter') commitMaxHP();if (e.key === 'Escape') setEditingMaxHP(false);}}
              className="h-6 w-14 text-center text-base font-bold bg-slate-900 border-red-500 text-white inline-flex"
              onClick={(e) => e.stopPropagation()} /> :


            <span className="text-slate-400 text-sm cursor-pointer hover:text-white"
            onClick={(e) => {e.stopPropagation();setMaxHpInput(String(maxHP));setEditingMaxHP(true);}}>
                  {maxHP}
                </span>
            }
            </button>
          }
          
          {currentHP <= 0 &&
          <Badge className="bg-red-600 text-white text-[10px] px-1.5 py-0 animate-pulse">
              Critical Condition
            </Badge>
          }
        </div>

        {/* Initiative */}
        <div className="bg-slate-800/70 border border-slate-700 rounded-xl p-3 flex flex-col items-center gap-1">
          <Dices className="h-4 w-4 text-emerald-400" />
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Initiative</span>
          {editingInit ?
          <Input
            autoFocus
            type="number"
            value={initInput}
            onChange={(e) => setInitInput(e.target.value)}
            onBlur={commitInit}
            onKeyDown={(e) => {if (e.key === 'Enter') commitInit();if (e.key === 'Escape') setEditingInit(false);}}
            className="h-8 w-16 text-center text-lg font-bold bg-slate-900 border-violet-500 text-white" /> :


          <button onClick={() => {setInitInput(String(initiativeMod));setEditingInit(true);}}
          className="text-3xl font-bold text-white hover:text-emerald-300 transition-colors tabular-nums">
              {formatModifier(initiativeMod)}
            </button>
          }
          {lastInitRoll !== null &&
          <span className="text-[10px] text-emerald-400 font-semibold">Last: {lastInitRoll}</span>
          }
        </div>
      </div>

      {/* HP Bar */}
      <div className="space-y-1.5">
        <HPBar current={currentHP} max={maxHP} />
        <div className="flex justify-between text-[10px] text-slate-500">
          <span className={cn(hpPct <= 39 ? 'text-red-400' : hpPct <= 74 ? 'text-yellow-400' : 'text-emerald-400')}>
            {currentHP <= 0 ? '☠ Downed' : hpPct <= 39 ? '⚠ Critical' : hpPct <= 74 ? '◆ Bloodied' : '✓ Healthy'}
          </span>
          <span>{Math.round(hpPct)}%</span>
        </div>
      </div>

      {/* HP Quick Adjust */}
      <div className="grid grid-cols-7 gap-1">
        {[-10, -5, -1, null, +1, +5, +10].map((val, i) =>
        val === null ?
        <button key="heal" onClick={() => onUpdate({ current_hp: maxHP })}
        className="h-10 rounded-lg bg-emerald-600/20 border border-emerald-500/50 text-emerald-300 text-xs font-bold hover:bg-emerald-600/40 transition-all flex items-center justify-center">
              <RefreshCw className="h-3 w-3" />
            </button> :

        <button key={val} onClick={() => adjustHP(val)}
        className={cn(
          "h-10 rounded-lg border text-xs font-bold font-mono transition-all",
          val < 0 ?
          "bg-red-950/30 border-red-900/50 text-red-300 hover:bg-red-900/40" :
          "bg-emerald-950/30 border-emerald-900/50 text-emerald-300 hover:bg-emerald-900/40"
        )}>
              {val > 0 ? `+${val}` : val}
            </button>

        )}
      </div>

      {/* Roll Initiative Button */}
      <Button onClick={rollInitiative}
      className="w-full bg-emerald-600/20 hover:bg-emerald-600/40 border border-emerald-500/50 text-emerald-200 gap-2">
        <Dices className="h-4 w-4" />
        Roll Initiative {formatModifier(initiativeMod)}
      </Button>

      {/* Death Saves Toggle */}
      {currentHP <= 0 &&
      <div className="rounded-xl border border-red-900/50 bg-red-950/20 p-3">
          <button onClick={() => setShowDeathSaves(!showDeathSaves)}
        className="flex items-center gap-2 w-full text-red-300 font-semibold text-sm mb-2">
            <AlertTriangle className="h-4 w-4" />
            Death Save Tracker
            <span className="ml-auto text-xs text-slate-500">{showDeathSaves ? '▲' : '▼'}</span>
          </button>
          {showDeathSaves &&
        <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-xs text-emerald-400 w-16 font-semibold">Successes</span>
                <div className="flex gap-2">
                  {deathSuccesses.map((s, i) =>
              <button key={i} onClick={() => setDeathSuccesses((prev) => {const n = [...prev];n[i] = !n[i];return n;})}
              className={cn("h-7 w-7 rounded-full border-2 transition-all flex items-center justify-center",
              s ? "border-emerald-500 bg-emerald-500/30" : "border-slate-600")}>
                      {s && <CircleDot className="h-4 w-4 text-emerald-400" />}
                    </button>
              )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-red-400 w-16 font-semibold">Failures</span>
                <div className="flex gap-2">
                  {deathFailures.map((f, i) =>
              <button key={i} onClick={() => setDeathFailures((prev) => {const n = [...prev];n[i] = !n[i];return n;})}
              className={cn("h-7 w-7 rounded-full border-2 transition-all flex items-center justify-center",
              f ? "border-red-500 bg-red-500/30" : "border-slate-600")}>
                      {f && <CircleDot className="h-4 w-4 text-red-400" />}
                    </button>
              )}
                </div>
              </div>
              <button onClick={() => {setDeathSuccesses([false, false, false]);setDeathFailures([false, false, false]);}}
          className="text-xs text-slate-500 hover:text-slate-300 underline">Reset</button>
            </div>
        }
        </div>
      }
    </div>);

}

// ─── Action Economy ───────────────────────────────────────────────────────────
function ActionEconomy({ character }) {
  const [usedActions, setUsedActions] = useState({ action: false, movement: false, bonus_action: false, reaction: false });

  const toggle = (key) => setUsedActions((prev) => ({ ...prev, [key]: !prev[key] }));
  const reset = () => setUsedActions({ action: false, movement: false, bonus_action: false, reaction: false });

  const actions = [
  { id: 'action', label: 'Action', icon: Swords, desc: 'Attack, power, dash, dodge, help, hide, ready' },
  { id: 'movement', label: 'Movement', icon: Move, desc: `Move up to ${character.speed || 30} ft. Can split before/after action.` },
  { id: 'bonus_action', label: 'Bonus', icon: Zap, desc: 'Quick powers, abilities marked as bonus action' },
  { id: 'reaction', label: 'Reaction', icon: Shield, desc: 'Opportunity attack, counterspell, block/parry' }];


  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-sm">Action Economy</CardTitle>
          <Button size="sm" variant="outline" onClick={reset} className="h-7 text-xs px-2 border-slate-600 text-slate-400">
            <RefreshCw className="h-3 w-3 mr-1" /> Reset Turn
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {actions.map((a) =>
          <Tooltip key={a.id}>
              <TooltipTrigger asChild>
                <button onClick={() => toggle(a.id)}
              className={cn(
                "flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-all",
                usedActions[a.id] ?
                "border-slate-600 bg-slate-800/50 opacity-50" :
                "border-violet-500/50 bg-violet-500/10 hover:bg-violet-500/20"
              )}>
                  <a.icon className={cn("h-5 w-5", usedActions[a.id] ? "text-slate-500" : "text-violet-400")} />
                  <span className={cn("text-xs font-semibold", usedActions[a.id] ? "text-slate-500 line-through" : "text-white")}>
                    {a.label}
                  </span>
                </button>
              </TooltipTrigger>
              <TooltipContent><p className="max-w-[200px]">{a.desc}</p></TooltipContent>
            </Tooltip>
          )}
        </div>
      </CardContent>
    </Card>);

}

// ─── Attack Bonuses ───────────────────────────────────────────────────────────
function AttackBonuses({ character }) {
  const strMod = getModifier(character.ability_scores?.STR || 10);
  const dexMod = getModifier(character.ability_scores?.DEX || 10);

  const rollDice = (bonus, label) => {
    const roll = Math.floor(Math.random() * 20) + 1;
    const total = roll + bonus;
    const isCrit = roll === 20;
    const isFail = roll === 1;
    toast(
      <div className="flex flex-col gap-1">
        <div className="font-semibold">{label}</div>
        <div className="flex items-center gap-2">
          <span className={cn("text-lg font-bold", isCrit && "text-green-400", isFail && "text-red-400")}>{roll}</span>
          <span className="text-slate-400">+ {bonus} =</span>
          <span className="text-lg font-bold text-violet-400">{total}</span>
        </div>
        {isCrit && <span className="text-xs text-green-400">Critical Success!</span>}
        {isFail && <span className="text-xs text-red-400">Critical Failure!</span>}
      </div>,
      { duration: 4000 }
    );
    postRollToDiscord({ characterName: character.name, diceLabel: 'd20', rolls: [roll], modifier: bonus, total, label, isCrit, isFail });
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader className="pb-2"><CardTitle className="text-white text-sm">Attack Bonuses</CardTitle></CardHeader>
      <CardContent>
        <div className="grid sm:grid-cols-2 gap-2">
          {[
          { label: 'Melee Attack', sublabel: 'STR modifier', mod: strMod, color: 'red' },
          { label: 'Ranged Attack', sublabel: 'DEX modifier', mod: dexMod, color: 'blue' }].
          map(({ label, sublabel, mod, color }) =>
          <div key={label} className={cn(
            "p-3 rounded-lg border flex items-center gap-3",
            color === 'red' ? "bg-red-950/20 border-red-900/50" : "bg-blue-950/20 border-blue-900/50"
          )}>
              <div className="flex-1">
                <div className="text-white text-sm font-semibold">{label}</div>
                <div className="text-slate-500 text-xs">{sublabel}</div>
              </div>
              <div className={cn("text-2xl font-bold", color === 'red' ? "text-red-300" : "text-blue-300")}>
                {formatModifier(mod)}
              </div>
              <Button onClick={() => rollDice(mod, label)} size="sm"
            className={cn("gap-1 text-xs", color === 'red' ?
            "bg-red-600/20 hover:bg-red-600/30 border border-red-500/50 text-red-200" :
            "bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/50 text-blue-200")}>
                <Dices className="h-3 w-3" /> Roll
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>);

}

// ─── Powers Quick Reference ───────────────────────────────────────────────────
function PowersRef({ character }) {
  if (!character.powers?.length) return null;
  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader className="pb-2"><CardTitle className="text-white text-sm">Your Powers</CardTitle></CardHeader>
      <CardContent>
        <div className="grid sm:grid-cols-2 gap-2">
          {character.powers.map((power, idx) =>
          <div key={idx} className="p-3 bg-violet-950/20 border border-violet-900/50 rounded-lg">
              <div className="flex justify-between items-start mb-1">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-violet-400 flex-shrink-0" />
                  <span className="text-white font-semibold text-sm">{power.name}</span>
                </div>
                <Badge className="bg-blue-500/30 border-blue-500/50 text-blue-200 text-xs shrink-0">{power.sp_cost} SP</Badge>
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-slate-400 mb-1">
                <span>Range: {power.range}</span>
                {power.cooldown > 0 && <span>• CD: {power.cooldown}</span>}
                {power.save && <span>• {power.save} save</span>}
              </div>
              <p className="text-xs text-slate-300 line-clamp-2">{power.effect}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>);

}

// ─── Skills List ──────────────────────────────────────────────────────────────
function SkillsList({ character }) {
  const getSkillBonus = (skill, stat) => {
    const statMod = getModifier(character.ability_scores?.[stat] || 10);
    const prof = character.skills?.[skill] || 'none';
    const profBonus = prof === 'expert' ? 4 : prof === 'proficient' ? 2 : 0;
    return statMod + profBonus;
  };

  const rollDice = (bonus, label) => {
    const roll = Math.floor(Math.random() * 20) + 1;
    const total = roll + bonus;
    const isCrit = roll === 20;
    const isFail = roll === 1;
    toast(
      <div className="flex flex-col gap-1">
        <div className="font-semibold">{label}</div>
        <div className="flex items-center gap-2">
          <span className={cn("text-lg font-bold", isCrit && "text-green-400", isFail && "text-red-400")}>{roll}</span>
          <span className="text-slate-400">+ {bonus} =</span>
          <span className="text-lg font-bold text-violet-400">{total}</span>
        </div>
      </div>,
      { duration: 4000 }
    );
    postRollToDiscord({ characterName: character.name, diceLabel: 'd20', rolls: [roll], modifier: bonus, total, label, isCrit, isFail });
  };

  const skills = [
  { name: 'Athletics', stat: 'STR', skill: 'athletics' },
  { name: 'Acrobatics', stat: 'DEX', skill: 'acrobatics' },
  { name: 'Sleight of Hand', stat: 'DEX', skill: 'sleight_of_hand' },
  { name: 'Stealth', stat: 'DEX', skill: 'stealth' },
  { name: 'Arcana', stat: 'INT', skill: 'arcana' },
  { name: 'History', stat: 'INT', skill: 'history' },
  { name: 'Investigation', stat: 'INT', skill: 'investigation' },
  { name: 'Nature', stat: 'INT', skill: 'nature' },
  { name: 'Religion', stat: 'INT', skill: 'religion' },
  { name: 'Technology', stat: 'INT', skill: 'technology' },
  { name: 'Animal Handling', stat: 'WIS', skill: 'animal_handling' },
  { name: 'Insight', stat: 'WIS', skill: 'insight' },
  { name: 'Medicine', stat: 'WIS', skill: 'medicine' },
  { name: 'Perception', stat: 'WIS', skill: 'perception' },
  { name: 'Survival', stat: 'WIS', skill: 'survival' },
  { name: 'Deception', stat: 'CHA', skill: 'deception' },
  { name: 'Intimidation', stat: 'CHA', skill: 'intimidation' },
  { name: 'Performance', stat: 'CHA', skill: 'performance' },
  { name: 'Persuasion', stat: 'CHA', skill: 'persuasion' }];


  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader className="pb-2"><CardTitle className="text-white text-sm">Skills</CardTitle></CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-1.5">
          {skills.map(({ name, stat, skill }) => {
            const bonus = getSkillBonus(skill, stat);
            return (
              <div key={skill} className="flex items-center gap-2 p-2 bg-slate-700/30 rounded">
                <span className="flex-1 text-slate-200 text-sm">{name}</span>
                <span className="text-[10px] text-slate-500">{stat}</span>
                <Badge variant="outline" className="font-mono text-xs text-white border-violet-500/50 min-w-[2.5rem] justify-center">
                  {formatModifier(bonus)}
                </Badge>
                <button onClick={() => rollDice(bonus, `${name} (${stat})`)}
                className="h-7 w-7 rounded text-violet-400 hover:text-violet-300 hover:bg-violet-500/20 flex items-center justify-center">
                  <Dices className="h-3.5 w-3.5" />
                </button>
              </div>);

          })}
        </div>
      </CardContent>
    </Card>);

}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function EnhancedCombatPanel({ character, onUpdate }) {
  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Combat Status - top priority */}
        <Card className="bg-slate-800/50 border-slate-700 border-violet-500/30">
          <CardContent className="pt-4">
            <CombatStatus character={character} onUpdate={onUpdate} />
          </CardContent>
        </Card>

        {/* SP Tracker */}
        <Card className="bg-blue-950/20 border-blue-900/50">
          <CardContent className="pt-4 pb-4 space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="h-4 w-4 text-blue-400" />
              <span className="text-xs font-bold text-blue-300 uppercase tracking-wider">Stamina Points</span>
              <span className="ml-auto text-white font-bold font-mono text-lg">
                {character.current_sp ?? character.max_sp ?? 0} / {character.max_sp ?? 0}
              </span>
            </div>
            <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full transition-all"
              style={{ width: `${(character.current_sp ?? character.max_sp ?? 0) / Math.max(1, character.max_sp ?? 1) * 100}%` }} />
            </div>
            <div className="grid grid-cols-6 gap-1 pt-1">
              {[-3, -2, -1, +1, +2, +3].map((v) =>
              <button key={v} onClick={() => {
                const cur = character.current_sp ?? character.max_sp ?? 0;
                const max = character.max_sp ?? 0;
                onUpdate({ current_sp: Math.max(0, Math.min(max, cur + v)) });
              }}
              className={cn(
                "h-8 rounded border text-xs font-bold font-mono transition-all",
                v < 0 ?
                "bg-blue-950/30 border-blue-900/50 text-blue-300 hover:bg-blue-900/40" :
                "bg-emerald-950/30 border-emerald-900/50 text-emerald-300 hover:bg-emerald-900/40"
              )}>
                  {v > 0 ? `+${v}` : v}
                </button>
              )}
            </div>
          </CardContent>
        </Card>

        <ActionEconomy character={character} />
        <AttackBonuses character={character} />
        <PowersRef character={character} />
        <SkillsList character={character} />
      </div>
    </TooltipProvider>);

}