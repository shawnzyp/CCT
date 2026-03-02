import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Loader2, Package, Coins, Copy, ShoppingCart } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const RARITY_COLORS = {
  common: '#9CA3AF',
  uncommon: '#34D399',
  rare: '#60A5FA',
  epic: '#A78BFA',
  legendary: '#F59E0B',
};

export default function LootGenerator({ campaign, onAddToShop }) {
  const [generating, setGenerating] = useState(false);
  const [loot, setLoot] = useState([]);
  const [context, setContext] = useState('');
  const [tier, setTier] = useState('2');

  const generate = async () => {
    setGenerating(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate a loot table for a Tier ${tier} encounter in the campaign "${campaign?.name || 'superhero campaign'}".
Context: ${context || 'standard urban superhero setting'}
Campaign currency: ${campaign?.custom_currencies?.[0]?.name || 'Credits'} (symbol: ${campaign?.custom_currencies?.[0]?.symbol || '₵'})

Generate 6-8 items appropriate for the tier. Mix consumables, equipment, and special items.
Prices should reflect the tier (Tier 1 = 50-200, Tier 2 = 200-800, Tier 3 = 500-2000, Tier 4 = 1500-5000, Tier 5 = 5000+).`,
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
                  rarity: { type: "string", enum: ["common", "uncommon", "rare", "epic", "legendary"] },
                  description: { type: "string" },
                  price: { type: "number" },
                  quantity: { type: "number" },
                  effect: { type: "string" }
                }
              }
            },
            total_credits: { type: "number" },
            narrative_context: { type: "string" }
          }
        }
      });

      setLoot(result.items || []);
      toast.success(`Generated ${result.items?.length || 0} items!`);
    } catch {
      toast.error('Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const copyItem = (item) => {
    navigator.clipboard.writeText(`${item.name} (${item.rarity}) - ${item.price} ₵\n${item.description}\n${item.effect || ''}`);
    toast.success('Copied to clipboard');
  };

  const currencySymbol = campaign?.custom_currencies?.[0]?.symbol || '₵';

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-slate-700 bg-slate-800/40 p-4 space-y-3">
        <h3 className="text-sm font-mono font-semibold text-slate-200 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-yellow-400" /> AI Loot Generator
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-400 uppercase">Encounter Tier</label>
            <Select value={tier} onValueChange={setTier}>
              <SelectTrigger className="bg-slate-800 border-slate-600 text-white mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                {[1,2,3,4,5].map(t => (
                  <SelectItem key={t} value={String(t)} className="text-white">Tier {t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs text-slate-400 uppercase">Context (optional)</label>
            <Input value={context} onChange={e => setContext(e.target.value)} className="bg-slate-800 border-slate-600 text-white mt-1 text-xs" placeholder="e.g., defeated tech villain" />
          </div>
        </div>
        <Button onClick={generate} disabled={generating} className="w-full bg-yellow-600 hover:bg-yellow-700 text-black font-semibold">
          {generating ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating...</> : <><Sparkles className="h-4 w-4 mr-2" /> Generate Loot Table</>}
        </Button>
      </div>

      {loot.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-mono uppercase text-slate-400 tracking-wider">Generated Items</h4>
          {loot.map((item, i) => (
            <div key={i} className="rounded-lg border bg-slate-800/60 p-3" style={{ borderColor: RARITY_COLORS[item.rarity] + '40' }}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-white">{item.name}</p>
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold" style={{ color: RARITY_COLORS[item.rarity], background: RARITY_COLORS[item.rarity] + '20', border: `1px solid ${RARITY_COLORS[item.rarity]}40` }}>
                      {item.rarity}
                    </span>
                    <span className="text-[10px] text-slate-500">{item.type}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{item.description}</p>
                  {item.effect && <p className="text-xs text-cyan-400 mt-1 italic">{item.effect}</p>}
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span className="text-sm font-mono font-bold text-emerald-400">{currencySymbol} {item.price?.toLocaleString()}</span>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => copyItem(item)} className="h-6 w-6 p-0 text-slate-400 hover:text-white">
                      <Copy className="h-3 w-3" />
                    </Button>
                    {onAddToShop && (
                      <Button size="sm" variant="ghost" onClick={() => { onAddToShop(item); toast.success('Added to shop'); }} className="h-6 w-6 p-0 text-cyan-400 hover:text-cyan-300">
                        <ShoppingCart className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          <div className="flex items-center justify-between pt-1 border-t border-slate-700">
            <span className="text-xs text-slate-400 font-mono">Total loot value</span>
            <span className="text-sm font-mono font-bold text-emerald-400">{currencySymbol} {loot.reduce((s, i) => s + (i.price * (i.quantity || 1)), 0).toLocaleString()}</span>
          </div>
        </div>
      )}
    </div>
  );
}