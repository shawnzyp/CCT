import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Swords, Shield, Zap, Move, Eye, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import PowerCard from "@/components/character/PowerCard";
import ActionEconomy from "./ActionEconomy";
import { getModifier } from "@/components/character/StatBlock";
import { getActiveToHitBonus, getActiveDamageBonus } from "@/components/character/BonusCalculator";
import { validatePowerUse, validateAction, getActionAvailability } from "@/components/combat/CombatValidation";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function CombatActionPanel({ 
  character, 
  targets = [],
  usedActions = [],
  onToggleAction,
  onAttack,
  onSave,
  onUsePower,
  onMove
}) {
  const [selectedTarget, setSelectedTarget] = useState(null);

  const hasAction = !usedActions.includes('action');
  const hasMovement = !usedActions.includes('movement');
  const hasBonusAction = !usedActions.includes('bonus_action');
  const hasReaction = !usedActions.includes('reaction');

  const strMod = getModifier(character.ability_scores?.STR || 10);
  const dexMod = getModifier(character.ability_scores?.DEX || 10);
  const toHitBonus = getActiveToHitBonus(character);
  const damageBonus = getActiveDamageBonus(character);
  const availability = getActionAvailability(character, usedActions);

  const handlePowerUse = (power) => {
    if (!validatePowerUse(character, power)) return;
    onUsePower?.(power);
  };

  const handleAttackAction = (target, type) => {
    if (!validateAction(character)) return;
    if (!hasAction) {
      toast.warning("No Action Available", {
        description: "You've already used your action this turn."
      });
      return;
    }
    onAttack?.(target, type);
    onToggleAction?.('action');
  };

  return (
    <motion.div 
      className="space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Action Economy Status */}
      <ActionEconomy 
        usedActions={usedActions}
        onToggle={onToggleAction}
      />

      {/* Combat Actions */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-sm">Available Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="attacks" className="w-full">
            <TabsList className="bg-slate-900/50 grid grid-cols-4 w-full">
              <TabsTrigger value="attacks" className="text-xs">Attacks</TabsTrigger>
              <TabsTrigger value="powers" className="text-xs">Powers</TabsTrigger>
              <TabsTrigger value="defend" className="text-xs">Defend</TabsTrigger>
              <TabsTrigger value="move" className="text-xs">Move</TabsTrigger>
            </TabsList>

            <TabsContent value="attacks" className="space-y-2 mt-3">
              {/* Target Selection */}
              {targets.length > 0 && (
                <div className="mb-3">
                  <label className="text-xs text-slate-400 mb-2 block">Select Target</label>
                  <div className="grid grid-cols-2 gap-2">
                    {targets.map(target => (
                      <Button
                        key={target.id}
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedTarget(target)}
                        className={cn(
                          "text-xs justify-start",
                          selectedTarget?.id === target.id 
                            ? "border-violet-500 bg-violet-500/20 text-violet-400"
                            : "border-slate-600 text-slate-300"
                        )}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        {target.name}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <motion.div whileTap={{ scale: availability.canAct && hasAction ? 0.95 : 1 }}>
                  <Button
                    onClick={() => handleAttackAction(selectedTarget, 'melee')}
                    disabled={!availability.canAct || !hasAction}
                    className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50"
                  >
                    <Swords className="h-4 w-4 mr-2" />
                    Melee Attack {strMod + toHitBonus >= 0 ? `+${strMod + toHitBonus}` : strMod + toHitBonus}
                    {damageBonus > 0 && <span className="text-xs ml-1">(+{damageBonus} dmg)</span>}
                  </Button>
                </motion.div>

                <motion.div whileTap={{ scale: availability.canAct && hasAction ? 0.95 : 1 }}>
                  <Button
                    onClick={() => handleAttackAction(selectedTarget, 'ranged')}
                    disabled={!availability.canAct || !hasAction}
                    className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-50"
                  >
                    <Swords className="h-4 w-4 mr-2" />
                    Ranged Attack {dexMod + toHitBonus >= 0 ? `+${dexMod + toHitBonus}` : dexMod + toHitBonus}
                    {damageBonus > 0 && <span className="text-xs ml-1">(+{damageBonus} dmg)</span>}
                  </Button>
                </motion.div>
              </div>
            </TabsContent>

            <TabsContent value="powers" className="space-y-2 mt-3">
              {character.powers?.length > 0 ? (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {character.powers.map((power, idx) => {
                    const currentSP = character.current_sp || 0;
                    const canAfford = currentSP >= power.sp_cost;
                    const onCooldown = (power.current_cooldown || 0) > 0;
                    
                    return (
                      <motion.div 
                        key={idx} 
                        className="relative"
                        whileTap={{ scale: availability.canAct && hasAction && canAfford && !onCooldown ? 0.98 : 1 }}
                      >
                        <PowerCard 
                          power={power} 
                          onUse={() => {
                            handlePowerUse(power);
                            onToggleAction?.('action');
                          }}
                          canUse={availability.canAct && hasAction && canAfford && !onCooldown}
                          compact
                        />
                        {!canAfford && (
                          <div className="absolute inset-0 bg-red-900/20 rounded-lg border border-red-500/50 flex items-center justify-center">
                            <span className="text-red-400 text-xs font-bold">Need {power.sp_cost} SP</span>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6 text-slate-500 text-sm">
                  No powers available
                </div>
              )}
            </TabsContent>

            <TabsContent value="defend" className="space-y-2 mt-3">
              <Button
                onClick={() => {
                  onToggleAction?.('action');
                }}
                disabled={!hasAction}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                <Shield className="h-4 w-4 mr-2" />
                Dodge (+2 TC until next turn)
              </Button>

              <div className="grid grid-cols-2 gap-2">
                {['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'].map(save => {
                  const mod = getModifier(character.ability_scores?.[save] || 10);
                  return (
                    <Button
                      key={save}
                      size="sm"
                      variant="outline"
                      onClick={() => onSave?.(save)}
                      className="border-slate-600 text-slate-300 hover:border-violet-500"
                    >
                      {save} {mod >= 0 ? `+${mod}` : mod}
                    </Button>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="move" className="space-y-2 mt-3">
              <div className="bg-slate-900/50 rounded-lg p-3 mb-2">
                <div className="text-xs text-slate-400 mb-1">Movement Speed</div>
                <div className="text-xl font-bold text-white">{character.speed || 30} ft</div>
              </div>

              <motion.div whileTap={{ scale: availability.canMove && hasMovement ? 0.95 : 1 }}>
                <Button
                  onClick={() => {
                    if (!availability.canMove) {
                      toast.error("Cannot Move", { description: "You are restrained or incapacitated." });
                      return;
                    }
                    if (!hasMovement) {
                      toast.warning("No Movement", { description: "You've already used your movement." });
                      return;
                    }
                    onMove?.();
                    onToggleAction?.('movement');
                  }}
                  disabled={!availability.canMove || !hasMovement}
                  className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-50"
                >
                  <Move className="h-4 w-4 mr-2" />
                  Move on Grid
                </Button>
              </motion.div>

              <div className="text-xs text-slate-500 mt-2">
                • Standard: Move up to {character.speed || 30} ft<br />
                • Difficult terrain: Half movement<br />
                • Dash: Use action to double movement
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Death State Warning */}
      {availability.isDead && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-red-900/50 border-2 border-red-500 rounded-lg p-4 text-center"
        >
          <p className="text-red-200 font-bold">⚠️ You are at 0 HP!</p>
          <p className="text-red-300 text-sm mt-1">Roll death saves or receive healing to survive.</p>
        </motion.div>
      )}
    </motion.div>
  );
}