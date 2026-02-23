import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, BookOpen, Swords, Shield, ArrowRight, Sparkles, User,
  Dices, Heart, Settings, Scroll, DollarSign, BookMarked, Award,
  Map, Radio, ChevronRight, Activity, Database, Lock
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import CharacterSelector from '@/components/character/CharacterSelector';
import PullToRefresh from '@/components/utils/PullToRefresh';
import { cn } from '@/lib/utils';

// ─── HUD Stat Tile ────────────────────────────────────────────────────────────
function StatTile({ label, value, sub, color = 'cyan', pulse = false }) {
  const colors = {
    cyan:   { val: 'var(--omni-cyan)',   glow: 'var(--omni-cyan-glow)' },
    amber:  { val: 'var(--omni-amber)',  glow: 'var(--omni-amber-glow)' },
    red:    { val: 'var(--omni-red)',    glow: 'var(--omni-red-glow)' },
    violet: { val: 'var(--omni-violet)', glow: 'var(--omni-violet-glow)' },
  };
  const c = colors[color] || colors.cyan;
  return (
    <div className="hud-panel p-3 flex flex-col items-center gap-1 relative">
      <span className="hud-label">{label}</span>
      <span
        className={cn("text-2xl font-bold font-mono tabular-nums", pulse && "animate-pulse")}
        style={{ color: c.val, textShadow: `0 0 12px ${c.glow}` }}
      >
        {value}
      </span>
      {sub && <span className="hud-label" style={{ color: 'var(--omni-text-muted)' }}>{sub}</span>}
    </div>
  );
}

// ─── Feature Card ─────────────────────────────────────────────────────────────
function FeatureCard({ icon: Icon, title, description, color, onClick }) {
  const accentColors = {
    'from-red-500 to-orange-600':      { border: 'rgba(239,68,68,0.3)',   icon: '#ef4444' },
    'from-indigo-500 to-purple-600':   { border: 'rgba(99,102,241,0.3)',  icon: '#818cf8' },
    'from-yellow-500 to-amber-600':    { border: 'rgba(245,158,11,0.3)',  icon: '#fbbf24' },
    'from-cyan-500 to-blue-600':       { border: 'rgba(0,212,255,0.3)',   icon: 'var(--omni-cyan)' },
    'from-emerald-500 to-green-600':   { border: 'rgba(16,185,129,0.3)',  icon: '#34d399' },
    'from-amber-500 to-yellow-600':    { border: 'rgba(245,158,11,0.3)',  icon: '#fbbf24' },
    'from-slate-500 to-slate-600':     { border: 'rgba(100,116,139,0.3)', icon: '#94a3b8' },
    'from-rose-500 to-pink-600':       { border: 'rgba(244,63,94,0.3)',   icon: '#fb7185' },
    'from-cyan-500 to-teal-600':       { border: 'rgba(20,184,166,0.3)',  icon: '#2dd4bf' },
  };
  const accent = accentColors[color] || { border: 'rgba(0,212,255,0.2)', icon: 'var(--omni-cyan)' };

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -2, scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      className="w-full text-left group relative rounded-lg p-3 transition-all duration-200"
      style={{
        background: 'var(--omni-panel)',
        border: `1px solid ${accent.border}`,
      }}
    >
      {/* Corner brackets */}
      <span className="absolute top-0 left-0 w-3 h-3 border-t border-l opacity-60 rounded-tl"
        style={{ borderColor: accent.icon }} />
      <span className="absolute bottom-0 right-0 w-3 h-3 border-b border-r opacity-60 rounded-br"
        style={{ borderColor: accent.icon }} />

      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ background: `${accent.border}`, border: `1px solid ${accent.icon}40` }}>
          <Icon className="h-4 w-4" style={{ color: accent.icon }} />
        </div>
        <div className="min-w-0">
          <div className="text-xs font-bold text-white tracking-wide">{title}</div>
          <div className="text-[10px] mt-0.5 line-clamp-1" style={{ color: 'var(--omni-text-dim)' }}>{description}</div>
        </div>
        <ChevronRight className="h-3 w-3 ml-auto flex-shrink-0 mt-1 opacity-0 group-hover:opacity-60 transition-opacity"
          style={{ color: accent.icon }} />
      </div>
    </motion.button>
  );
}

