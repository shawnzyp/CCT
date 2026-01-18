import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Loader2 } from "lucide-react";

export default function EnemyGenerator({ onGenerate, onClose }) {
  const [generating, setGenerating] = useState(false);
  const [enemyType, setEnemyType] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [count, setCount] = useState(1);
  
  const handleGenerate = async () => {
    setGenerating(true);
    
    const prompt = `Generate ${count} enemy stat block(s) for a Catalyst Core TTRPG combat encounter.
Enemy Type: ${enemyType || 'Random'}
Difficulty: ${difficulty}

For each enemy, provide:
- Name (creative and thematic)
- HP (max_hp between 20-60 based on difficulty)
- TC (Toughness Class, 10-18 based on difficulty)
- Initiative Modifier (between -1 and +3)
- 2-3 attacks/abilities with damage (e.g., "Claw Strike: 2d6 slashing")

Format as a JSON array of enemy objects.`;
    
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            enemies: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  max_hp: { type: "number" },
                  tc: { type: "number" },
                  initiative_modifier: { type: "number" },
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
        position: { x: 0, y: 0 }
      }));
      
      onGenerate(enemies);
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
            <Sparkles className="h-5 w-5 text-violet-400" />
            Generate Enemies
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label>Enemy Type (optional)</Label>
            <Input
              value={enemyType}
              onChange={(e) => setEnemyType(e.target.value)}
              placeholder="e.g., Robot, Mutant, Mercenary..."
              className="bg-slate-800 border-slate-700 text-white mt-1"
            />
          </div>
          
          <div>
            <Label>Difficulty</Label>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger className="bg-slate-800 border-slate-700 text-white mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy (Minion)</SelectItem>
                <SelectItem value="medium">Medium (Standard)</SelectItem>
                <SelectItem value="hard">Hard (Elite)</SelectItem>
                <SelectItem value="boss">Very Hard (Boss)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label>Number of Enemies</Label>
            <Input
              type="number"
              min={1}
              max={10}
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value) || 1)}
              className="bg-slate-800 border-slate-700 text-white mt-1"
            />
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
                  Generate
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}