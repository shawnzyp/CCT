import React from 'react';
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import ResourceBar from './ResourceBar';
import StatBlock from './StatBlock';
import { Shield, Zap, User } from "lucide-react";
import { motion } from 'framer-motion';

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

export default function CharacterCard({ character, onClick, selected = false }) {
  if (!character) return null;
  
  const conMod = character.ability_scores?.CON 
    ? Math.floor((character.ability_scores.CON - 10) / 2) 
    : 0;
  const maxSP = 5 + conMod;
  
  return (
    <motion.div 
      onClick={onClick}
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "relative rounded-2xl overflow-hidden cursor-pointer",
        "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900",
        "border-2 transition-all duration-300",
        selected 
          ? "border-violet-500 shadow-xl shadow-violet-500/20" 
          : "border-slate-700/50 hover:border-violet-500/50 hover:shadow-lg",
        "group"
      )}
    >
      {/* Tier indicator strip */}
      <div className={cn(
        "absolute top-0 left-0 right-0 h-1",
        character.tier === 0 && "bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500",
        character.tier === 1 && "bg-violet-500",
        character.tier === 2 && "bg-blue-500",
        character.tier === 3 && "bg-emerald-500",
        character.tier === 4 && "bg-cyan-500",
        character.tier === 5 && "bg-slate-500"
      )} />
      
      <div className="p-4">
        {/* Header */}
        <div className="flex gap-3 mb-3">
          {/* Portrait */}
          <div 
            className={cn(
              "w-16 h-16 rounded-xl overflow-hidden flex-shrink-0",
              "flex items-center justify-center relative"
            )}
            style={{
              background: character.visual_customization?.costume_primary_color 
                ? `linear-gradient(135deg, ${character.visual_customization.costume_primary_color}, ${character.visual_customization.costume_secondary_color || character.visual_customization.costume_primary_color})`
                : 'linear-gradient(135deg, rgb(124, 58, 237), rgb(168, 85, 247))'
            }}
          >
            {character.portrait_url ? (
              <img 
                src={character.portrait_url} 
                alt={character.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="h-8 w-8 text-white/60" />
            )}
          </div>
          
          {/* Name & Classification */}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg text-white truncate group-hover:text-violet-300 transition-colors">
              {character.name}
            </h3>
            <p className="text-xs text-slate-400 truncate">{character.secret_identity || 'Unknown Identity'}</p>
            <div className="flex flex-wrap gap-1 mt-1">
              <Badge variant="outline" className="text-[10px] border-violet-500/50 text-violet-400">
                {CLASSIFICATION_LABELS[character.classification] || character.classification}
              </Badge>
              <Badge variant="outline" className="text-[10px] border-amber-500/50 text-amber-400">
                {TIER_LABELS[character.tier] || `Tier ${character.tier}`}
              </Badge>
            </div>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="flex items-center gap-2 bg-slate-800/50 rounded-lg px-2 py-1.5">
            <Shield className="h-4 w-4 text-blue-400" />
            <div>
              <div className="text-[10px] text-slate-400">TC</div>
              <div className="text-sm font-bold text-white">{character.toughness_class || 10}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-slate-800/50 rounded-lg px-2 py-1.5">
            <Zap className="h-4 w-4 text-violet-400" />
            <div>
              <div className="text-[10px] text-slate-400">SP</div>
              <div className="text-sm font-bold text-white">{maxSP}</div>
            </div>
          </div>
        </div>
        
        {/* HP Bar */}
        <ResourceBar
          label="HP"
          current={character.current_hp || character.max_hp || 30}
          max={character.max_hp || 30}
          color="red"
          showControls={false}
          size="sm"
        />
        
        {/* Alignment */}
        <div className="mt-2 flex items-center justify-between">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider">Alignment</span>
          <span className="text-xs text-slate-300">{ALIGNMENT_LABELS[character.alignment] || character.alignment}</span>
        </div>
      </div>
    </motion.div>
  );
}

export { CLASSIFICATION_LABELS, TIER_LABELS, ALIGNMENT_LABELS };