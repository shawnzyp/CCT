import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dices, Loader2, Sparkles } from "lucide-react";

const encounterSettings = {
  urban: ['Muggers', 'Gang Members', 'Corrupt Police', 'Street Thugs'],
  cosmic: ['Alien Scouts', 'Dimensional Beings', 'Space Pirates', 'Energy Entities'],
  mystical: ['Dark Cultists', 'Possessed Civilians', 'Shadow Creatures', 'Magical Constructs'],
  technological: ['Security Drones', 'Rogue Robots', 'Cyber-Enhanced Mercenaries', 'AI Defense Systems']
};

export default function RandomEncounterGenerator({ characters = [], onGenerate, onClose }) {
  const [generating, setGenerating] = useState(false);
  const [setting, setSetting] = useState('urban');
  const [difficulty, setDifficulty] = useState('balanced');
  
  const avgLevel = characters.length > 0 
    ? Math.round(characters.reduce((sum, c) => sum + (c.level || 1), 0) / characters.length)
    : 1;
  
  const handleGenerate = async () => {
    setGenerating(true);
    
    const enemyTypes = encounterSettings[setting];
    const randomType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
    
    // Calculate enemy count based on difficulty
    let enemyCount;
    if (difficulty === 'easy') {
      enemyCount = Math.max(1, characters.length - 1);
    } else if (difficulty === 'hard') {
      enemyCount = characters.length + 2;
    } else {
      enemyCount = characters.length;
    }
    
    // Calculate stats based on character level
    const baseHP = 20 + (avgLevel * 8);
    const baseTC = 10 + avgLevel;
    const baseAttackBonus = Math.floor(avgLevel / 2) + 1;
    
    const hpModifier = difficulty === 'easy' ? 0.7 : difficulty === 'hard' ? 1.3 : 1.0;
    
    const prompt = `Generate a random combat encounter for a Catalyst Core TTRPG game.

Setting: ${setting}
Enemy Type: ${randomType}
Party Level: ${avgLevel}
Number of Enemies: ${enemyCount}
Difficulty: ${difficulty}

Create ${enemyCount} unique enemies. Each should have:
- Creative thematic name
- HP around ${Math.round(baseHP * hpModifier)} (vary by ±20%)
- TC around ${baseTC} (vary by ±2)
- Initiative modifier between ${Math.max(0, baseAttackBonus - 1)} and ${baseAttackBonus + 1}
- 2-3 thematic attacks/abilities with damage notation (e.g., "Energy Blast: 2d6+${baseAttackBonus} energy damage")
- Attack bonus of ${baseAttackBonus}

Make each enemy feel unique with different abilities.`;
    
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            encounter_name: { type: "string" },
            encounter_description: { type: "string" },
            enemies: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  max_hp: { type: "number" },
                  tc: { type: "number" },
                  initiative_modifier: { type: "number" },
                  attack_bonus: { type: "number" },
                  attacks: { 
                    type: "array",
                    items: { type: "string" }
                  }
                }
              }
            }
          }
        }
      });
      
      const enemies = result.enemies.map(enemy => ({
        ...enemy,
        hp: enemy.max_hp,
        abilities: enemy.attacks || [],
        position: { 
          x: Math.floor(Math.random() * 8), 
          y: Math.floor(Math.random() * 8) 
        }
      }));
      
      onGenerate({ 
        enemies, 
        name: result.encounter_name,
        description: result.encounter_description 
      });
      onClose();
    } catch (error) {
      console.error('Generation failed:', error);
    } finally {
      setGenerating(false);
    }
  };
  
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Dices className="h-5 w-5 text-violet-400" />
            Random Encounter Generator
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <div className="text-sm text-slate-400 mb-2">
              Party Size: {characters.length} | Avg Level: {avgLevel}
            </div>
          </div>
          
          <div>
            <label className="text-sm text-slate-300 mb-2 block">Setting</label>
            <Select value={setting} onValueChange={setSetting}>
              <SelectTrigger className="bg-slate-800 border-slate-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="urban">Urban (Thugs, Gangs)</SelectItem>
                <SelectItem value="cosmic">Cosmic (Aliens, Entities)</SelectItem>
                <SelectItem value="mystical">Mystical (Cultists, Creatures)</SelectItem>
                <SelectItem value="technological">Tech (Robots, Drones)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm text-slate-300 mb-2 block">Difficulty</label>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger className="bg-slate-800 border-slate-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy (Training Fight)</SelectItem>
                <SelectItem value="balanced">Balanced (Fair Challenge)</SelectItem>
                <SelectItem value="hard">Hard (Tough Fight)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={onClose} disabled={generating}>
              Cancel
            </Button>
            <Button 
              onClick={handleGenerate}
              disabled={generating}
              className="bg-violet-600 hover:bg-violet-700 gap-2"
            >
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate Encounter
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}