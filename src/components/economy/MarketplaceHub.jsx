import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShoppingCart, DollarSign, Package, TrendingUp, Plus as PlusIcon } from "lucide-react";
import { toast } from "sonner";
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import CustomItemCreator from './CustomItemCreator';

export default function MarketplaceHub({ campaign, currentCharacter }) {
  const [showItemCreator, setShowItemCreator] = useState(false);
  const [showListDialog, setShowListDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [listPrice, setListPrice] = useState(0);

  const queryClient = useQueryClient();

  const { data: listings = [] } = useQuery({
    queryKey: ['marketplace', campaign?.id],
    queryFn: () => base44.entities.Marketplace.filter({ campaign_id: campaign.id, status: 'listed' }, '-created_date'),
    enabled: !!campaign
  });

  const createListing = useMutation({
    mutationFn: (data) => base44.entities.Marketplace.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['marketplace']);
      toast.success('Item listed!');
      setShowListDialog(false);
    }
  });

  const buyItem = useMutation({
    mutationFn: async ({ listing, buyer }) => {
      // Update buyer
      await base44.entities.Character.update(buyer.id, {
        inventory: [...(buyer.inventory || []), listing.item],
        credits: buyer.credits - listing.price
      });

      // Update seller
      const seller = await base44.entities.Character.filter({ id: listing.character_id });
      await base44.entities.Character.update(listing.character_id, {
        credits: seller[0].credits + listing.price
      });

      // Mark as sold
      await base44.entities.Marketplace.update(listing.id, {
        status: 'sold',
        buyer_id: buyer.id,
        buyer_name: buyer.name,
        sold_at: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['marketplace']);
      queryClient.invalidateQueries(['character']);
      toast.success('Purchase complete!');
    }
  });

  const listItemForSale = () => {
    if (!selectedItem || listPrice <= 0) {
      toast.error('Select item and set price');
      return;
    }

    // Remove from inventory
    const updatedInventory = (currentCharacter.inventory || []).filter(i => i.name !== selectedItem.name);
    
    base44.entities.Character.update(currentCharacter.id, { inventory: updatedInventory });

    createListing.mutate({
      campaign_id: campaign.id,
      character_id: currentCharacter.id,
      character_name: currentCharacter.name,
      item: selectedItem,
      price: listPrice,
      listed_at: new Date().toISOString()
    });
  };

  const handleBuy = (listing) => {
    if (currentCharacter.credits < listing.price) {
      toast.error('Insufficient credits');
      return;
    }

    buyItem.mutate({ listing, buyer: currentCharacter });
  };

  const myListings = listings.filter(l => l.character_id === currentCharacter?.id);
  const otherListings = listings.filter(l => l.character_id !== currentCharacter?.id);

  const handleCreateCustomItem = (itemData) => {
    // Add to character's inventory
    base44.entities.Character.update(currentCharacter.id, {
      inventory: [...(currentCharacter.inventory || []), itemData]
    }).then(() => {
      toast.success('Custom item created and added to inventory!');
    });
  };

  return (
    <div className="space-y-4">
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-violet-400" />
              Marketplace
            </CardTitle>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowItemCreator(true)}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Create Item
              </Button>
              <Button
                onClick={() => setShowListDialog(true)}
                className="bg-violet-600 hover:bg-violet-700"
              >
                <Package className="h-4 w-4 mr-2" />
                List Item
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <div className="space-y-3">
              {otherListings.map(listing => (
                <Card key={listing.id} className="bg-slate-700/50 border-slate-600">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-white">{listing.item.name}</p>
                        <p className="text-xs text-slate-400 mt-1">{listing.item.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge className="bg-emerald-600">
                            <DollarSign className="h-3 w-3 mr-1" />
                            {listing.price}
                          </Badge>
                          <span className="text-xs text-slate-500">Listed by {listing.character_name}</span>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleBuy(listing)}
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700"
                      >
                        Buy
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {otherListings.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                  <Package className="h-12 w-12 mx-auto mb-2 text-slate-600" />
                  <p>No items for sale</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* List Item Dialog */}
      <Dialog open={showListDialog} onOpenChange={setShowListDialog}>
        <DialogContent className="bg-slate-900 border-2 border-violet-500 text-white">
          <DialogHeader>
            <DialogTitle className="text-violet-400">List Item for Sale</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 uppercase">Select Item</label>
              <Select value={selectedItem?.name} onValueChange={(name) => {
                const item = currentCharacter.inventory.find(i => i.name === name);
                setSelectedItem(item);
              }}>
                <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                  <SelectValue placeholder="Choose item" />
                </SelectTrigger>
                <SelectContent>
                  {(currentCharacter?.inventory || []).map((item, i) => (
                    <SelectItem key={i} value={item.name}>{item.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs text-slate-400 uppercase">Price (Credits)</label>
              <Input
                type="number"
                value={listPrice}
                onChange={(e) => setListPrice(parseInt(e.target.value) || 0)}
                className="bg-slate-800 border-slate-600 text-white"
              />
            </div>

            <Button onClick={listItemForSale} className="w-full bg-violet-600 hover:bg-violet-700">
              <TrendingUp className="h-4 w-4 mr-2" />
              List Item
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Custom Item Creator */}
      <CustomItemCreator
        isOpen={showItemCreator}
        onClose={() => setShowItemCreator(false)}
        onSave={handleCreateCustomItem}
        character={currentCharacter}
      />
    </div>
  );
}