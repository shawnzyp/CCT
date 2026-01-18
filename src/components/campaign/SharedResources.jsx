import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, Plus, Coins, Trash2, Users } from "lucide-react";

export default function SharedResources({ campaign, onUpdate }) {
  const [showDialog, setShowDialog] = useState(false);
  const [itemData, setItemData] = useState({
    name: '',
    type: 'weapon',
    description: '',
    quantity: 1
  });
  
  const resources = campaign.resources || {};
  const sharedItems = resources.shared_items || [];
  const sharedGold = resources.shared_gold || 0;
  
  const handleAddItem = () => {
    const newItems = [...sharedItems, { ...itemData, id: Date.now().toString() }];
    onUpdate({ 
      resources: { 
        ...resources, 
        shared_items: newItems 
      } 
    });
    setShowDialog(false);
    setItemData({ name: '', type: 'weapon', description: '', quantity: 1 });
  };
  
  const handleRemoveItem = (itemId) => {
    const newItems = sharedItems.filter(item => item.id !== itemId);
    onUpdate({ 
      resources: { 
        ...resources, 
        shared_items: newItems 
      } 
    });
  };
  
  const handleUpdateGold = (amount) => {
    onUpdate({ 
      resources: { 
        ...resources, 
        shared_gold: Math.max(0, (sharedGold || 0) + amount)
      } 
    });
  };
  
  return (
    <div className="space-y-6">
      {/* Shared Gold */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Coins className="h-5 w-5 text-amber-400" />
            Shared Gold
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="text-3xl font-bold text-amber-400">{sharedGold || 0}</div>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                onClick={() => handleUpdateGold(10)}
                className="bg-green-600 hover:bg-green-700"
              >
                +10
              </Button>
              <Button 
                size="sm" 
                onClick={() => handleUpdateGold(50)}
                className="bg-green-600 hover:bg-green-700"
              >
                +50
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleUpdateGold(-10)}
              >
                -10
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Shared Inventory */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Package className="h-5 w-5 text-violet-400" />
              Shared Inventory
            </CardTitle>
            <Button onClick={() => setShowDialog(true)} className="gap-2 bg-violet-600 hover:bg-violet-700">
              <Plus className="h-4 w-4" />
              Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {sharedItems.length > 0 ? (
            <div className="space-y-2">
              {sharedItems.map((item) => (
                <div key={item.id} className="bg-slate-700/50 rounded-lg p-3 flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white">{item.name}</span>
                      <Badge variant="outline" className="text-xs">{item.type}</Badge>
                      {item.quantity > 1 && (
                        <Badge className="text-xs">x{item.quantity}</Badge>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-xs text-slate-400 mt-1">{item.description}</p>
                    )}
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-red-400 hover:text-red-300"
                    onClick={() => handleRemoveItem(item.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 text-center py-8">No shared items yet</p>
          )}
        </CardContent>
      </Card>
      
      {/* Add Item Dialog */}
      {showDialog && (
        <Dialog open onOpenChange={setShowDialog}>
          <DialogContent className="bg-slate-900 border-slate-700 text-white">
            <DialogHeader>
              <DialogTitle>Add Shared Item</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <Input
                placeholder="Item Name"
                value={itemData.name}
                onChange={(e) => setItemData({ ...itemData, name: e.target.value })}
                className="bg-slate-800 border-slate-700"
              />
              
              <Select value={itemData.type} onValueChange={(val) => setItemData({ ...itemData, type: val })}>
                <SelectTrigger className="bg-slate-800 border-slate-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weapon">Weapon</SelectItem>
                  <SelectItem value="armor">Armor</SelectItem>
                  <SelectItem value="gadget">Gadget</SelectItem>
                  <SelectItem value="utility">Utility</SelectItem>
                  <SelectItem value="consumable">Consumable</SelectItem>
                </SelectContent>
              </Select>
              
              <Input
                type="number"
                placeholder="Quantity"
                min={1}
                value={itemData.quantity}
                onChange={(e) => setItemData({ ...itemData, quantity: parseInt(e.target.value) || 1 })}
                className="bg-slate-800 border-slate-700"
              />
              
              <Textarea
                placeholder="Description (optional)"
                value={itemData.description}
                onChange={(e) => setItemData({ ...itemData, description: e.target.value })}
                className="bg-slate-800 border-slate-700 min-h-[80px]"
              />
              
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddItem} className="bg-violet-600 hover:bg-violet-700">
                  Add Item
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}