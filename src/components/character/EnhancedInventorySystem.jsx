import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, Search, Filter, SortAsc, Grid, List, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function EnhancedInventorySystem({ character, onUpdate }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState('grid');

  const inventory = character.inventory || [];

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || item.type === filterType;
    return matchesSearch && matchesType;
  }).sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'type') return (a.type || '').localeCompare(b.type || '');
    if (sortBy === 'recent') return (b.added_at || 0) - (a.added_at || 0);
    return 0;
  });

  const itemTypes = [...new Set(inventory.map(i => i.type).filter(Boolean))];

  const bulkDelete = (rarity) => {
    const updated = inventory.filter(item => item.rarity !== rarity);
    onUpdate({ ...character, inventory: updated });
    toast.success(`Removed all ${rarity} items`);
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Package className="h-5 w-5 text-violet-400" />
            Inventory ({inventory.length} items)
          </CardTitle>
          <div className="flex gap-2">
            <Select onValueChange={bulkDelete}>
              <SelectTrigger className="w-[160px] bg-slate-700 border-slate-600 text-white h-8">
                <Trash2 className="h-3 w-3 mr-2" />
                <span className="text-xs">Bulk Actions</span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="common">Delete All Common</SelectItem>
                <SelectItem value="uncommon">Delete All Uncommon</SelectItem>
                <SelectItem value="consumable">Delete Consumables</SelectItem>
              </SelectContent>
            </Select>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="text-slate-400"
            >
              {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Controls */}
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search items..."
              className="pl-10 bg-slate-700 border-slate-600 text-white"
            />
          </div>

          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[140px] bg-slate-700 border-slate-600 text-white">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {itemTypes.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[140px] bg-slate-700 border-slate-600 text-white">
              <SortAsc className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="type">Type</SelectItem>
              <SelectItem value="recent">Recent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Items Display */}
        <ScrollArea className="h-[500px]">
          {filteredInventory.length > 0 ? (
            <div className={viewMode === 'grid' ? 'grid md:grid-cols-2 gap-3' : 'space-y-2'}>
              {filteredInventory.map((item, i) => (
                <Card key={i} className="bg-slate-700/50 border-slate-600">
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-white">{item.name}</p>
                        <p className="text-xs text-slate-400 mt-1">{item.description}</p>
                        {item.type && (
                          <Badge variant="outline" className="mt-2 text-xs">
                            {item.type}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500">
              <Package className="h-12 w-12 mx-auto mb-2 text-slate-600" />
              <p>No items found</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}