// ─── Character HUD Block ──────────────────────────────────────────────────────
function CharacterHUDBlock({ character }) {
  if (!character) return null;
  const hp = character.current_hp ?? character.max_hp ?? 0;
  const maxHp = character.max_hp ?? 0;
  const hpPct = maxHp > 0 ? Math.max(0, Math.min(100, (hp / maxHp) * 100)) : 0;
  const sp = character.current_sp ?? character.max_sp ?? 0;
  const maxSp = character.max_sp ?? 0;
  const spPct = maxSp > 0 ? Math.max(0, Math.min(100, (sp / maxSp) * 100)) : 0;
  const ac = character.armor_class ?? character.toughness_class ?? 10;

  const hpBarClass = hp <= 0 ? 'hp-bar-dead' : hpPct <= 39 ? 'hp-bar-low' : hpPct <= 74 ? 'hp-bar-mid' : 'hp-bar-healthy';
  const hpLabel = hp <= 0 ? '☠ DOWNED' : hpPct <= 39 ? '⚠ CRITICAL' : hpPct <= 74 ? '◆ BLOODIED' : '✓ NOMINAL';
  const hpLabelColor = hp <= 0 ? 'var(--omni-red)' : hpPct <= 39 ? 'var(--omni-red)' : hpPct <= 74 ? 'var(--omni-amber)' : 'var(--omni-cyan)';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="hud-panel p-4 space-y-4"
    >
      {/* Character identity */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0"
          style={{ border: '1px solid rgba(0,212,255,0.3)', boxShadow: '0 0 10px rgba(0,212,255,0.15)' }}>
          {character.portrait_url ? (
            <img src={character.portrait_url} alt={character.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ background: 'rgba(0,212,255,0.08)' }}>
              <User className="h-5 w-5" style={{ color: 'var(--omni-cyan)' }} />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-white text-sm truncate">{character.name}</div>
          <div className="hud-label" style={{ color: 'var(--omni-cyan-dim)' }}>
            TIER {character.tier ?? 0} · {(character.classification || 'vigilante').replace(/_/g, ' ').toUpperCase()}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Radio className="h-3 w-3 animate-pulse" style={{ color: 'var(--omni-cyan)' }} />
          <span className="hud-label" style={{ color: 'var(--omni-cyan)' }}>SYNC</span>
        </div>
      </div>

      <div className="hud-divider" />

      {/* HP */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1.5">
            <Heart className="h-3 w-3 text-red-400" />
            <span className="hud-label">Hit Points</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="hud-label" style={{ color: hpLabelColor }}>{hpLabel}</span>
            <span className="font-bold font-mono text-sm" style={{ color: hpLabelColor }}>
              {hp}<span style={{ color: 'var(--omni-text-muted)' }}>/{maxHp}</span>
            </span>
          </div>
        </div>
        <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className={cn("h-full rounded-full hp-bar-fill", hpBarClass)} style={{ width: `${hpPct}%` }} />
        </div>
      </div>

      {/* SP */}
      {maxSp > 0 && (
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1.5">
              <Zap className="h-3 w-3" style={{ color: 'var(--omni-cyan)' }} />
              <span className="hud-label">Stamina Points</span>
            </div>
            <span className="font-bold font-mono text-sm" style={{ color: 'var(--omni-cyan)' }}>
              {sp}<span style={{ color: 'var(--omni-text-muted)' }}>/{maxSp}</span>
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.5)' }}>
            <div className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${spPct}%`,
                background: spPct < 40 ? 'var(--omni-amber)' : 'var(--omni-cyan)',
                boxShadow: `0 0 6px ${spPct < 40 ? 'var(--omni-amber-glow)' : 'var(--omni-cyan-glow)'}`
              }} />
          </div>
        </div>
      )}

      {/* Quick stats row */}
      <div className="grid grid-cols-3 gap-2 pt-1">
        <div className="text-center rounded-md p-2" style={{ background: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.12)' }}>
          <div className="hud-label">AC</div>
          <div className="font-bold font-mono text-lg text-white">{ac}</div>
        </div>
        <div className="text-center rounded-md p-2" style={{ background: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.12)' }}>
          <div className="hud-label">SPEED</div>
          <div className="font-bold font-mono text-lg text-white">{character.speed ?? 30}</div>
        </div>
        <div className="text-center rounded-md p-2" style={{ background: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.12)' }}>
          <div className="hud-label">LVL</div>
          <div className="font-bold font-mono text-lg" style={{ color: 'var(--omni-cyan)' }}>{character.level ?? 1}</div>
        </div>
      </div>

      <Link to={createPageUrl(`CharacterSheet?id=${character.id}`)}>
        <Button className="w-full btn-cyan gap-2 mt-1">
          <Activity className="h-4 w-4" />
          Open Field Dossier
          <ChevronRight className="h-4 w-4 ml-auto" />
        </Button>
      </Link>
    </motion.div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function Home() {
  const [showCharacterSelector, setShowCharacterSelector] = useState(false);
  const queryClient = useQueryClient();

  const { data: characters = [] } = useQuery({
    queryKey: ['characters'],
    queryFn: () => base44.entities.Character.list('-created_date'),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false
  });

  const handleRefresh = async () => {
    await queryClient.refetchQueries({ queryKey: ['characters'] });
  };

  const handleCharacterSelect = (character) => {
    localStorage.setItem('currentCharacter', JSON.stringify(character));
    setShowCharacterSelector(false);
    window.dispatchEvent(new CustomEvent('characterChanged', { detail: character }));
  };

  const currentCharacter = (() => {
    try {
      const stored = localStorage.getItem('currentCharacter');
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  })();

  const features = [
    { icon: Swords,     title: 'Combat Tracker',   description: 'Track encounters & HP',         link: currentCharacter ? `CharacterSheet?id=${currentCharacter.id}` : null, action: !currentCharacter ? () => setShowCharacterSelector(true) : null, color: 'from-red-500 to-orange-600' },
    { icon: BookMarked, title: 'Journal',           description: 'Character notes',               link: currentCharacter ? `CharacterSheet?id=${currentCharacter.id}` : null, action: !currentCharacter ? () => setShowCharacterSelector(true) : null, color: 'from-indigo-500 to-purple-600' },
    { icon: Award,      title: 'Achievements',      description: 'Medals & milestones',           link: currentCharacter ? `CharacterSheet?id=${currentCharacter.id}` : null, action: !currentCharacter ? () => setShowCharacterSelector(true) : null, color: 'from-yellow-500 to-amber-600' },
    { icon: User,       title: 'Character Sheet',   description: currentCharacter?.name ?? 'Select a character', link: currentCharacter ? `CharacterSheet?id=${currentCharacter.id}` : null, action: !currentCharacter ? () => setShowCharacterSelector(true) : null, color: 'from-cyan-500 to-blue-600' },
    { icon: Dices,      title: 'Dice Roller',       description: 'Roll d20s & skill checks',      link: 'DiceRoller',     color: 'from-emerald-500 to-green-600' },
    { icon: DollarSign, title: 'Economy',           description: 'Trade & manage credits',        link: 'Economy',        color: 'from-amber-500 to-yellow-600' },
    { icon: Scroll,     title: 'Rules Reference',   description: 'Game system manual',            link: 'Rules',          color: 'from-slate-500 to-slate-600' },
    { icon: Map,        title: 'Operations Map',    description: 'Manhattan tactical theater',    link: 'OperationsMap',  color: 'from-cyan-500 to-teal-600' },
    { icon: BookOpen,   title: 'Campaigns',         description: 'View active campaigns',         link: 'Campaigns',      color: 'from-indigo-500 to-purple-600' },
    { icon: Settings,   title: 'Settings',          description: 'Customize & configure',         link: 'Settings',       color: 'from-rose-500 to-pink-600' },
  ];

  const handleFeatureClick = (feature) => {
    if (feature.action) { feature.action(); return; }
    if (feature.link) { window.location.href = createPageUrl(feature.link); }
  };

  return (
    <PullToRefresh onRefresh={handleRefresh} className="min-h-screen">
      <div className="max-w-2xl mx-auto px-3 sm:px-4 py-6 pb-24 space-y-5">

        {/* ── OMNI HEADER ── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="hud-panel p-4"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0"
              style={{ border: '1px solid rgba(0,212,255,0.35)', boxShadow: '0 0 16px rgba(0,212,255,0.2)' }}>
              <img
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/696d1e71c654a257ffdf4599/6fb07bdd9_IMG_4419.jpeg"
                alt="O.M.N.I. Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h1 className="text-xl font-bold tracking-[0.1em]"
                  style={{ color: 'var(--omni-cyan)', textShadow: '0 0 14px rgba(0,212,255,0.5)' }}>
                  CATALYST CORE
                </h1>
                <Radio className="h-3 w-3 animate-pulse flex-shrink-0" style={{ color: 'var(--omni-cyan)' }} />
              </div>
              <div className="hud-label" style={{ color: 'var(--omni-cyan-dim)' }}>
                O.M.N.I. TACTICAL FIELD SYSTEM · v2.4.1
              </div>
              <div className="flex items-center gap-3 mt-1.5">
                <span className="hud-label flex items-center gap-1" style={{ color: '#22c55e' }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
                  BEACON ONLINE
                </span>
                <span className="hud-label" style={{ color: 'var(--omni-text-muted)' }}>·</span>
                <span className="hud-label" style={{ color: 'var(--omni-text-muted)' }}>
                  {characters.length} AGENT{characters.length !== 1 ? 'S' : ''} REGISTERED
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── ACTIVE AGENT HUD ── */}
        <AnimatePresence mode="wait">
          {currentCharacter ? (
            <CharacterHUDBlock key={currentCharacter.id} character={currentCharacter} />
          ) : (
            <motion.div
              key="no-agent"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="hud-panel p-5 text-center space-y-3"
            >
              <div className="w-12 h-12 rounded-xl mx-auto flex items-center justify-center"
                style={{ background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.2)' }}>
                <Lock className="h-5 w-5" style={{ color: 'var(--omni-cyan-dim)' }} />
              </div>
              <div>
                <div className="hud-label mb-1" style={{ color: 'var(--omni-cyan-dim)' }}>NO ACTIVE AGENT LOADED</div>
                <p className="text-xs" style={{ color: 'var(--omni-text-dim)' }}>
                  Load a character dossier or create a new licensed vigilante.
                </p>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => setShowCharacterSelector(true)}
                  className="flex-1 btn-cyan gap-2 text-xs">
                  <Database className="h-3.5 w-3.5" /> Load Agent
                </Button>
                <Link to={createPageUrl('CreateCharacter')} className="flex-1">
                  <Button className="w-full gap-2 text-xs" style={{
                    background: 'rgba(124,58,237,0.15)',
                    border: '1px solid rgba(124,58,237,0.4)',
                    color: '#a78bfa'
                  }}>
                    <Sparkles className="h-3.5 w-3.5" /> New Agent
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── SYSTEM STATS ── */}
        <div className="grid grid-cols-3 gap-2">
          <StatTile label="POWER STYLES" value="7+" color="cyan" />
          <StatTile label="ORIGINS" value="10" color="violet" />
          <StatTile label="ALIGNMENTS" value="9" color="amber" />
        </div>

        {/* ── FEATURE GRID ── */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="hud-label" style={{ color: 'var(--omni-cyan-dim)' }}>SYSTEM ACCESS</div>
            <div className="flex-1 hud-divider" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i, duration: 0.3 }}
              >
                <FeatureCard
                  icon={f.icon}
                  title={f.title}
                  description={f.description}
                  color={f.color}
                  onClick={() => handleFeatureClick(f)}
                />
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── FOOTER ── */}
        <div className="text-center py-2">
          <div className="hud-label" style={{ color: 'var(--omni-text-muted)' }}>
            O.M.N.I. SECURE FIELD TERMINAL · CLEARANCE LEVEL ALPHA
          </div>
        </div>
      </div>

      {showCharacterSelector && (
        <CharacterSelector
          characters={characters}
          onSelect={handleCharacterSelect}
          onClose={() => setShowCharacterSelector(false)}
        />
      )}
    </PullToRefresh>
  );
}