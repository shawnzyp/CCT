import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search, User, ChevronRight, Heart, Zap, Shield, X } from "lucide-react";
import { motion } from "framer-motion";
import { getModifier } from "@/components/character/StatBlock";
import { useTheme } from '@/components/theme/useTheme';

export default function CharacterSelector({ characters, onSelect, onClose }) {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const inputRef = React.useRef(null);
  const { theme } = useTheme();

  const c = theme?.colors || {};
  const accentA = c.accentA || '#00E5FF';
  const bg0 = c.bg0 || '#0F1216';
  const panel0 = c.panel0 || '#1A1F26';
  const panel1 = c.panel1 || '#202833';
  const text0 = c.text0 || '#E6F1FF';
  const text1 = c.text1 || '#8EA0B5';
  const muted = c.muted || '#5F6E80';
  const radius = theme?.hud?.panelRadius || '0.5rem';
  const glow = theme?.hud?.glowIntensity || 'none';

  React.useEffect(() => {
    if (inputRef.current) inputRef.current.blur();
  }, []);

  const filteredCharacters = characters.filter(char =>
    char.name?.toLowerCase().includes(search.toLowerCase()) ||
    char.real_name?.toLowerCase().includes(search.toLowerCase()) ||
    char.secret_identity?.toLowerCase().includes(search.toLowerCase())
  );

  const dialogStyle = {
    background: bg0,
    border: `1px solid ${accentA}30`,
    borderRadius: radius,
    boxShadow: glow !== 'none' ? glow : `0 8px 40px rgba(0,0,0,0.6)`,
    color: text0,
    fontFamily: 'inherit',
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent style={dialogStyle} className="max-w-2xl [&>button]:hidden">
        <DialogHeader className="pb-3 border-b" style={{ borderColor: accentA + '20' }}>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="font-mono tracking-[0.15em] text-lg" style={{ color: text0 }}>
                SELECT OPERATIVE
              </DialogTitle>
              <p className="text-[10px] font-mono mt-0.5" style={{ color: muted }}>
                Choose a character for this session
              </p>
            </div>
            <button
              onClick={onClose}
              className="cc-sm-target h-8 w-8 flex items-center justify-center rounded border transition-colors"
              style={{ borderColor: accentA + '30', color: muted }}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </DialogHeader>

        <div className="space-y-3 pt-1">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5" style={{ color: muted }} />
            <input
              ref={inputRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search operatives..."
              className="w-full h-9 pl-9 pr-3 text-sm font-mono rounded border outline-none transition-colors"
              style={{
                background: panel1,
                borderColor: accentA + '25',
                color: text0,
                caretColor: accentA,
              }}
              onFocus={e => { e.target.style.borderColor = accentA + '60'; }}
              onBlur={e => { e.target.style.borderColor = accentA + '25'; }}
            />
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto space-y-1.5 pr-1">
            {filteredCharacters.length === 0 ? (
              <div className="text-center py-10 font-mono text-xs" style={{ color: muted }}>
                NO OPERATIVES FOUND
              </div>
            ) : (
              filteredCharacters.map((char, index) => (
                <motion.div
                  key={char.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.04 }}
                  onClick={() => setSelectedCharacter(char)}
                  className="flex items-center gap-3 p-3 rounded-lg cursor-pointer group transition-all"
                  style={{
                    background: panel1,
                    border: `1px solid ${accentA}18`,
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = accentA + '50';
                    e.currentTarget.style.background = panel0;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = accentA + '18';
                    e.currentTarget.style.background = panel1;
                  }}
                >
                  {/* Portrait */}
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden"
                    style={{
                      background: char.visual_customization?.costume_primary_color
                        ? `linear-gradient(135deg, ${char.visual_customization.costume_primary_color}, ${char.visual_customization.costume_secondary_color || char.visual_customization.costume_primary_color})`
                        : `linear-gradient(135deg, ${accentA}30, ${accentA}10)`,
                      border: `1px solid ${accentA}30`,
                    }}
                  >
                    {char.portrait_url ? (
                      <img src={char.portrait_url} alt={char.name} className="w-full h-full object-cover" />
                    ) : (
                      <User className="h-5 w-5" style={{ color: accentA + '80' }} />
                    )}
                  </div>

                  {/* Name */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-mono font-bold text-sm truncate" style={{ color: text0 }}>
                      {char.name}
                    </h4>
                    <p className="text-[10px] font-mono truncate" style={{ color: muted }}>
                      {char.secret_identity || char.real_name || 'Unknown Identity'}
                    </p>
                  </div>

                  {/* Level badge */}
                  <span
                    className="text-[9px] font-mono px-1.5 py-0.5 rounded border flex-shrink-0"
                    style={{ borderColor: accentA + '40', color: accentA, background: accentA + '10' }}
                  >
                    LVL {char.level || 1}
                  </span>

                  <ChevronRight className="h-4 w-4 flex-shrink-0 transition-colors" style={{ color: muted }} />
                </motion.div>
              ))
            )}
          </div>
        </div>
      </DialogContent>

      {/* Character Detail Dialog */}
      {selectedCharacter && (
        <Dialog open={!!selectedCharacter} onOpenChange={() => setSelectedCharacter(null)}>
          <DialogContent style={dialogStyle} className="max-w-md [&>button]:hidden">
            <DialogHeader className="pb-3 border-b" style={{ borderColor: accentA + '20' }}>
              <div className="flex items-center justify-between">
                <DialogTitle className="font-mono tracking-[0.15em] text-base" style={{ color: text0 }}>
                  OPERATIVE PREVIEW
                </DialogTitle>
                <button
                  onClick={() => setSelectedCharacter(null)}
                  className="cc-sm-target h-8 w-8 flex items-center justify-center rounded border"
                  style={{ borderColor: accentA + '30', color: muted }}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </DialogHeader>

            <div className="space-y-4 pt-1">
              {/* Portrait & Name */}
              <div className="flex items-center gap-4">
                <div
                  className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden"
                  style={{
                    background: selectedCharacter.visual_customization?.costume_primary_color
                      ? `linear-gradient(135deg, ${selectedCharacter.visual_customization.costume_primary_color}, ${selectedCharacter.visual_customization.costume_secondary_color || selectedCharacter.visual_customization.costume_primary_color})`
                      : `linear-gradient(135deg, ${accentA}30, ${accentA}10)`,
                    border: `1px solid ${accentA}40`,
                  }}
                >
                  {selectedCharacter.portrait_url ? (
                    <img src={selectedCharacter.portrait_url} alt={selectedCharacter.name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="h-8 w-8" style={{ color: accentA + '80' }} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-mono font-bold text-lg truncate" style={{ color: text0 }}>
                    {selectedCharacter.name}
                  </h3>
                  <p className="text-xs font-mono truncate" style={{ color: muted }}>
                    {selectedCharacter.secret_identity || 'Unknown Identity'}
                  </p>
                  <div className="flex gap-2 mt-1.5 flex-wrap">
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded border"
                      style={{ borderColor: accentA + '40', color: accentA, background: accentA + '10' }}>
                      LVL {selectedCharacter.level || 1}
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded border"
                      style={{ borderColor: muted + '40', color: text1, background: panel1 }}>
                      Tier {selectedCharacter.tier}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { icon: Heart, label: 'HP', value: `${selectedCharacter.current_hp || selectedCharacter.max_hp || '—'}/${selectedCharacter.max_hp || '—'}`, color: c.danger || '#FF3B3B' },
                  { icon: Zap, label: 'SP', value: selectedCharacter.current_sp || (5 + getModifier(selectedCharacter.ability_scores?.CON || 10)), color: accentA },
                  { icon: Shield, label: 'TC', value: selectedCharacter.toughness_class || 10, color: c.accentB || accentA },
                ].map(({ icon: Icon, label, value, color }) => (
                  <div key={label} className="rounded-lg p-3 border" style={{ background: panel1, borderColor: color + '30' }}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <Icon className="h-3 w-3" style={{ color }} />
                      <span className="text-[9px] font-mono uppercase" style={{ color }}>{label}</span>
                    </div>
                    <div className="text-base font-mono font-bold" style={{ color: text0 }}>{value}</div>
                  </div>
                ))}
              </div>

              {/* Details */}
              <div className="rounded-lg p-3 border space-y-2.5" style={{ background: panel1, borderColor: accentA + '18' }}>
                <DetailRow label="Classification" value={selectedCharacter.classification} muted={muted} text1={text1} />
                <div>
                  <span className="text-[9px] font-mono uppercase tracking-[0.1em]" style={{ color: muted }}>Power Styles</span>
                  <div className="flex gap-1 flex-wrap mt-1">
                    {selectedCharacter.power_styles?.map((style, i) => (
                      <span key={i} className="text-[9px] font-mono px-1.5 py-0.5 rounded border"
                        style={{ borderColor: accentA + '35', color: accentA }}>
                        {style}
                      </span>
                    ))}
                  </div>
                </div>
                <DetailRow label="Origin" value={selectedCharacter.origin_story?.replace(/_/g, ' ')} muted={muted} text1={text1} />
              </div>

              <p className="text-center text-[10px] font-mono" style={{ color: muted }}>
                {selectedCharacter.powers?.length || 0} POWERS · {selectedCharacter.alignment?.toUpperCase()}
              </p>
            </div>

            <DialogFooter className="flex gap-2 pt-3 border-t" style={{ borderColor: accentA + '20' }}>
              <button
                onClick={() => setSelectedCharacter(null)}
                className="flex-1 h-9 rounded border text-xs font-mono font-semibold transition-colors"
                style={{ borderColor: accentA + '30', color: text1, background: 'transparent' }}
                onMouseEnter={e => { e.currentTarget.style.background = panel1; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
              >
                CANCEL
              </button>
              <button
                onClick={() => {
                  onSelect(selectedCharacter);
                  setSelectedCharacter(null);
                  navigate(createPageUrl(`CharacterSheet?id=${selectedCharacter.id}`));
                }}
                className="flex-1 h-9 rounded text-xs font-mono font-bold transition-all"
                style={{ background: accentA, color: '#000' }}
              >
                LOAD OPERATIVE
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  );
}

function DetailRow({ label, value, muted, text1 }) {
  return (
    <div>
      <span className="text-[9px] font-mono uppercase tracking-[0.1em]" style={{ color: muted }}>{label}</span>
      <p className="text-xs font-mono font-medium mt-0.5 capitalize" style={{ color: text1 }}>{value}</p>
    </div>
  );
}