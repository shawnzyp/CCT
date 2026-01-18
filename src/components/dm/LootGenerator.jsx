import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Package, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function LootGenerator() {
  const [generating, setGenerating] = useState(false);
  const [lootTable, setLootTable] = useState([]);
  const [params, setParams] = useState({
    tier: 'common',
    count: 3,
    context: ''
  });

  const tiers = {
    common: 'Common (Tier 5)',
    uncommon: 'Uncommon (Tier 3-4)',
    rare: 'Rare (Tier 2-3)',
    epic: 'Epic (Tier 1-2)',
    legendary: 'Legendary (Tier 0-1)'
  };

  const handleGenerate = async () => {
    setGenerating(true);
    
    const prompt = `Generate ${params.count} loot items for a Catalyst Core superhero TTRPG.

Tier: ${tiers[params.tier]}
${params.context ? `Context: ${params.context}` : ''}

Create items that fit the superhero vigilante theme:
- Gadgets and tech devices
- Advanced equipment
- Prototype weapons
- Utility items
- Consumables

For each item include:
- Name
- Type (weapon/armor/gadget/utility/consumable)
- Rarity (${params.tier})
- Description (what it does)
- Game effect or bonus
- Value in gold`;

    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            items: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  type: { type: "string" },
                  rarity: { type: "string" },
                  description: { type: "string" },
                  effect: { type: "string" },
                  value: { type: "number" }
                }
              }
            }
          }
        }
      });
      
      setLootTable(result.items || []);
      toast.success(`${result.items?.length || 0} items generated!`);
    } catch (error) {
      toast.error('Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const handleQuickRoll = (tier) => {
    setParams({ ...params, tier });
    setTimeout(() => handleGenerate(), 100);
  };

  const rarityColors = {
    common: 'bg-slate-500/20 text-slate-400 border-slate-500',
    uncommon: 'bg-green-500/20 text-green-400 border-green-500',
    rare: 'bg-blue-500/20 text-blue-400 border-blue-500',
    epic: 'bg-purple-500/20 text-purple-400 border-purple-500',
    legendary: 'bg-amber-500/20 text-amber-400 border-amber-500'
  };

  return (
    <div className="space-y-4">
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">AI Loot Generator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {Object.entries(tiers).map(([key, label]) => (
              <Button
                key={key}
                onClick={() => handleQuickRoll(key)}
                variant="outline"
                className="h-auto py-3 px-2 border-violet-500 hover:bg-violet-500/20"
                disabled={generating}
              >
                <div className="text-center">
                  <Package className="h-4 w-4 mx-auto mb-1 text-violet-400" />
                  <div className="text-xs text-white">{label}</div>
                </div>
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-slate-400 mb-2 block">Rarity Tier</label>
              <Select value={params.tier} onValueChange={(val) => setParams({ ...params, tier: val })}>
                <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(tiers).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-slate-400 mb-2 block">Number of Items</label>
              <Input
                type="number"
                min={1}
                max={10}
                value={params.count}
                onChange={(e) => setParams({ ...params, count: parseInt(e.target.value) || 1 })}
                className="bg-slate-900 border-slate-700 text-white"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-slate-400 mb-2 block">Context (optional)</label>
            <Input
              value={params.context}
              onChange={(e) => setParams({ ...params, context: e.target.value })}
              placeholder="e.g., 'Tech lab heist', 'Corporate espionage', 'Alien technology'"
              className="bg-slate-900 border-slate-700 text-white"
            />
          </div>

          <Button 
            onClick={handleGenerate}
            disabled={generating}
            className="w-full bg-violet-600 hover:bg-violet-700 gap-2"
          >
            {generating ? (
              <><Loader2 className="h-4 w-4 animate-spin" />Generating...</>
            ) : (
              <><Sparkles className="h-4 w-4" />Generate Loot</>
            )}
          </Button>
        </CardContent>
      </Card>

      {lootTable.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Generated Loot ({lootTable.length})</h3>
            <Button size="sm" variant="outline" onClick={() => setLootTable([])} className="gap-2">
              <Trash2 className="h-3 w-3" />
              Clear
            </Button>
          </div>
          
          {lootTable.map((item, i) => {
            const colorClass = rarityColors[item.rarity.toLowerCase()] || rarityColors.common;
            
            return (
              <Card key={i} className={`bg-slate-800/50 border-2 ${colorClass}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="text-lg font-semibold text-white">{item.name}</h4>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="outline" className="text-xs capitalize">{item.type}</Badge>
                        <Badge className={`text-xs ${colorClass}`}>{item.rarity}</Badge>
                      </div>
                    </div>
                    <div className="text-amber-400 font-bold text-lg">{item.value} gold</div>
                  </div>
                  
                  <p className="text-sm text-slate-300 mb-2">{item.description}</p>
                  
                  <div className="bg-slate-900/50 rounded p-2 mt-2">
                    <div className="text-xs font-semibold text-violet-400 uppercase mb-1">Effect</div>
                    <p className="text-sm text-slate-300">{item.effect}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}