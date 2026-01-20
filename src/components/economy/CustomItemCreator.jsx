import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";

export default function CustomItemCreator({ isOpen, onClose, onSave, character }) {
  const [itemForm, setItemForm] = useState({
    name: '',
    description: '',
    type: 'weapon',
    rarity: 'common',
    weight: 0,
    value: 0,
    bonuses: [],
    properties: []
  });

  const [bonusType, setBonusType] = useState('');
  const [bonusValue, setBonusValue] = useState('');
  const [propertyInput, setPropertyInput] = useState('');

  const addBonus = () => {
    if (bonusType && bonusValue) {
      setItemForm({
        ...itemForm,
        bonuses: [...itemForm.bonuses, { type: bonusType, value: bonusValue }]
      });
      setBonusType('');
      setBonusValue('');
    }
  };

  const removeBonus = (index) => {
    setItemForm({
      ...itemForm,
      bonuses: itemForm.bonuses.filter((_, i) => i !== index)
    });
  };

  const addProperty = () => {
    if (propertyInput) {
      setItemForm({
        ...itemForm,
        properties: [...itemForm.properties, propertyInput]
      });
      setPropertyInput('');
    }
  };

  const removeProperty = (index) => {
    setItemForm({
      ...itemForm,
      properties: itemForm.properties.filter((_, i) => i !== index)
    });
  };

  const handleSave = () => {
    if (!itemForm.name) {
      toast.error('Item name required');
      return;
    }

    onSave(itemForm);
    setItemForm({
      name: '',
      description: '',
      type: 'weapon',
      rarity: 'common',
      weight: 0,
      value: 0,
      bonuses: [],
      properties: []
    });
    onClose();
  };

  const rarityColors = {
    common: 'bg-slate-600',
    uncommon: 'bg-emerald-600',
    rare: 'bg-blue-600',
    epic: 'bg-purple-600',
    legendary: 'bg-amber-600'
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-2 border-violet-500 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-violet-400">Create Custom Item</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400 uppercase">Item Name</label>
              <Input
                value={itemForm.name}
                onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                placeholder="e.g., Plasma Blade"
                className="bg-slate-800 border-slate-600 text-white"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 uppercase">Type</label>
              <Select value={itemForm.type} onValueChange={(v) => setItemForm({ ...itemForm, type: v })}>
                <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weapon">Weapon</SelectItem>
                  <SelectItem value="armor">Armor</SelectItem>
                  <SelectItem value="utility">Utility</SelectItem>
                  <SelectItem value="consumable">Consumable</SelectItem>
                  <SelectItem value="accessory">Accessory</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 uppercase">Description</label>
            <Textarea
              value={itemForm.description}
              onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
              placeholder="Describe the item..."
              className="bg-slate-800 border-slate-600 text-white h-20"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-slate-400 uppercase">Rarity</label>
              <Select value={itemForm.rarity} onValueChange={(v) => setItemForm({ ...itemForm, rarity: v })}>
                <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="common">Common</SelectItem>
                  <SelectItem value="uncommon">Uncommon</SelectItem>
                  <SelectItem value="rare">Rare</SelectItem>
                  <SelectItem value="epic">Epic</SelectItem>
                  <SelectItem value="legendary">Legendary</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs text-slate-400 uppercase">Weight (lbs)</label>
              <Input
                type="number"
                value={itemForm.weight}
                onChange={(e) => setItemForm({ ...itemForm, weight: parseFloat(e.target.value) || 0 })}
                className="bg-slate-800 border-slate-600 text-white"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 uppercase">Value (CR)</label>
              <Input
                type="number"
                value={itemForm.value}
                onChange={(e) => setItemForm({ ...itemForm, value: parseInt(e.target.value) || 0 })}
                className="bg-slate-800 border-slate-600 text-white"
              />
            </div>
          </div>

          {/* Bonuses */}
          <div>
            <label className="text-xs text-slate-400 uppercase mb-2 block">Stat Bonuses</label>
            <div className="flex gap-2 mb-2">
              <Select value={bonusType} onValueChange={setBonusType}>
                <SelectTrigger className="bg-slate-800 border-slate-600 text-white flex-1">
                  <SelectValue placeholder="Bonus type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="STR">+STR</SelectItem>
                  <SelectItem value="DEX">+DEX</SelectItem>
                  <SelectItem value="CON">+CON</SelectItem>
                  <SelectItem value="INT">+INT</SelectItem>
                  <SelectItem value="WIS">+WIS</SelectItem>
                  <SelectItem value="CHA">+CHA</SelectItem>
                  <SelectItem value="TC">+TC (Toughness Class)</SelectItem>
                  <SelectItem value="HP">+Max HP</SelectItem>
                  <SelectItem value="damage">+Damage</SelectItem>
                  <SelectItem value="attack">+Attack Roll</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="number"
                value={bonusValue}
                onChange={(e) => setBonusValue(e.target.value)}
                placeholder="Amount"
                className="bg-slate-800 border-slate-600 text-white w-24"
              />
              <Button onClick={addBonus} size="icon" className="bg-violet-600 hover:bg-violet-700">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {itemForm.bonuses.map((bonus, i) => (
                <Badge key={i} className="bg-emerald-600 text-white gap-2">
                  +{bonus.value} {bonus.type}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => removeBonus(i)} />
                </Badge>
              ))}
            </div>
          </div>

          {/* Properties */}
          <div>
            <label className="text-xs text-slate-400 uppercase mb-2 block">Special Properties</label>
            <div className="flex gap-2 mb-2">
              <Input
                value={propertyInput}
                onChange={(e) => setPropertyInput(e.target.value)}
                placeholder="e.g., Throwable, Two-Handed, Stealth"
                className="bg-slate-800 border-slate-600 text-white flex-1"
              />
              <Button onClick={addProperty} size="icon" className="bg-violet-600 hover:bg-violet-700">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {itemForm.properties.map((prop, i) => (
                <Badge key={i} className="bg-violet-600 text-white gap-2">
                  {prop}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => removeProperty(i)} />
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={onClose} variant="outline" className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSave} className="flex-1 bg-violet-600 hover:bg-violet-700">
              Create Item
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}