import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Play, SkipForward, RotateCcw, Heart, Zap, Shield, ChevronRight, Sparkles, Users, Gift } from "lucide-react";
import { getModifier } from "@/components/character/StatBlock";
import ResourceBar from "@/components/character/ResourceBar";
import ConditionManager from "@/components/combat/ConditionManager";
import EnemyGenerator from "@/components/combat/EnemyGenerator";
import TacticalGrid from "@/components/combat/TacticalGrid";
import CombatLog from "@/components/combat/CombatLog";
import LootDialog from "@/components/character/LootDialog";

export default function CombatTracker({ characters, campaignId }) {
  const [combatActive, setCombatActive] = useState(false);
  const [initiativeOrder, setInitiativeOrder] = useState([]);
  const [currentTurn, setCurrentTurn] = useState(0);
  const [enemies, setEnemies] = useState([]);
  const [combatLog, setCombatLog] = useState([]);
  const [currentRound, setCurrentRound] = useState(1);
  const [showEnemyGen, setShowEnemyGen] = useState(false);
  const [pendingLoot, setPendingLoot] = useState(null);
  const [defeatedEnemies, setDefeatedEnemies] = useState([]);
  const queryClient = useQueryClient();
  
  const updateCharacter = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Character.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['campaign-characters', campaignId]);
    }
  });
  
  const addLogEntry = (actor, action, result = '') => {
    setCombatLog(prev => [...prev, {
      round: currentRound,
      actor,
      action,
      result,
      timestamp: new Date().toISOString()
    }]);
  };
  
  const rollInitiative = () => {
    const heroes = characters.map(char => {
      const dexMod = getModifier(char.ability_scores?.DEX || 10);
      const roll = Math.floor(Math.random() * 20) + 1;
      const conMod = getModifier(char.ability_scores?.CON || 10);
      return {
        ...char,
        initiative_roll: roll + dexMod,
        initiative_modifier: dexMod,
        current_sp: 5 + conMod,
        current_hp: char.current_hp || char.max_hp,
        isEnemy: false
      };
    });
    
    const enemiesWithInit = enemies.map(enemy => ({
      ...enemy,
      initiative_roll: Math.floor(Math.random() * 20) + 1 + enemy.initiative_modifier,
      isEnemy: true,
      id: `enemy_${Math.random()}`
    }));
    
    const all = [...heroes, ...enemiesWithInit].sort((a, b) => b.initiative_roll - a.initiative_roll);
    setInitiativeOrder(all);
    setCombatActive(true);
    setCurrentTurn(0);
    setCurrentRound(1);
    setCombatLog([]);
    
    addLogEntry('Combat', `Combat started with ${heroes.length} heroes vs ${enemiesWithInit.length} enemies`);
  };
  
  const nextTurn = () => {
    const current = initiativeOrder[currentTurn];
    addLogEntry(current.name, 'Turn ended');
    
    setCurrentTurn((prev) => {
      const next = (prev + 1) % initiativeOrder.length;
      
      // New round starts
      if (next === 0) {
        setCurrentRound(r => r + 1);
        addLogEntry('System', `Round ${currentRound + 1} begins`);
        
        // Refresh SP and tick down conditions
        setInitiativeOrder(prev => prev.map(combatant => {
          const updates = { ...combatant };
          
          // Refresh SP for heroes
          if (!combatant.isEnemy && combatant.ability_scores) {
            const conMod = getModifier(combatant.ability_scores.CON || 10);
            updates.current_sp = 5 + conMod;
            updateCharacter.mutate({
              id: combatant.id,
              data: { current_sp: 5 + conMod }
            });
          }
          
          // Tick down conditions
          if (combatant.active_conditions?.length > 0) {
            updates.active_conditions = combatant.active_conditions
              .map(c => ({ ...c, duration: c.duration - 1 }))
              .filter(c => c.duration > 0);
          }
          
          return updates;
        }));
      }
      
      return next;
    });
  };
  
  const endCombat = () => {
    addLogEntry('Combat', 'Combat ended');
    setCombatActive(false);
    setInitiativeOrder([]);
    setCurrentTurn(0);
    setEnemies([]);
  };
  
  const handleEnemiesGenerated = (newEnemies) => {
    setEnemies(newEnemies);
  };
  
  const handlePositionChange = (combatantId, position) => {
    setInitiativeOrder(prev => 
      prev.map(c => c.id === combatantId ? { ...c, position } : c)
    );
  };
  
  const handleHPChange = (charId, newHP) => {
    setInitiativeOrder(prev => 
      prev.map(char => {
        if (char.id === charId) {
          // Check if enemy was defeated
          if (char.isEnemy && newHP <= 0 && char.hp > 0) {
            generateLoot(char);
          }
          return { ...char, current_hp: newHP, hp: newHP };
        }
        return char;
      })
    );
    
    if (!charId.toString().startsWith('enemy_')) {
      updateCharacter.mutate({ id: charId, data: { current_hp: newHP } });
    }
  };
  
  const generateLoot = (enemy) => {
    const baseGold = Math.floor(Math.random() * 50) + 10;
    const baseXP = Math.floor(Math.random() * 100) + 50;
    
    const loot = {
      gold: baseGold,
      xp: baseXP,
      items: []
    };
    
    // 50% chance for item drop
    if (Math.random() > 0.5) {
      const rarities = ['common', 'common', 'uncommon', 'uncommon', 'rare'];
      const types = ['weapon', 'armor', 'gadget', 'utility', 'consumable'];
      const rarity = rarities[Math.floor(Math.random() * rarities.length)];
      const type = types[Math.floor(Math.random() * types.length)];
      
      const item = {
        name: `${enemy.name}'s ${type}`,
        type,
        rarity,
        description: `Looted from ${enemy.name}`,
        value: rarity === 'common' ? 25 : rarity === 'uncommon' ? 50 : rarity === 'rare' ? 100 : 200,
        quantity: 1
      };
      
      if (rarity === 'rare' || rarity === 'epic') {
        item.magical_properties = ['Enhanced'];
      }
      
      loot.items.push(item);
    }
    
    setPendingLoot(loot);
    addLogEntry(enemy.name, 'Defeated', `Dropped loot!`);
  };
  
  const handleClaimLoot = (loot) => {
    // Distribute loot to all characters
    characters.forEach(char => {
      const updates = {
        gold: (char.gold || 0) + Math.floor(loot.gold / characters.length),
        current_xp: (char.current_xp || 0) + Math.floor(loot.xp / characters.length)
      };
      
      if (loot.items.length > 0) {
        updates.inventory = [...(char.inventory || []), ...loot.items];
      }
      
      updateCharacter.mutate({ id: char.id, data: updates });
    });
  };
  
  const handleSPChange = (charId, newSP) => {
    setInitiativeOrder(prev => 
      prev.map(char => char.id === charId ? { ...char, current_sp: newSP } : char)
    );
    updateCharacter.mutate({ id: charId, data: { current_sp: newSP } });
  };
  
  if (!combatActive) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Combat Setup</h2>
          <Button 
            onClick={() => setShowEnemyGen(true)}
            className="gap-2"
            variant="outline"
          >
            <Sparkles className="h-4 w-4" />
            Generate Enemies
          </Button>
        </div>
        
        {enemies.length > 0 && (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-red-400" />
                Enemies Ready ({enemies.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {enemies.map((enemy, i) => (
                  <div key={i} className="flex items-center justify-between bg-slate-700/50 rounded p-2">
                    <span className="text-white font-medium">{enemy.name}</span>
                    <div className="flex gap-3 text-xs text-slate-400">
                      <span>HP: {enemy.max_hp}</span>
                      <span>TC: {enemy.tc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
        
        <div className="text-center py-12">
          <div className="w-20 h-20 rounded-2xl bg-slate-800/50 flex items-center justify-center mx-auto mb-4">
            <Play className="h-10 w-10 text-slate-600" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Ready to Start?</h2>
          <p className="text-slate-400 mb-6">
            {characters.length} heroes vs {enemies.length} enemies
          </p>
          <Button 
            onClick={rollInitiative} 
            disabled={characters.length === 0}
            className="bg-violet-600 hover:bg-violet-700 gap-2"
          >
            <Play className="h-4 w-4" />
            Roll Initiative & Start
          </Button>
        </div>
        
        {showEnemyGen && (
          <EnemyGenerator
            onGenerate={handleEnemiesGenerated}
            onClose={() => setShowEnemyGen(false)}
          />
        )}
      </div>
    );
  }
  
  return (
    <Tabs defaultValue="tracker" className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white">Combat - Round {currentRound}</h2>
          <p className="text-sm text-slate-400">
            {initiativeOrder[currentTurn]?.name}'s turn
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={nextTurn} className="gap-2">
            <SkipForward className="h-4 w-4" />
            Next Turn
          </Button>
          <Button variant="outline" onClick={endCombat} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            End Combat
          </Button>
        </div>
      </div>
      
      <TabsList className="bg-slate-800/50 border border-slate-700">
        <TabsTrigger value="tracker">Initiative</TabsTrigger>
        <TabsTrigger value="grid">Grid</TabsTrigger>
        <TabsTrigger value="log">Combat Log</TabsTrigger>
      </TabsList>
      
      <TabsContent value="tracker" className="space-y-2">
        {initiativeOrder.map((char, index) => {
          const isCurrentTurn = index === currentTurn;
          const conMod = char.ability_scores ? getModifier(char.ability_scores.CON || 10) : 0;
          const maxSP = char.isEnemy ? 0 : 5 + conMod;
          
          return (
            <Card 
              key={char.id} 
              className={cn(
                "bg-slate-800/50 border-2 transition-all",
                isCurrentTurn 
                  ? "border-violet-500 shadow-lg shadow-violet-500/20" 
                  : "border-slate-700"
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {/* Initiative & Turn Marker */}
                  <div className="flex flex-col items-center">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg",
                      isCurrentTurn 
                        ? "bg-violet-500 text-white" 
                        : "bg-slate-700 text-slate-300"
                    )}>
                      {char.initiative_roll}
                    </div>
                    {isCurrentTurn && (
                      <Badge className="bg-violet-500 text-white text-xs mt-1">
                        <ChevronRight className="h-3 w-3" />
                        Active
                      </Badge>
                    )}
                  </div>
                  
                  <Separator orientation="vertical" className="h-16 bg-slate-700" />
                  
                  {/* Character Info */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-white text-lg">{char.name}</h3>
                        {char.isEnemy && (
                          <Badge variant="destructive" className="text-xs">Enemy</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <div className="flex items-center gap-1">
                          <Shield className="h-3 w-3" />
                          TC {char.toughness_class || char.tc}
                        </div>
                      </div>
                    </div>
                    
                    {/* HP & SP */}
                    <div className={cn("grid gap-3", char.isEnemy ? "grid-cols-1" : "grid-cols-2")}>
                      <ResourceBar
                        label="HP"
                        current={char.hp || char.current_hp || char.max_hp}
                        max={char.max_hp}
                        color="red"
                        onChange={(newHP) => {
                          if (char.isEnemy) {
                            setInitiativeOrder(prev => 
                              prev.map(c => c.id === char.id ? { ...c, hp: newHP } : c)
                            );
                          } else {
                            handleHPChange(char.id, newHP);
                          }
                        }}
                        size="sm"
                      />
                      {!char.isEnemy && (
                        <ResourceBar
                          label="SP"
                          current={char.current_sp || maxSP}
                          max={maxSP}
                          color="violet"
                          onChange={(newSP) => handleSPChange(char.id, newSP)}
                          size="sm"
                        />
                      )}
                    </div>
                    
                    {/* Enemy Abilities */}
                    {char.isEnemy && char.abilities?.length > 0 && (
                      <div className="text-xs text-slate-400">
                        <div className="font-medium mb-1">Abilities:</div>
                        {char.abilities.map((ability, i) => (
                          <div key={i}>• {ability}</div>
                        ))}
                      </div>
                    )}
                    
                    {/* Conditions */}
                    <ConditionManager character={char} onUpdate={(conditions) => {
                      updateCharacter.mutate({
                        id: char.id,
                        data: { active_conditions: conditions }
                      });
                    }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </TabsContent>
      
      <TabsContent value="grid">
        <TacticalGrid 
          combatants={initiativeOrder}
          onPositionChange={handlePositionChange}
        />
      </TabsContent>
      
      <TabsContent value="log">
        <CombatLog logs={combatLog} />
      </TabsContent>
    </Tabs>
    
    {pendingLoot && (
      <LootDialog
        loot={pendingLoot}
        onClaim={handleClaimLoot}
        onClose={() => setPendingLoot(null)}
      />
    )}
  );
}