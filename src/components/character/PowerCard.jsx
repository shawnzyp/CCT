import React from 'react';
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Zap, Target, Clock, Shield } from "lucide-react";

export default function PowerCard({ 
  power, 
  onUse, 
  canUse = true,
  compact = false 
}) {
  if (!power) return null;
  
  const isOnCooldown = power.current_cooldown > 0;
  const isUltimate = power.sp_cost === 5;
  
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
    <div className={cn(
      "relative rounded-xl overflow-hidden",
      "bg-gradient-to-br from-slate-800 to-slate-900",
      "border transition-all duration-300",
      isUltimate ? "border-amber-500/50" : "border-slate-700/50",
      !isOnCooldown && canUse && "hover:border-violet-500/50 hover:shadow-lg hover:shadow-violet-500/10",
      isOnCooldown && "opacity-60"
    )}>
      {isUltimate && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500" />
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
              {isUltimate && (
                <span className="text-[10px] text-amber-400 uppercase tracking-wider">Ultimate</span>
              )}
            </div>
          </div>
          <Badge 
            className={cn(
              "font-bold",
              isUltimate ? "bg-amber-500/20 text-amber-300" : "bg-violet-500/20 text-violet-300"
            )}
          >
            {power.sp_cost} SP
          </Badge>
        </div>
        
        <p className="text-sm text-slate-300 mb-3">{power.description || power.effect}</p>
        
        <div className="flex flex-wrap gap-2 text-xs text-slate-400 mb-3">
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
        </div>
        
        {onUse && (
          <Button
            onClick={() => onUse(power)}
            disabled={isOnCooldown || !canUse}
            className={cn(
              "w-full",
              isUltimate 
                ? "bg-amber-600 hover:bg-amber-700" 
                : "bg-violet-600 hover:bg-violet-700"
            )}
            size="sm"
          >
            {isOnCooldown ? `Cooldown: ${power.current_cooldown} turns` : "Use Power"}
          </Button>
        )}
      </div>
    </div>
  );
}