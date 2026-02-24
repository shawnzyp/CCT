import React from 'react';
import { Badge } from "@/components/ui/badge";
import ResourceBar from './ResourceBar';
import { Shield, Zap, User } from "lucide-react";
import { motion } from 'framer-motion';
import { useTheme } from '@/components/theme/useTheme';

const CLASSIFICATION_LABELS = {
  mutant: 'Mutant',
  enhanced_human: 'Enhanced Human',
  magic_user: 'Magic User',
  alien: 'Alien',
  mystical_being: 'Mystical Being'
};

const TIER_LABELS = {
  5: 'Rookie',
  4: 'Emerging Vigilante',
  3: 'Field-Tested Operative',
  2: 'Respected Force',
  1: 'Heroic Figure',
  0: 'Legendary'
};

const ALIGNMENT_LABELS = {
  paragon: 'Paragon',
  guardian: 'Guardian',
  vigilante: 'Vigilante',
  sentinel: 'Sentinel',
  outsider: 'Outsider',
  wildcard: 'Wildcard',
  inquisitor: 'Inquisitor',
  anti_hero: 'Anti-Hero',
  renegade: 'Renegade'
};

// Tier color mapped to theme roles
const TIER_ACCENT = {
  0: 'warning',
  1: 'accentA',
  2: 'accentB',
  3: 'success',
  4: 'accentB',
  5: 'muted',
};

export default function CharacterCard({ character, onClick, selected = false }) {
  const { theme } = useTheme();
  const c = theme?.colors || {};
  const accentA = c.accentA || '#00E5FF';
  const panel0 = c.panel0 || '#1A1F26';
  const panel1 = c.panel1 || '#202833';
  const text0 = c.text0 || '#E6F1FF';
  const text1 = c.text1 || '#8EA0B5';
  const muted = c.muted || '#5F6E80';
  const panelRadius = theme?.hud?.panelRadius || '0.5rem';

  if (!character) return null;

  const conMod = character.ability_scores?.CON
    ? Math.floor((character.ability_scores.CON - 10) / 2)
    : 0;
  const maxSP = 5 + conMod;
  const tierColor = c[TIER_ACCENT[character.tier]] || accentA;

  return (
    <motion.div
      onClick={onClick}
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.18 }}
      className="relative overflow-hidden cursor-pointer group"
      style={{
        background: panel0,
        border: `1px solid ${selected ? accentA + '70' : accentA + '22'}`,
        borderRadius: panelRadius,
        boxShadow: selected ? `0 0 14px ${accentA}28` : 'none',
        transition: `border-color var(--cc-med) var(--cc-easing), box-shadow var(--cc-med) var(--cc-easing)`,
      }}
    >
      {/* Tier strip */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5"
        style={{ background: tierColor }}
      />

      {/* Corner brackets */}
      <div className="absolute top-2 left-2 w-2.5 h-2.5 border-t border-l opacity-40" style={{ borderColor: accentA }} />
      <div className="absolute bottom-2 right-2 w-2.5 h-2.5 border-b border-r opacity-40" style={{ borderColor: accentA }} />

      <div className="p-4 pt-5">
        {/* Header */}
        <div className="flex gap-3 mb-3">
          {/* Portrait */}
          <div
            className="w-14 h-14 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0"
            style={{
              background: character.visual_customization?.costume_primary_color
                ? `linear-gradient(135deg, ${character.visual_customization.costume_primary_color}, ${character.visual_customization.costume_secondary_color || character.visual_customization.costume_primary_color})`
                : `linear-gradient(135deg, ${accentA}30, ${accentA}10)`,
              border: `1px solid ${accentA}30`,
            }}
          >
            {character.portrait_url ? (
              <img src={character.portrait_url} alt={character.name} className="w-full h-full object-cover" />
            ) : (
              <User className="h-7 w-7" style={{ color: accentA + '80' }} />
            )}
          </div>

          {/* Name & Classification */}
          <div className="flex-1 min-w-0">
            <h3
              className="font-mono font-bold text-sm truncate leading-tight"
              style={{ color: text0, transition: `color var(--cc-fast) var(--cc-easing)` }}
            >
              {character.name}
            </h3>
            <p className="text-[10px] font-mono truncate mt-0.5" style={{ color: muted }}>
              {character.secret_identity || 'Unknown Identity'}
            </p>
            <div className="flex flex-wrap gap-1 mt-1.5">
              <span
                className="text-[9px] font-mono px-1.5 py-0.5 rounded border"
                style={{ borderColor: accentA + '40', color: accentA, background: accentA + '10' }}
              >
                {CLASSIFICATION_LABELS[character.classification] || character.classification}
              </span>
              <span
                className="text-[9px] font-mono px-1.5 py-0.5 rounded border"
                style={{ borderColor: tierColor + '50', color: tierColor, background: tierColor + '10' }}
              >
                {TIER_LABELS[character.tier] || `Tier ${character.tier}`}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div
            className="flex items-center gap-2 rounded-md px-2 py-1.5"
            style={{ background: panel1, border: `1px solid ${accentA}18` }}
          >
            <Shield className="h-3.5 w-3.5 flex-shrink-0" style={{ color: accentA }} />
            <div>
              <div className="text-[9px] font-mono uppercase" style={{ color: muted }}>TC</div>
              <div className="text-sm font-mono font-bold leading-tight" style={{ color: text0 }}>{character.toughness_class || 10}</div>
            </div>
          </div>
          <div
            className="flex items-center gap-2 rounded-md px-2 py-1.5"
            style={{ background: panel1, border: `1px solid ${accentA}18` }}
          >
            <Zap className="h-3.5 w-3.5 flex-shrink-0" style={{ color: c.accentB || accentA }} />
            <div>
              <div className="text-[9px] font-mono uppercase" style={{ color: muted }}>SP</div>
              <div className="text-sm font-mono font-bold leading-tight" style={{ color: text0 }}>{maxSP}</div>
            </div>
          </div>
        </div>

        {/* HP Bar */}
        <ResourceBar
          label="HP"
          current={character.current_hp || character.max_hp || 30}
          max={character.max_hp || 30}
          showControls={false}
          size="sm"
        />

        {/* Alignment */}
        <div className="mt-2.5 flex items-center justify-between">
          <span className="text-[9px] font-mono uppercase tracking-[0.12em]" style={{ color: muted }}>Alignment</span>
          <span className="text-[10px] font-mono" style={{ color: text1 }}>
            {ALIGNMENT_LABELS[character.alignment] || character.alignment}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export { CLASSIFICATION_LABELS, TIER_LABELS, ALIGNMENT_LABELS };