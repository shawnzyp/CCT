import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronRight, Skull, User, Swords, Shield, Heart } from "lucide-react";
import { motion } from "framer-motion";

export default function InitiativeTracker({ 
  initiativeOrder, 
  currentTurn, 
  currentRound,
  onSelectCombatant 
}) {
  return (
    <Card className="bg-slate-800/30 border-slate-700">
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-semibold text-white">
            Initiative Order - Round {currentRound}
          </div>
          <Badge className="bg-violet-500/20 text-violet-400 border-violet-500/50">
            {initiativeOrder.filter(c => !c.isEnemy && (c.current_hp || c.max_hp) > 0).length} Heroes vs {initiativeOrder.filter(c => c.isEnemy && c.hp > 0).length} Enemies
          </Badge>
        </div>

        <div className="space-y-1">
          {initiativeOrder.map((combatant, index) => {
            const isActive = index === currentTurn;
            const isDead = combatant.isEnemy ? combatant.hp <= 0 : (combatant.current_hp || combatant.max_hp) <= 0;
            const currentHP = combatant.isEnemy ? combatant.hp : (combatant.current_hp || combatant.max_hp);
            const maxHP = combatant.max_hp;
            const hpPercent = maxHP > 0 ? (currentHP / maxHP) * 100 : 0;

            return (
              <motion.div
                key={combatant.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: isDead ? 0.4 : 1, x: 0 }}
                onClick={() => onSelectCombatant?.(combatant)}
                className={cn(
                  "p-2 rounded-lg border cursor-pointer transition-all relative overflow-hidden",
                  isActive 
                    ? "border-violet-500 bg-violet-500/10" 
                    : "border-slate-700 bg-slate-900/50 hover:border-slate-600",
                  isDead && "opacity-50"
                )}
              >
                {/* HP Background */}
                <div 
                  className={cn(
                    "absolute inset-0 transition-all",
                    combatant.isEnemy ? "bg-red-500/10" : "bg-blue-500/10"
                  )}
                  style={{ width: `${hpPercent}%` }}
                />

                <div className="relative z-10 flex items-center gap-3">
                  {/* Initiative Number */}
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0",
                    isActive 
                      ? "bg-violet-500 text-white" 
                      : combatant.isEnemy 
                        ? "bg-red-900/50 text-red-400"
                        : "bg-blue-900/50 text-blue-400"
                  )}>
                    {char.initiative_roll}
                  </div>

                  {/* Name & Icon */}
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {combatant.isEnemy ? (
                      <Skull className="h-4 w-4 text-red-400 flex-shrink-0" />
                    ) : (
                      <User className="h-4 w-4 text-blue-400 flex-shrink-0" />
                    )}
                    <span className={cn(
                      "font-medium truncate",
                      isDead ? "text-slate-500 line-through" : "text-white"
                    )}>
                      {combatant.name}
                    </span>
                  </div>

                  {/* HP Display */}
                  <div className="flex items-center gap-2 text-xs">
                    <div className={cn(
                      "flex items-center gap-1 px-2 py-1 rounded border",
                      hpPercent > 50 ? "border-green-500/30 text-green-400" :
                      hpPercent > 25 ? "border-yellow-500/30 text-yellow-400" :
                      "border-red-500/30 text-red-400"
                    )}>
                      <Heart className="h-3 w-3" />
                      {currentHP}/{maxHP}
                    </div>
                    {!combatant.isEnemy && (
                      <div className="text-violet-400 font-mono">
                        {combatant.current_sp || 0} SP
                      </div>
                    )}
                  </div>

                  {/* Active Indicator */}
                  {isActive && (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      <ChevronRight className="h-4 w-4 text-violet-400" />
                    </motion.div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}