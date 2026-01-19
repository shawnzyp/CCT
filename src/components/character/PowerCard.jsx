import React from 'react';
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Zap, Target, Clock, Shield, Focus, Flame, Link2 } from "lucide-react";
import { motion } from "framer-motion";
import useSoundEffects from '@/components/sounds/useSoundEffects';

export default function PowerCard({ 
  power, 
  onUse, 
  canUse = true,
  compact = false 
}) {
  const { play } = useSoundEffects();
  
  if (!power) return null;
  
  const isOnCooldown = power.current_cooldown > 0;
  const isUltimate = power.sp_cost === 5;
  const isSignature = power.is_signature_move;
  
  const handleUse = () => {
    play('powerUse', 0.4);
    if (onUse) onUse(power);
  };
  
  if (compact) {
    return (
      <div className={cn(
        "flex items-center justify-between p-2 rounded-lg",
        "bg-slate-800/50 border border-slate-700/50",
        isOnCooldown && "opacity-50"
      )}>
        <div className="flex items-center gap-2">
          <Zap className={cn("h-3 w-3", isUltimate ? "text-amber-400" : "text-violet-400")} />
          <span className="text-sm font-medium text-white">{power.name}</span>
        </div>
        <Badge variant="secondary" className="bg-violet-500/20 text-violet-300 text-xs">
          {power.sp_cost} SP
        </Badge>
      </div>
    );
  }
  
  return (
    <motion.div 
      className={cn(
        "relative rounded-xl overflow-hidden corner-frame",
        "bg-gradient-to-br from-slate-800 to-slate-900",
        "border transition-all duration-300",
        isUltimate ? "border-amber-500/50" : "border-slate-700/50",
        !isOnCooldown && canUse && "hover:border-violet-500/50 hover:shadow-lg hover:shadow-violet-500/10",
        isOnCooldown && "opacity-60"
      )}
      whileHover={{ scale: !isOnCooldown && canUse ? 1.02 : 1 }}
      onMouseEnter={() => !isOnCooldown && play('hover', 0.1)}
    >
      {isUltimate && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500" />
      )}
      {isSignature && !isUltimate && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-500 via-purple-500 to-violet-500" />
      )}
      
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className={cn(
              "p-1.5 rounded-lg",
              isUltimate ? "bg-amber-500/20" : "bg-violet-500/20"
            )}>
              <Zap className={cn("h-4 w-4", isUltimate ? "text-amber-400" : "text-violet-400")} />
            </div>
            <div>
              <h3 className="font-bold text-white">{power.name}</h3>
              <div className="flex items-center gap-2">
                {isUltimate && (
                  <span className="text-[10px] text-amber-400 uppercase tracking-wider font-mono">Ultimate</span>
                )}
                {isSignature && !isUltimate && (
                  <span className="text-[10px] text-violet-400 uppercase tracking-wider font-mono">Signature</span>
                )}
              </div>
            </div>
          </div>
          <Badge 
            className={cn(
              "font-bold font-mono",
              isUltimate ? "bg-amber-500/20 text-amber-300" : "bg-violet-500/20 text-violet-300"
            )}
          >
            {power.sp_cost} SP
          </Badge>
        </div>
        
        <p className="text-sm text-slate-300 mb-3">{power.description || power.effect}</p>
        
        {power.damage_type && (
          <div className="mb-2">
            <Badge variant="outline" className="border-orange-500/50 text-orange-300 text-xs">
              <Flame className="h-3 w-3 mr-1" />
              {power.damage_type}
            </Badge>
          </div>
        )}
        
        {(power.effect_tags?.length > 0 || power.custom_effect_tags?.length > 0) && (
          <div className="mb-3 flex flex-wrap gap-1">
            {power.effect_tags?.map(tag => (
              <Badge key={tag} variant="secondary" className="bg-slate-700/50 text-slate-300 text-xs">
                {tag}
              </Badge>
            ))}
            {power.custom_effect_tags?.map((tag, idx) => (
              <Badge 
                key={idx} 
                variant="secondary" 
                className="bg-violet-500/20 text-violet-300 text-xs"
                title={tag.description}
              >
                {tag.name}
              </Badge>
            ))}
          </div>
        )}
        
        <div className="flex flex-wrap gap-2 text-xs text-slate-400 mb-3 font-mono">
          {power.range && (
            <div className="flex items-center gap-1">
              <Target className="h-3 w-3" />
              <span>{power.range}</span>
            </div>
          )}
          {power.saving_throw && (
            <div className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              <span>{power.saving_throw}</span>
            </div>
          )}
          {power.cooldown > 0 && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{power.cooldown} turn cooldown</span>
            </div>
          )}
          {power.requires_concentration && (
            <div className="flex items-center gap-1">
              <Focus className="h-3 w-3 text-violet-400" />
              <span className="text-violet-400">Concentration ({power.concentration_duration})</span>
            </div>
          )}
          {(power.linked_to_origin || power.linked_to_power_style) && (
            <div className="flex items-center gap-1">
              <Link2 className="h-3 w-3 text-amber-400" />
              <span className="text-amber-400">Thematic</span>
            </div>
          )}
        </div>
        
        {power.requires_concentration && (
          <div className="bg-violet-500/10 border border-violet-500/30 rounded p-2 mb-3">
            <p className="text-xs text-violet-300 font-mono">
              +1 SP per round to maintain. Breaks on damage or distraction.
            </p>
          </div>
        )}
        
        {onUse && (
          <motion.div whileTap={{ scale: isOnCooldown || !canUse ? 1 : 0.95 }}>
            <Button
              onClick={handleUse}
              disabled={isOnCooldown || !canUse}
              className={cn(
                "w-full font-mono",
                isUltimate 
                  ? "bg-amber-600 hover:bg-amber-700" 
                  : "bg-violet-600 hover:bg-violet-700"
              )}
              size="sm"
            >
              {isOnCooldown ? `Cooldown: ${power.current_cooldown} turns` : "Use Power"}
            </Button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}