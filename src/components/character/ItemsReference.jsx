import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, ShoppingBag } from "lucide-react";
import { ALL_ITEMS, TIER_INFO, filterItemsByTier, filterItemsByCategory } from '../data/ItemsDatabase';

export default function ItemsReference() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTier, setSelectedTier] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredItems = ALL_ITEMS.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.perk.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTier = selectedTier === 'all' || item.tier === selectedTier;
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    
    return matchesSearch && matchesTier && matchesCategory;
  });

  const getTierColor = (tier) => {
    const colors = {
      T5: 'bg-slate-600',
      T4: 'bg-green-600',
      T3: 'bg-blue-600',
      T2: 'bg-purple-600',
      T1: 'bg-orange-600',
      T0: 'bg-red-600'
    };
    return colors[tier] || 'bg-slate-600';
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <ShoppingBag className="h-5 w-5 text-violet-400" />
          Items Reference
        </CardTitle>
        <p className="text-xs text-slate-400">Complete catalog of all equipment (300 items)</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search items..."
              className="bg-slate-900 border-slate-600 text-white pl-10"
            />
          </div>
          <Select value={selectedTier} onValueChange={setSelectedTier}>
            <SelectTrigger className="w-32 bg-slate-900 border-slate-600 text-white">
              <SelectValue placeholder="Tier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tiers</SelectItem>
              <SelectItem value="T5">T5</SelectItem>
              <SelectItem value="T4">T4</SelectItem>
              <SelectItem value="T3">T3</SelectItem>
              <SelectItem value="T2">T2</SelectItem>
              <SelectItem value="T1">T1</SelectItem>
              <SelectItem value="T0">T0</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-40 bg-slate-900 border-slate-600 text-white">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="useful">Useful Items</SelectItem>
              <SelectItem value="gear">Gear</SelectItem>
              <SelectItem value="catalyst">Catalyst Items</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results */}
        <div className="text-sm text-slate-400 mb-2">
          {filteredItems.length} items found
        </div>

        <ScrollArea className="h-[600px]">
          <div className="space-y-2">
            {filteredItems.map((item, idx) => (
              <Card key={idx} className="bg-slate-900 border-slate-700">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="font-semibold text-white">{item.name}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={`${getTierColor(item.tier)} text-white text-xs`}>
                          {item.tier}
                        </Badge>
                        {item.type && (
                          <Badge variant="outline" className="text-xs">
                            {item.type}
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs capitalize">
                          {item.category}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-green-400 font-mono font-semibold">
                        {item.price.toLocaleString()} Cr
                      </div>
                      <div className="text-xs text-slate-500">
                        {item.attunement}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-slate-300 mt-2">
                    <span className="text-violet-400">Perk:</span> {item.perk}
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredItems.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                No items found matching your criteria
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}