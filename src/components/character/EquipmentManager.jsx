import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Package, Plus, Trash2, Check, Shield, Zap, Wrench, Briefcase } from "lucide-react";

const EQUIPMENT_TYPES = [
  { value: 'weapon', label: 'Weapon', icon: Zap },
  { value: 'armor', label: 'Armor', icon: Shield },
  { value: 'gadget', label: 'Gadget', icon: Wrench },
  { value: 'utility', label: 'Utility', icon: Briefcase }
];

export default function EquipmentManager({ character, onUpdate }) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    type: 'weapon',
    description: '',
    bonus: '',
    equipped: false
  });
  
  const equipment = character.equipment || [];
  const maxSlots = 5 + Math.floor((character.level || 1) / 3);
  
  const handleAdd = () => {
    if (!newItem.name.trim()) return;
    
    onUpdate([...equipment, { ...newItem }]);
    setNewItem({ name: '', type: 'weapon', description: '', bonus: '', equipped: false });
    setShowAddDialog(false);
  };
  
  const handleToggleEquip = (index) => {
    const updated = [...equipment];
    updated[index].equipped = !updated[index].equipped;
    onUpdate(updated);
  };
  
  const handleRemove = (index) => {
    onUpdate(equipment.filter((_, i) => i !== index));
  };
  
  return (
    <>
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Package className="h-5 w-5 text-violet-400" />
              Equipment & Gear
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-slate-400">
                {equipment.length} / {maxSlots}
              </Badge>
              <Button
                size="sm"
                onClick={() => setShowAddDialog(true)}
                disabled={equipment.length >= maxSlots}
                className="bg-violet-600 hover:bg-violet-700"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {equipment.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No equipment yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {equipment.map((item, index) => {
                const TypeIcon = EQUIPMENT_TYPES.find(t => t.value === item.type)?.icon || Package;
                return (
                  <div
                    key={index}
                    className={cn(
                      "p-3 rounded-lg border-2 transition-all",
                      item.equipped
                        ? "border-violet-500 bg-violet-500/10"
                        : "border-slate-700 bg-slate-800/50"
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center",
                          item.equipped ? "bg-violet-500" : "bg-slate-700"
                        )}>
                          <TypeIcon className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-white">{item.name}</h4>
                            <Badge variant="outline" className="text-xs">
                              {EQUIPMENT_TYPES.find(t => t.value === item.type)?.label}
                            </Badge>
                            {item.equipped && (
                              <Check className="h-4 w-4 text-violet-400" />
                            )}
                          </div>
                          {item.description && (
                            <p className="text-sm text-slate-400 mt-1">{item.description}</p>
                          )}
                          {item.bonus && (
                            <p className="text-xs text-violet-400 mt-1 font-medium">{item.bonus}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleToggleEquip(index)}
                          className="text-slate-400 hover:text-white"
                        >
                          {item.equipped ? 'Unequip' : 'Equip'}
                        </Button>
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
      
      {showAddDialog && (
        <Dialog open onOpenChange={setShowAddDialog}>
          <DialogContent className="bg-slate-900 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-white">Add Equipment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-slate-300">Name</Label>
                <Input
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  placeholder="e.g., Reinforced Gauntlets"
                  className="bg-slate-800 border-slate-700 text-white mt-1"
                />
              </div>
              <div>
                <Label className="text-slate-300">Type</Label>
                <Select value={newItem.type} onValueChange={(v) => setNewItem({ ...newItem, type: v })}>
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EQUIPMENT_TYPES.map(t => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-slate-300">Description</Label>
                <Textarea
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  placeholder="Describe the item..."
                  className="bg-slate-800 border-slate-700 text-white mt-1"
                />
              </div>
              <div>
                <Label className="text-slate-300">Bonus/Effect</Label>
                <Input
                  value={newItem.bonus}
                  onChange={(e) => setNewItem({ ...newItem, bonus: e.target.value })}
                  placeholder="e.g., +2 to melee attacks"
                  className="bg-slate-800 border-slate-700 text-white mt-1"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowAddDialog(false)}
                  className="flex-1 border-slate-600"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAdd}
                  className="flex-1 bg-violet-600 hover:bg-violet-700"
                >
                  Add Item
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}