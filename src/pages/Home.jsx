import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Zap, Users, BookOpen, Swords, Shield, ArrowRight, Sparkles, User, FileText, Dices, Heart, Settings, Scroll, DollarSign, BookMarked, Award, Map, Radio } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import CharacterSelector from '@/components/character/CharacterSelector';
import PullToRefresh from '@/components/utils/PullToRefresh';
import { useTheme } from '@/components/theme/useTheme';
import DashboardWidgets from '@/components/dashboard/DashboardWidgets';
import NotificationCenter from '@/components/dashboard/NotificationCenter';

export default function Home() {
  const [showCharacterSelector, setShowCharacterSelector] = useState(false);
  const queryClient = useQueryClient();
  const { theme, mode } = useTheme();

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

  const c = theme?.colors || {};
  const m = theme?.motion || {};
  const accentA = c.accentA || '#00E5FF';
  const accentB = c.accentB || '#5CCFFF';
  const bg0 = c.bg0 || '#0F1216';
  const panel0 = c.panel0 || '#1A1F26';
  const panel1 = c.panel1 || '#202833';
  const text0 = c.text0 || '#E6F1FF';
  const text1 = c.text1 || '#8EA0B5';
  const muted = c.muted || '#5F6E80';
  const easing = Array.isArray(m.easing) ? m.easing : [0.2, 0.8, 0.2, 1];

  const features = [
    { icon: Swords,     title: 'Combat',        desc: 'Track encounters',         link: currentCharacter ? `CharacterSheet?id=${currentCharacter.id}` : null, action: !currentCharacter ? () => setShowCharacterSelector(true) : null },
    { icon: BookMarked, title: 'Journal',        desc: 'Notes & entries',          link: currentCharacter ? `CharacterSheet?id=${currentCharacter.id}` : null, action: !currentCharacter ? () => setShowCharacterSelector(true) : null },
    { icon: Award,      title: 'Achievements',   desc: 'Track milestones',         link: currentCharacter ? `CharacterSheet?id=${currentCharacter.id}` : null, action: !currentCharacter ? () => setShowCharacterSelector(true) : null },
    { icon: User,       title: 'Character',      desc: currentCharacter ? currentCharacter.name : 'Select first', link: currentCharacter ? `CharacterSheet?id=${currentCharacter.id}` : null, action: !currentCharacter ? () => setShowCharacterSelector(true) : null },
    { icon: Dices,      title: 'Dice Roller',    desc: 'd20s & checks',            link: 'DiceRoller' },
    { icon: DollarSign, title: 'Economy',        desc: 'Credits & trade',          link: 'Economy' },
    { icon: Map,        title: 'Ops Map',        desc: 'Tactical theater',         link: 'OperationsMap' },
    { icon: Scroll,     title: 'Rules',          desc: 'System reference',         link: 'Rules' },
    { icon: BookOpen,   title: 'Campaigns',      desc: 'Mission logs',             link: 'Campaigns' },
    { icon: Settings,   title: 'Settings',       desc: 'Configure HUD',            link: 'Settings' },
  ];

  const quickStats = [
    { label: 'POWER STYLES', value: '7+' },
    { label: 'ORIGINS', value: '10' },
    { label: 'ALIGNMENTS', value: '9' },
  ];

  return (
    <PullToRefresh onRefresh={handleRefresh} className="min-h-screen relative">
      <div className="relative max-w-5xl mx-auto px-3 sm:px-4 lg:px-6 py-8 pb-24">

        {/* ── HERO ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: easing }}
          className="text-center mb-10 sm:mb-14"
        >
          {/* Logo */}
          <div className="relative inline-flex mb-5">
            <div
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden"
              style={{ border: `1px solid ${accentA}35`, boxShadow: `0 0 24px ${accentA}22` }}
            >
              <img
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/696d1e71c654a257ffdf4599/f2f2a4ed9_3DLogoLab1.png"
                alt="O.M.N.I. Logo"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Live indicator */}
            <span
              className="absolute -top-1 -right-1 h-3 w-3 rounded-full animate-pulse"
              style={{ background: c.success || '#00D1B2', boxShadow: `0 0 6px ${c.success || '#00D1B2'}` }}
            />
          </div>

          {/* Title */}
          <h1
            className="font-mono font-bold tracking-[0.18em] text-2xl sm:text-3xl md:text-4xl mb-1"
            style={{ color: text0 }}
          >
            CATALYST CORE
          </h1>
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="h-px w-12" style={{ background: accentA, opacity: 0.35 }} />
            <span className="text-[10px] font-mono tracking-[0.28em]" style={{ color: muted }}>
              {theme?.faction || 'O.M.N.I.'} // FIELD EDITION
            </span>
            <Radio className="h-2.5 w-2.5 animate-pulse" style={{ color: accentA }} />
            <div className="h-px w-12" style={{ background: accentA, opacity: 0.35 }} />
          </div>

          <p className="text-sm max-w-md mx-auto mb-7 px-2" style={{ color: text1 }}>
            Licensed vigilante field operating system. Manage characters, run missions, track combat.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-2.5 items-center w-full max-w-xs mx-auto">
            {currentCharacter ? (
              <Link to={createPageUrl(`CharacterSheet?id=${currentCharacter.id}`)} className="w-full">
                <button
                  className="w-full h-11 flex items-center justify-center gap-2 rounded-lg text-sm font-mono font-semibold tracking-wide border transition-all"
                  style={{ color: accentA, borderColor: accentA + '60', background: accentA + '12' }}
                >
                  <User className="h-4 w-4" />
                  {currentCharacter.name}
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </Link>
            ) : (
              <button
                onClick={() => setShowCharacterSelector(true)}
                className="w-full h-11 flex items-center justify-center gap-2 rounded-lg text-sm font-mono font-semibold tracking-wide border transition-all"
                style={{ color: accentA, borderColor: accentA + '60', background: accentA + '12' }}
              >
                <User className="h-4 w-4" />
                LOAD OPERATIVE
              </button>
            )}
            <Link to={createPageUrl('CreateCharacter')} className="w-full">
              <button
                className="w-full h-11 flex items-center justify-center gap-2 rounded-lg text-sm font-mono font-bold tracking-wide transition-all"
                style={{ background: accentA, color: '#000' }}
              >
                <Sparkles className="h-4 w-4" />
                NEW OPERATIVE
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </Link>
          </div>
        </motion.div>

        {/* ── FEATURE GRID ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 mb-10">
          {features.map((f, i) => {
            const Tile = (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i, duration: 0.35, ease: easing }}
                whileHover={{ y: -3, transition: { duration: 0.15 } }}
                className="group relative rounded-lg border p-3 sm:p-4 cursor-pointer transition-all"
                style={{
                  background: panel0,
                  borderColor: accentA + '20',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = accentA + '55';
                  e.currentTarget.style.boxShadow = `0 0 14px ${accentA}18`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = accentA + '20';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Corner bracket */}
                <div className="absolute top-1.5 left-1.5 w-2.5 h-2.5 border-t border-l opacity-40" style={{ borderColor: accentA }} />
                <div className="absolute bottom-1.5 right-1.5 w-2.5 h-2.5 border-b border-r opacity-40" style={{ borderColor: accentA }} />

                <f.icon className="h-5 w-5 mb-2.5" style={{ color: accentA }} />
                <div className="text-xs font-mono font-bold tracking-wide" style={{ color: text0 }}>{f.title}</div>
                <div className="text-[10px] mt-0.5 leading-tight" style={{ color: muted }}>{f.desc}</div>
              </motion.div>
            );

            if (f.action) return <div key={f.title} onClick={f.action}>{Tile}</div>;
            if (f.link) return <Link key={f.title} to={createPageUrl(f.link)}>{Tile}</Link>;
            return <div key={f.title} style={{ opacity: 0.45 }}>{Tile}</div>;
          })}
        </div>

        {/* ── QUICK STATS ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="grid grid-cols-3 gap-3 max-w-lg mx-auto mb-10"
        >
          {quickStats.map((s, i) => (
            <div
              key={s.label}
              className="text-center rounded-lg border py-3 px-2"
              style={{ background: panel0, borderColor: accentA + '20' }}
            >
              <div className="text-xl sm:text-2xl font-mono font-bold" style={{ color: accentA }}>{s.value}</div>
              <div className="text-[9px] sm:text-[10px] font-mono tracking-[0.12em] mt-0.5" style={{ color: muted }}>{s.label}</div>
            </div>
          ))}
        </motion.div>

        {/* ── DASHBOARD WIDGETS ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75, duration: 0.4 }}
        >
          <DashboardWidgets colors={{ accentA, accentB, panel0, panel1, text0, text1, muted, bg0 }} />
        </motion.div>
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