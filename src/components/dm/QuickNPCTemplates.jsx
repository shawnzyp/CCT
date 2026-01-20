import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users, Zap } from "lucide-react";
import { toast } from "sonner";

const NPC_TEMPLATES = [
  {
    name: 'Street Thug',
    hp: 25,
    tc: 12,
    attacks: ['Punch: +3 to hit, 1d6+2 damage'],
    abilities: ['Intimidate']
  },
  {
    name: 'Elite Guard',
    hp: 45,
    tc: 15,
    attacks: ['Rifle: +5 to hit, 2d6+3 damage', 'Tactical Strike: +4 to hit, 1d8+2'],
    abilities: ['Tactical Position', 'Cover Bonus']
  },
  {
    name: 'Powered Villain',
    hp: 80,
    tc: 17,
    attacks: ['Energy Blast: +6 to hit, 3d6 damage', 'Power Strike: +5 to hit, 2d8+4'],
    abilities: ['Flight', 'Energy Shield', 'Power Surge']
  },
  {
    name: 'Minion Swarm',
    hp: 15,
    tc: 10,
    attacks: ['Mob Attack: +2 to hit, 1d4+1 damage'],
    abilities: ['Swarm Tactics']
  },
  {
    name: 'Tech Specialist',
    hp: 35,
    tc: 13,
    attacks: ['Laser Pistol: +4 to hit, 1d10+2 damage'],
    abilities: ['Hack', 'Deploy Drone', 'EMP Pulse']
  }
];

export default function QuickNPCTemplates({ onSelect }) {
  const selectTemplate = (template) => {
    const npc = {
      ...template,
      id: `npc_${Date.now()}`,
      max_hp: template.hp,
      initiative_modifier: 0,
      position: { x: 0, y: 0 }
    };
    onSelect(npc);
    toast.success(`${template.name} added!`);
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white text-sm flex items-center gap-2">
          <Zap className="h-4 w-4 text-violet-400" />
          Quick NPC Templates
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          <div className="space-y-2">
            {NPC_TEMPLATES.map((template, i) => (
              <Card key={i} className="bg-slate-700/50 border-slate-600 hover:border-violet-500 transition-colors cursor-pointer"
                onClick={() => selectTemplate(template)}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-white">{template.name}</span>
                    <div className="flex gap-2 text-xs text-slate-400">
                      <span>HP: {template.hp}</span>
                      <span>TC: {template.tc}</span>
                    </div>
                  </div>
                  <div className="text-xs text-slate-500">
                    {template.abilities.join(', ')}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}