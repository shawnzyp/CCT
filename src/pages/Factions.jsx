import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Shield, Radio, TrendingUp, TrendingDown, Minus, Globe } from 'lucide-react';
import FactionCard from '@/components/factions/FactionCard';
import FactionDetailModal from '@/components/factions/FactionDetailModal';

export default function Factions() {
  const queryClient = useQueryClient();
  const [selectedFaction, setSelectedFaction] = useState(null);
  const [currentCharacter, setCurrentCharacter] = useState(() => {
    try { return JSON.parse(localStorage.getItem('currentCharacter')); } catch { return null; }
  });

  useEffect(() => {
    const handler = (e) => setCurrentCharacter(e.detail);
    window.addEventListener('characterChanged', handler);
    return () => window.removeEventListener('characterChanged', handler);
  }, []);

  const { data: factions = [] } = useQuery({
    queryKey: ['factions'],
    queryFn: () => base44.entities.Faction.list(),
    staleTime: 5 * 60 * 1000,
  });

  const { data: reputations = [], refetch: refetchRep } = useQuery({
    queryKey: ['faction-reputations', currentCharacter?.id],
    queryFn: () => currentCharacter?.id
      ? base44.entities.FactionReputation.filter({ character_id: currentCharacter.id })
      : Promise.resolve([]),
    staleTime: 30 * 1000,
    enabled: !!currentCharacter?.id,
  });

  const getRepForFaction = (key) => reputations.find(r => r.faction_key === key);

  const alignedCount = reputations.filter(r => r.is_aligned).length;
  const totalRep = reputations.reduce((sum, r) => sum + (r.reputation ?? 0), 0);

  // Sort: aligned first, then by rep desc
  const sortedFactions = [...factions].sort((a, b) => {
    const repA = getRepForFaction(a.key);
    const repB = getRepForFaction(b.key);
    const alignA = repA?.is_aligned ? 1 : 0;
    const alignB = repB?.is_aligned ? 1 : 0;
    if (alignA !== alignB) return alignB - alignA;
    return (repB?.reputation ?? 0) - (repA?.reputation ?? 0);
  });

  const selectedRep = selectedFaction ? getRepForFaction(selectedFaction.key) : null;

  // Global influence summary
  const avgInfluence = factions.length
    ? Math.round(factions.reduce((s, f) => s + (f.global_influence ?? 50), 0) / factions.length)
    : 0;

  const accentA = '#00E5FF';

  return (
    <div className="min-h-screen p-4 sm:p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <Shield className="h-6 w-6" style={{ color: accentA }} />
          <h1 className="text-2xl font-bold font-mono tracking-wider" style={{ color: accentA }}>
            FACTION NETWORK
          </h1>
          <Radio className="h-4 w-4 animate-pulse" style={{ color: accentA }} />
        </div>
        <p className="text-xs font-mono text-gray-500 ml-9">
          GLOBAL POWER ALIGNMENT MATRIX — CLEARANCE LEVEL: OPERATIVE
        </p>
      </div>

      {/* Character + Summary Bar */}
      <div className="mb-6 p-4 rounded-xl border flex flex-wrap items-center gap-4"
        style={{ borderColor: accentA + '25', background: '#1A1F2690' }}>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-mono text-gray-500 uppercase tracking-wider mb-1">OPERATIVE</div>
          {currentCharacter
            ? <div className="text-sm font-mono font-bold" style={{ color: accentA }}>{currentCharacter.name}</div>
            : <div className="text-xs font-mono text-gray-500">No character selected — use header selector</div>}
        </div>
        <div className="flex items-center gap-6 text-center">
          <div>
            <div className="text-xs font-mono font-bold" style={{ color: accentA }}>{alignedCount}</div>
            <div className="text-[9px] font-mono text-gray-500">ALIGNED</div>
          </div>
          <div>
            <div className="text-xs font-mono font-bold text-white">{totalRep >= 0 ? '+' : ''}{totalRep}</div>
            <div className="text-[9px] font-mono text-gray-500">TOTAL REP</div>
          </div>
          <div>
            <div className="flex items-center gap-1">
              <Globe className="h-3 w-3" style={{ color: accentA }} />
              <span className="text-xs font-mono font-bold" style={{ color: accentA }}>{avgInfluence}%</span>
            </div>
            <div className="text-[9px] font-mono text-gray-500">AVG INFLUENCE</div>
          </div>
        </div>
      </div>

      {/* Global Narrative Banner */}
      <div className="mb-6 p-3 rounded-lg border text-xs font-mono"
        style={{ borderColor: '#FFD70030', background: '#FFD70008' }}>
        <div className="text-[9px] uppercase tracking-wider text-yellow-400 mb-1">⚡ GLOBAL NARRATIVE STATE</div>
        <div className="flex flex-wrap gap-3">
          {factions.map(f => {
            const Icon = f.narrative_state === 'rising' ? TrendingUp : f.narrative_state === 'declining' || f.narrative_state === 'crisis' ? TrendingDown : Minus;
            return (
              <span key={f.key} className="flex items-center gap-1" style={{ color: f.color }}>
                <Icon className="h-3 w-3" />
                {f.short_name}
              </span>
            );
          })}
        </div>
      </div>

      {/* Faction Grid */}
      {factions.length === 0 ? (
        <div className="text-center py-20 text-gray-500 font-mono text-sm">Loading factions...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {sortedFactions.map(faction => (
            <FactionCard
              key={faction.key}
              faction={faction}
              reputation={getRepForFaction(faction.key)}
              onSelect={setSelectedFaction}
            />
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedFaction && (
        <FactionDetailModal
          faction={selectedFaction}
          reputation={getRepForFaction(selectedFaction.key)}
          character={currentCharacter}
          onClose={() => setSelectedFaction(null)}
          onUpdate={() => { refetchRep(); queryClient.invalidateQueries(['faction-reputations']); }}
        />
      )}
    </div>
  );
}