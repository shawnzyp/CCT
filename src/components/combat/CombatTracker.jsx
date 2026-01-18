import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Play, SkipForward, RotateCcw, Heart, Zap, Shield, ChevronRight } from "lucide-react";
import { getModifier } from "@/components/character/StatBlock";
import ResourceBar from "@/components/character/ResourceBar";
import ConditionManager from "@/components/combat/ConditionManager";

export default function CombatTracker({ characters, campaignId }) {
  const [combatActive, setCombatActive] = useState(false);
  const [initiativeOrder, setInitiativeOrder] = useState([]);
  const [currentTurn, setCurrentTurn] = useState(0);
  const queryClient = useQueryClient();
  
  const updateCharacter = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Character.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['campaign-characters', campaignId]);
    }
  });
  
  const rollInitiative = () => {
    const withInitiative = characters.map(char => {
      const dexMod = getModifier(char.ability_scores?.DEX || 10);
      const roll = Math.floor(Math.random() * 20) + 1;
      const conMod = getModifier(char.ability_scores?.CON || 10);
      return {
        ...char,
        initiative_roll: roll + dexMod,
        initiative_modifier: dexMod,
        current_sp: 5 + conMod,
        current_hp: char.current_hp || char.max_hp
      };
    });
    
    withInitiative.sort((a, b) => b.initiative_roll - a.initiative_roll);
    setInitiativeOrder(withInitiative);
    setCombatActive(true);
    setCurrentTurn(0);
  };
  
  const nextTurn = () => {
    setCurrentTurn((prev) => {
      const next = (prev + 1) % initiativeOrder.length;
      // Refresh SP at start of each round (when we cycle back to first character)
      if (next === 0) {
        initiativeOrder.forEach(char => {
          const conMod = getModifier(char.ability_scores?.CON || 10);
          updateCharacter.mutate({
            id: char.id,
            data: { current_sp: 5 + conMod }
          });
        });
      }
      return next;
    });
  };
  
  const endCombat = () => {
    setCombatActive(false);
    setInitiativeOrder([]);
    setCurrentTurn(0);
  };
  
  const handleHPChange = (charId, newHP) => {
    setInitiativeOrder(prev => 
      prev.map(char => char.id === charId ? { ...char, current_hp: newHP } : char)
    );
    updateCharacter.mutate({ id: charId, data: { current_hp: newHP } });
  };
  
  const handleSPChange = (charId, newSP) => {
    setInitiativeOrder(prev => 
      prev.map(char => char.id === charId ? { ...char, current_sp: newSP } : char)
    );
    updateCharacter.mutate({ id: charId, data: { current_sp: newSP } });
  };
  
  if (!combatActive) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 rounded-2xl bg-slate-800/50 flex items-center justify-center mx-auto mb-4">
          <Play className="h-10 w-10 text-slate-600" />
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">No Active Combat</h2>
        <p className="text-slate-400 mb-6">Roll initiative to begin combat tracking</p>
        <Button 
          onClick={rollInitiative} 
          disabled={characters.length === 0}
          className="bg-violet-600 hover:bg-violet-700 gap-2"
        >
          <Play className="h-4 w-4" />
          Start Combat
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white">Combat Tracker</h2>
          <p className="text-sm text-slate-400">Round {Math.floor(currentTurn / initiativeOrder.length) + 1}</p>
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
      
      <div className="space-y-2">
        {initiativeOrder.map((char, index) => {
          const isCurrentTurn = index === currentTurn;
          const conMod = getModifier(char.ability_scores?.CON || 10);
          const maxSP = 5 + conMod;
          
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
                      <h3 className="font-bold text-white text-lg">{char.name}</h3>
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <div className="flex items-center gap-1">
                          <Shield className="h-3 w-3" />
                          TC {char.toughness_class}
                        </div>
                      </div>
                    </div>
                    
                    {/* HP & SP */}
                    <div className="grid grid-cols-2 gap-3">
                      <ResourceBar
                        label="HP"
                        current={char.current_hp || char.max_hp}
                        max={char.max_hp}
                        color="red"
                        onChange={(newHP) => handleHPChange(char.id, newHP)}
                        size="sm"
                      />
                      <ResourceBar
                        label="SP"
                        current={char.current_sp || maxSP}
                        max={maxSP}
                        color="violet"
                        onChange={(newSP) => handleSPChange(char.id, newSP)}
                        size="sm"
                      />
                    </div>
                    
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
      </div>
    </div>
  );
}