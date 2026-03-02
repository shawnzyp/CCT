import React from 'react';
import { Shield, TrendingUp, TrendingDown, Minus, Star, Lock, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const STANDING_LABELS = {
  hostile: { label: 'HOSTILE', color: '#FF3B3B' },
  unfriendly: { label: 'UNFRIENDLY', color: '#FF8C42' },
  neutral: { label: 'NEUTRAL', color: '#8EA0B5' },
  friendly: { label: 'FRIENDLY', color: '#00D1B2' },
  honored: { label: 'HONORED', color: '#FFD700' },
  exalted: { label: 'EXALTED', color: '#9B59B6' },
};

const NARRATIVE_ICONS = {
  rising: TrendingUp,
  stable: Minus,
  declining: TrendingDown,
  crisis: TrendingDown,
  dominant: TrendingUp,
};

export default function FactionCard({ faction, reputation, onSelect, compact = false }) {
  const rep = reputation?.reputation ?? 0;
  const standing = reputation?.standing ?? 'neutral';
  const isAligned = reputation?.is_aligned ?? false;
  const standingInfo = STANDING_LABELS[standing] || STANDING_LABELS.neutral;
  const NarrativeIcon = NARRATIVE_ICONS[faction.narrative_state] || Minus;

  // Rep bar: -1000 to 1000
  const repPct = ((rep + 1000) / 2000) * 100;
  const currentTier = reputation?.unlocked_tiers?.length ?? 0;

  return (
    <button
      onClick={() => onSelect(faction)}
      className={cn(
        "w-full text-left rounded-xl border transition-all duration-200 hover:scale-[1.01] hover:shadow-lg",
        compact ? "p-3" : "p-5"
      )}
      style={{
        background: `linear-gradient(135deg, #1A1F26 0%, ${faction.color}12 100%)`,
        borderColor: isAligned ? faction.color + '80' : faction.color + '30',
        boxShadow: isAligned ? `0 0 20px ${faction.color}20` : 'none',
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-sm font-mono" style={{ color: faction.color }}>
              {faction.short_name}
            </span>
            {isAligned && (
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded uppercase tracking-wider"
                style={{ background: faction.color + '25', color: faction.color }}>
                ALIGNED
              </span>
            )}
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded uppercase tracking-wider flex items-center gap-1"
              style={{ background: standingInfo.color + '20', color: standingInfo.color }}>
              <NarrativeIcon className="h-2.5 w-2.5" />
              {faction.narrative_state?.toUpperCase()}
            </span>
          </div>
          {!compact && (
            <p className="text-xs text-gray-400 mt-1 line-clamp-2 text-left">{faction.description}</p>
          )}
        </div>
        <div className="flex-shrink-0 text-right">
          <div className="text-xs font-mono font-bold" style={{ color: standingInfo.color }}>
            {standingInfo.label}
          </div>
          <div className="text-[10px] text-gray-500 font-mono">{rep >= 0 ? '+' : ''}{rep} REP</div>
        </div>
      </div>

      {/* Rep Bar */}
      <div className="mb-3">
        <div className="flex justify-between text-[9px] font-mono text-gray-500 mb-1">
          <span>HOSTILE</span>
          <span>REPUTATION</span>
          <span>EXALTED</span>
        </div>
        <div className="h-1.5 rounded-full bg-gray-800 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${repPct}%`, background: faction.color }}
          />
        </div>
      </div>

      {/* Tier + Influence */}
      <div className="flex items-center justify-between text-[10px] font-mono text-gray-500">
        <div className="flex items-center gap-1">
          <Star className="h-3 w-3" style={{ color: faction.color }} />
          <span>TIER {currentTier} / {faction.unlock_tiers?.length ?? 4}</span>
        </div>
        <div className="flex items-center gap-1">
          <Shield className="h-3 w-3" />
          <span>INFLUENCE: {faction.global_influence}%</span>
        </div>
      </div>
    </button>
  );
}