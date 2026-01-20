import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { ArrowRightLeft, Store, ShoppingCart } from "lucide-react";
import TradingSystem from '@/components/economy/TradingSystem';
import MarketplaceHub from '@/components/economy/MarketplaceHub';
import VendorManager from '@/components/economy/VendorManager';

export default function EconomyPage() {
  const [currentCharacter, setCurrentCharacter] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('currentCharacter');
    if (stored) {
      try {
        setCurrentCharacter(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to load character');
      }
    }
  }, []);

  const { data: characters = [] } = useQuery({
    queryKey: ['characters'],
    queryFn: () => base44.entities.Character.list('-created_date')
  });

  const { data: campaigns = [] } = useQuery({
    queryKey: ['campaigns'],
    queryFn: () => base44.entities.Campaign.list('-created_date')
  });

  const campaign = campaigns.find(c => c.id === currentCharacter?.campaign_id);

  if (!currentCharacter) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-violet-950 p-6">
        <div className="max-w-2xl mx-auto text-center py-12">
          <p className="text-slate-400">Select a character to access economy features</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-violet-950 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">Economy & Trading</h1>

        <Card className="bg-slate-800/50 border-slate-700 mb-6 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Current Character</p>
              <p className="text-white font-semibold">{currentCharacter.name}</p>
            </div>
            <div className="text-right">
              <p className="text-slate-400 text-sm">Credits</p>
              <p className="text-2xl font-bold text-emerald-400">{currentCharacter.credits || 0}</p>
            </div>
          </div>
        </Card>

        <Tabs defaultValue="trading" className="w-full">
          <TabsList className="bg-slate-800 border border-slate-700 grid grid-cols-3">
            <TabsTrigger value="trading">
              <ArrowRightLeft className="h-4 w-4 mr-2" />
              Player Trading
            </TabsTrigger>
            <TabsTrigger value="marketplace">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Marketplace
            </TabsTrigger>
            <TabsTrigger value="vendors">
              <Store className="h-4 w-4 mr-2" />
              Vendors
            </TabsTrigger>
          </TabsList>

          <TabsContent value="trading">
            <TradingSystem
              campaign={campaign}
              currentCharacter={currentCharacter}
              allCharacters={characters.filter(c => c.campaign_id === campaign?.id)}
            />
          </TabsContent>

          <TabsContent value="marketplace">
            <MarketplaceHub
              campaign={campaign}
              currentCharacter={currentCharacter}
            />
          </TabsContent>

          <TabsContent value="vendors">
            <VendorManager
              campaign={campaign}
              isGM={false}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}