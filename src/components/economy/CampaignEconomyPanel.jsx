import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Coins, Users, Sparkles, Store, ArrowRightLeft, TrendingUp } from 'lucide-react';
import CurrencyManager from './CurrencyManager';
import NPCAssetManager from './NPCAssetManager';
import LootGenerator from './LootGenerator';
import VendorManager from './VendorManager';
import TradingSystem from './TradingSystem';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

export default function CampaignEconomyPanel({ campaign, characters, onUpdate, currentCharacter }) {
  const queryClient = useQueryClient();
  const currencies = campaign?.custom_currencies || [{ id: 'credits', name: 'Credits', symbol: '₵', exchange_rate: 1 }];
  const primaryCurrency = currencies[0];

  const totalWealth = characters.reduce((sum, c) => sum + (c.credits || 0), 0);
  const avgWealth = characters.length > 0 ? Math.round(totalWealth / characters.length) : 0;
  const richest = characters.length > 0 ? characters.reduce((a, b) => (a.credits || 0) > (b.credits || 0) ? a : b) : null;

  const adjustCredits = async (charId, name, current) => {
    const amount = prompt(`Adjust ${name}'s credits (use - to subtract):`);
    if (amount !== null && !isNaN(amount)) {
      await base44.entities.Character.update(charId, { credits: Math.max(0, (current || 0) + parseInt(amount)) });
      queryClient.invalidateQueries({ queryKey: ['characters'] });
      toast.success(`${name}'s credits updated`);
    }
  };

  return (
    <div className="space-y-4">
      {/* Economy Overview */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-3 text-center">
          <p className="text-xs text-slate-400 font-mono mb-1">TOTAL WEALTH</p>
          <p className="text-lg font-bold text-emerald-400 font-mono">{primaryCurrency.symbol} {totalWealth.toLocaleString()}</p>
        </div>
        <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-3 text-center">
          <p className="text-xs text-slate-400 font-mono mb-1">AVERAGE</p>
          <p className="text-lg font-bold text-cyan-400 font-mono">{primaryCurrency.symbol} {avgWealth.toLocaleString()}</p>
        </div>
        <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-3 text-center">
          <p className="text-xs text-slate-400 font-mono mb-1">WEALTHIEST</p>
          <p className="text-sm font-bold text-yellow-400 font-mono truncate">{richest?.name || '—'}</p>
        </div>
      </div>

      <Tabs defaultValue="currencies" className="w-full">
        <TabsList className="grid grid-cols-5 bg-slate-800 border border-slate-700 w-full">
          <TabsTrigger value="currencies" className="text-xs"><Coins className="h-3.5 w-3.5 sm:mr-1" /><span className="hidden sm:inline">Currencies</span></TabsTrigger>
          <TabsTrigger value="characters" className="text-xs"><Users className="h-3.5 w-3.5 sm:mr-1" /><span className="hidden sm:inline">Operatives</span></TabsTrigger>
          <TabsTrigger value="npc-assets" className="text-xs"><Store className="h-3.5 w-3.5 sm:mr-1" /><span className="hidden sm:inline">NPCs</span></TabsTrigger>
          <TabsTrigger value="loot" className="text-xs"><Sparkles className="h-3.5 w-3.5 sm:mr-1" /><span className="hidden sm:inline">Loot Gen</span></TabsTrigger>
          <TabsTrigger value="vendors" className="text-xs"><Store className="h-3.5 w-3.5 sm:mr-1" /><span className="hidden sm:inline">Vendors</span></TabsTrigger>
        </TabsList>

        <TabsContent value="currencies" className="mt-3">
          <CurrencyManager campaign={campaign} onUpdate={onUpdate} />
        </TabsContent>

        <TabsContent value="characters" className="mt-3">
          <div className="space-y-2">
            {characters.length === 0 ? (
              <p className="text-center py-8 text-slate-500 text-sm">No characters in this campaign</p>
            ) : (
              characters.map(char => (
                <div key={char.id} className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-2">
                  <div>
                    <p className="text-sm font-semibold text-white">{char.name}</p>
                    <p className="text-xs text-slate-400 font-mono">Lvl {char.level || 1} · Tier {char.tier ?? 0}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono font-bold text-emerald-400">{primaryCurrency.symbol} {(char.credits || 0).toLocaleString()}</span>
                    <Button size="sm" onClick={() => adjustCredits(char.id, char.name, char.credits)} className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs h-7 px-2">
                      Adjust
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="npc-assets" className="mt-3">
          <NPCAssetManager campaign={campaign} onUpdate={onUpdate} />
        </TabsContent>

        <TabsContent value="loot" className="mt-3">
          <LootGenerator campaign={campaign} onAddToShop={(item) => {
            const vendors = campaign?.gm_npcs?.filter(n => n.role?.toLowerCase().includes('vendor') || n.role?.toLowerCase().includes('merchant'));
          }} />
        </TabsContent>

        <TabsContent value="vendors" className="mt-3">
          <VendorManager campaign={campaign} isGM={true} currentCharacter={currentCharacter} />
        </TabsContent>
      </Tabs>
    </div>
  );
}