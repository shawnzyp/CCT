import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Package, Coins, Search, ArrowUpDown, Trash2, ShoppingBag, Sparkles } from "lucide-react";

const RARITY_COLORS = {
  common: { border: 'border-slate-500', bg: 'bg-slate-500/10', text: 'text-slate-400' },
  uncommon: { border: 'border-green-500', bg: 'bg-green-500/10', text: 'text-green-400' },
  rare: { border: 'border-blue-500', bg: 'bg-blue-500/10', text: 'text-blue-400' },
  epic: { border: 'border-purple-500', bg: 'bg-purple-500/10', text: 'text-purple-400' },
  legendary: { border: 'border-amber-500', bg: 'bg-amber-500/10', text: 'text-amber-400' }
};

export default function InventoryPanel({ character, onUpdate, onEquip }) {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  
  const inventory = character.inventory || [];
  const gold = character.gold || 0;
  
  const filteredItems = inventory
    .filter(item => item.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'rarity') {
        const rarityOrder = { common: 0, uncommon: 1, rare: 2, epic: 3, legendary: 4 };
        return (rarityOrder[b.rarity] || 0) - (rarityOrder[a.rarity] || 0);
      }
      if (sortBy === 'value') return (b.value || 0) - (a.value || 0);
      return 0;
    });
  
  const handleRemove = (index) => {
    const updated = inventory.filter((_, i) => i !== index);
    onUpdate({ inventory: updated });
  };
  
  const handleEquip = (item, index) => {
    if (item.type === 'consumable' || item.type === 'treasure') return;
    
    const equipment = character.equipment || [];
    equipment.push({ ...item, equipped: true });
    const updated = inventory.filter((_, i) => i !== index);
    
    onEquip({ equipment, inventory: updated });
  };
  
  const totalValue = inventory.reduce((sum, item) => sum + ((item.value || 0) * (item.quantity || 1)), 0);
  
  return (
    <div className="space-y-4">
      {/* Gold Display */}
      <Card className="bg-gradient-to-r from-amber-900/30 to-yellow-900/30 border-amber-500/30">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center">
                <Coins className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="text-sm text-amber-200">Gold</div>
                <div className="text-2xl font-bold text-amber-400">{gold.toLocaleString()}</div>
              </div>
            </div>
            <div className="text-right text-sm text-amber-300">
              <div>Inventory Value</div>
              <div className="font-semibold">{totalValue.toLocaleString()} gp</div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Inventory */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Package className="h-5 w-5 text-violet-400" />
              Inventory ({inventory.length} items)
            </CardTitle>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSortBy(sortBy === 'name' ? 'rarity' : sortBy === 'rarity' ? 'value' : 'name')}
                className="text-slate-400"
              >
                <ArrowUpDown className="h-3 w-3 mr-1" />
                {sortBy}
              </Button>
            </div>
          </div>
          <div className="mt-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search inventory..."
                className="pl-8 bg-slate-900 border-slate-700 text-white"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredItems.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <ShoppingBag className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>{search ? 'No items found' : 'Inventory empty'}</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredItems.map((item, index) => {
                const rarity = RARITY_COLORS[item.rarity] || RARITY_COLORS.common;
                const canEquip = item.type !== 'consumable' && item.type !== 'treasure';
                
                return (
                  <div
                    key={index}
                    className={cn(
                      "p-3 rounded-lg border-2 transition-all",
                      rarity.border, rarity.bg
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-semibold text-white">{item.name}</h4>
                          {item.quantity > 1 && (
                            <Badge variant="outline" className="text-xs">x{item.quantity}</Badge>
                          )}
                          <Badge className={cn("text-xs capitalize", rarity.text)}>
                            {item.rarity}
                          </Badge>
                          <Badge variant="outline" className="text-xs capitalize">
                            {item.type}
                          </Badge>
                        </div>
                        
                        {item.description && (
                          <p className="text-sm text-slate-400 mt-1">{item.description}</p>
                        )}
                        
                        {item.bonus && (
                          <p className="text-xs text-violet-400 mt-1 font-medium">{item.bonus}</p>
                        )}
                        
                        {item.magical_properties?.length > 0 && (
                          <div className="flex items-center gap-1 mt-1 flex-wrap">
                            <Sparkles className="h-3 w-3 text-purple-400" />
                            {item.magical_properties.map((prop, i) => (
                              <Badge key={i} className="bg-purple-500/20 text-purple-300 text-xs">
                                {prop}
                              </Badge>
                            ))}
                          </div>
                        )}
                        
                        {item.value > 0 && (
                          <div className="text-xs text-amber-400 mt-1">
                            <Coins className="h-3 w-3 inline mr-1" />
                            {item.value} gp
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-1">
                        {canEquip && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEquip(item, index)}
                            className="border-violet-500 text-violet-400 hover:bg-violet-500/20"
                          >
                            Equip
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemove(index)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}