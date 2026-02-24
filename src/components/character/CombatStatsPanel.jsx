import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Shield, Heart, Zap, Move } from "lucide-react";
import { getModifier, formatModifier } from "./StatBlock";
import { useTheme } from '@/components/theme/useTheme';

function HpBar({ value, max, color }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="cc-bar-track mt-1.5">
      <div
        className="cc-bar-fill"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, accentColor, bg, text0, muted }) {
  return (
    <div className="rounded-lg border p-3" style={{ background: bg, borderColor: accentColor + '35' }}>
      <div className="flex items-center gap-1.5 mb-1">
        <Icon className="h-3.5 w-3.5" style={{ color: accentColor }} />
        <span className="text-[10px] font-mono uppercase tracking-[0.12em]" style={{ color: accentColor }}>{label}</span>
      </div>
      <div className="text-xl font-mono font-bold" style={{ color: text0 }}>{value}</div>
      {sub && <div className="text-[10px] mt-1" style={{ color: muted }}>{sub}</div>}
    </div>
  );
}

export default function CombatStatsPanel({ character }) {
  const { theme } = useTheme();
  const c = theme?.colors || {};
  const accentA = c.accentA || '#00E5FF';
  const panel0 = c.panel0 || '#1A1F26';
  const panel1 = c.panel1 || '#202833';
  const text0 = c.text0 || '#E6F1FF';
  const text1 = c.text1 || '#8EA0B5';
  const muted = c.muted || '#5F6E80';

  const getSkillBonus = (skill, stat) => {
    const statMod = getModifier(character.ability_scores?.[stat] || 10);
    const proficiency = character.skills?.[skill] || 'none';
    const profBonus = proficiency === 'expert' ? 4 : proficiency === 'proficient' ? 2 : 0;
    return statMod + profBonus;
  };

  const hpPct = Math.max(0, Math.min(100, ((character.current_hp || 0) / (character.max_hp || 1)) * 100));
  const spPct = character.max_sp ? Math.max(0, Math.min(100, ((character.current_sp || 0) / character.max_sp) * 100)) : 100;

  // Dynamic HP color based on percentage
  const hpColor = hpPct >= 75 ? (c.success || '#00D1B2') : hpPct >= 40 ? (c.warning || '#FFC857') : (c.danger || '#FF3B3B');
  const spColor = spPct >= 50 ? accentA : spPct > 0 ? (c.warning || '#FFC857') : (c.warning || '#FFC857');

  return (
    <div className="space-y-4">
      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <div className="rounded-lg border p-3 col-span-2 md:col-span-1" style={{ background: panel0, borderColor: hpColor + '35' }}>
          <div className="flex items-center gap-1.5 mb-1">
            <Heart className="h-3.5 w-3.5" style={{ color: hpColor }} />
            <span className="text-[10px] font-mono uppercase tracking-[0.12em]" style={{ color: hpColor }}>HP</span>
          </div>
          <div className="text-xl font-mono font-bold" style={{ color: text0 }}>
            {character.current_hp}/{character.max_hp}
          </div>
          <HpBar value={character.current_hp || 0} max={character.max_hp || 1} color={hpColor} />
        </div>

        <div className="rounded-lg border p-3 col-span-2 md:col-span-1" style={{ background: panel0, borderColor: spColor + '35' }}>
          <div className="flex items-center gap-1.5 mb-1">
            <Zap className="h-3.5 w-3.5" style={{ color: spColor }} />
            <span className="text-[10px] font-mono uppercase tracking-[0.12em]" style={{ color: spColor }}>SP</span>
          </div>
          <div className="text-xl font-mono font-bold" style={{ color: text0 }}>
            {character.current_sp ?? '—'}/{character.max_sp ?? '—'}
          </div>
          <HpBar value={character.current_sp || 0} max={character.max_sp || 1} color={spColor} />
        </div>

        <StatCard icon={Shield} label="TC" value={character.toughness_class || 10} sub="Toughness Class" accentColor={accentA} bg={panel0} text0={text0} muted={muted} />
        <StatCard icon={Move} label="Speed" value={`${character.speed || 30} ft`} sub="Movement" accentColor={c.accentB || '#5CCFFF'} bg={panel0} text0={text0} muted={muted} />
      </div>

      {/* Ability Scores */}
      <div className="rounded-lg border overflow-hidden" style={{ background: panel0, borderColor: accentA + '20' }}>
        <div className="px-4 py-2 border-b" style={{ borderColor: accentA + '15' }}>
          <span className="text-[10px] font-mono font-bold uppercase tracking-[0.18em]" style={{ color: muted }}>ABILITY SCORES</span>
        </div>
        <div className="p-3 grid grid-cols-3 md:grid-cols-6 gap-2">
          {Object.entries(character.ability_scores || {}).map(([stat, score]) => (
            <div key={stat} className="text-center rounded border py-2" style={{ background: panel1, borderColor: accentA + '18' }}>
              <div className="text-[9px] font-mono uppercase tracking-wider" style={{ color: muted }}>{stat}</div>
              <div className="text-lg font-mono font-bold" style={{ color: text0 }}>{score}</div>
              <div className="text-xs font-mono font-bold" style={{ color: accentA }}>{formatModifier(getModifier(score))}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Combat Skills */}
      <div className="rounded-lg border overflow-hidden" style={{ background: panel0, borderColor: accentA + '20' }}>
        <div className="px-4 py-2 border-b" style={{ borderColor: accentA + '15' }}>
          <span className="text-[10px] font-mono font-bold uppercase tracking-[0.18em]" style={{ color: muted }}>COMBAT SKILLS</span>
        </div>
        <div className="p-3 grid md:grid-cols-2 gap-1.5">
          {[
            ['Athletics', 'athletics', 'STR'],
            ['Acrobatics', 'acrobatics', 'DEX'],
            ['Stealth', 'stealth', 'DEX'],
            ['Perception', 'perception', 'WIS'],
            ['Investigation', 'investigation', 'INT'],
            ['Insight', 'insight', 'WIS'],
            ['Intimidation', 'intimidation', 'CHA'],
          ].map(([label, skill, stat]) => (
            <div key={skill} className="flex items-center justify-between px-3 py-2 rounded border"
              style={{ background: panel1, borderColor: accentA + '12' }}>
              <span className="text-xs" style={{ color: text1 }}>{label}</span>
              <span className="text-xs font-mono font-bold" style={{ color: accentA }}>
                {formatModifier(getSkillBonus(skill, stat))}
              </span>
            </div>
          ))}
          <div className="flex items-center justify-between px-3 py-2 rounded border"
            style={{ background: panel1, borderColor: accentA + '12' }}>
            <span className="text-xs" style={{ color: text1 }}>Initiative</span>
            <span className="text-xs font-mono font-bold" style={{ color: accentA }}>
              {formatModifier(character.initiative_modifier ?? getModifier(character.ability_scores?.DEX || 10))}
            </span>
          </div>
        </div>
      </div>

      {/* Powers */}
      {character.powers?.length > 0 && (
        <div className="rounded-lg border overflow-hidden" style={{ background: panel0, borderColor: accentA + '20' }}>
          <div className="px-4 py-2 border-b" style={{ borderColor: accentA + '15' }}>
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.18em]" style={{ color: muted }}>POWERS</span>
          </div>
          <div className="p-3 space-y-2">
            {character.powers.map((power, idx) => (
              <div key={idx} className="p-3 rounded border" style={{ background: panel1, borderColor: accentA + '18' }}>
                <div className="flex justify-between items-start mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium" style={{ color: text0 }}>{power.name}</span>
                    {power.is_signature_move && (
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded" style={{ background: accentA + '25', color: accentA }}>SIG</span>
                    )}
                  </div>
                  <span className="text-xs font-mono" style={{ color: accentA }}>{power.sp_cost} SP</span>
                </div>
                <div className="flex gap-3 text-[10px] font-mono mb-1" style={{ color: muted }}>
                  <span>RANGE: {power.range}</span>
                  {power.cooldown > 0 && <span>CD: {power.cooldown}</span>}
                </div>
                <p className="text-xs" style={{ color: text1 }}>{power.effect}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Equipped Items */}
      {character.equipment?.filter(e => e.equipped).length > 0 && (
        <div className="rounded-lg border overflow-hidden" style={{ background: panel0, borderColor: accentA + '20' }}>
          <div className="px-4 py-2 border-b" style={{ borderColor: accentA + '15' }}>
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.18em]" style={{ color: muted }}>EQUIPPED</span>
          </div>
          <div className="p-3 space-y-1.5">
            {character.equipment.filter(e => e.equipped).map((item, idx) => (
              <div key={idx} className="flex items-center justify-between px-3 py-2 rounded border"
                style={{ background: panel1, borderColor: accentA + '12' }}>
                <div>
                  <span className="text-sm font-medium" style={{ color: text0 }}>{item.name}</span>
                  {item.bonus && <span className="text-xs ml-2" style={{ color: accentA }}>{item.bonus}</span>}
                </div>
                <span className="text-[10px] font-mono uppercase" style={{ color: muted }}>{item.type}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}