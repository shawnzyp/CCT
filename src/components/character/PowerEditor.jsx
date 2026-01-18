import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { X, Zap, Info } from "lucide-react";

const SP_COSTS = [
  { value: 1, label: '1 SP - Basic attack, minor effect' },
  { value: 2, label: '2 SP - Core ability, status effect' },
  { value: 3, label: '3 SP - AoE, enhanced status, heal' },
  { value: 4, label: '4 SP - Strong AoE, hard crowd control' },
  { value: 5, label: '5 SP - Ultimate (10-turn cooldown)' }
];

const EFFECT_TAGS = [
  { name: 'Burn', desc: '1d4 fire damage at start of next turn' },
  { name: 'Freeze', desc: 'Reduces movement by 10 ft for 1 round' },
  { name: 'Stun', desc: 'Target loses next turn (WIS save)' },
  { name: 'Push/Pull', desc: 'Move target 10-20 ft (STR/DEX save)' },
  { name: 'Weaken', desc: '-2 to attack rolls for 1 round' },
  { name: 'Blind', desc: 'Disadvantage on attacks (CON save)' },
  { name: 'Regen', desc: 'Regain 1d6 SP/HP for 3 turns' },
  { name: 'Shield', desc: 'Temp HP or AC boost until hit' },
  { name: 'Phase', desc: 'Teleport short range or avoid attacks' }
];

const RANGE_OPTIONS = [
  'Melee',
  'Self',
  '15 ft',
  '30 ft',
  '60 ft',
  '30 ft cone',
  '60 ft line',
  '15 ft radius',
  '30 ft radius'
];

const SAVE_TYPES = [
  'STR save',
  'DEX save',
  'CON save',
  'INT save',
  'WIS save',
  'CHA save'
];

export default function PowerEditor({ power, onSave, onClose }) {
  const [data, setData] = useState(power || {
    name: '',
    range: 'Melee',
    effect: '',
    sp_cost: 1,
    saving_throw: '',
    description: '',
    cooldown: 0
  });
  
  const updateData = (field, value) => {
    setData(prev => ({ ...prev, [field]: value }));
    
    // Auto-set cooldown for ultimate powers
    if (field === 'sp_cost' && value === 5) {
      setData(prev => ({ ...prev, [field]: value, cooldown: 10 }));
    }
  };
  
  const isValid = data.name?.trim() && data.effect?.trim();
  
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-violet-400" />
            {power ? 'Edit Power' : 'Create Power'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Power Name */}
          <div>
            <Label className="text-slate-300">Power Name *</Label>
            <Input
              value={data.name}
              onChange={(e) => updateData('name', e.target.value)}
              placeholder="e.g., Shadowstrike, Nova Burst"
              className="bg-slate-800 border-slate-700 text-white mt-1"
            />
          </div>
          
          {/* SP Cost */}
          <div>
            <Label className="text-slate-300">SP Cost *</Label>
            <Select value={String(data.sp_cost)} onValueChange={(v) => updateData('sp_cost', parseInt(v))}>
              <SelectTrigger className="bg-slate-800 border-slate-700 text-white mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SP_COSTS.map(cost => (
                  <SelectItem key={cost.value} value={String(cost.value)}>
                    {cost.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Range */}
          <div>
            <Label className="text-slate-300">Range</Label>
            <Select value={data.range} onValueChange={(v) => updateData('range', v)}>
              <SelectTrigger className="bg-slate-800 border-slate-700 text-white mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RANGE_OPTIONS.map(range => (
                  <SelectItem key={range} value={range}>{range}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Effect */}
          <div>
            <Label className="text-slate-300">Effect *</Label>
            <Textarea
              value={data.effect}
              onChange={(e) => updateData('effect', e.target.value)}
              placeholder="e.g., Deal 2d6 fire damage + Burn effect"
              className="bg-slate-800 border-slate-700 text-white mt-1 h-20"
            />
          </div>
          
          {/* Effect Tags Reference */}
          <div className="bg-slate-800/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
              <Info className="h-3 w-3" />
              Effect Tags Reference
            </div>
            <div className="flex flex-wrap gap-1">
              {EFFECT_TAGS.map(tag => (
                <Badge 
                  key={tag.name}
                  variant="outline"
                  className="text-xs border-slate-600 text-slate-400 cursor-help"
                  title={tag.desc}
                >
                  {tag.name}
                </Badge>
              ))}
            </div>
          </div>
          
          {/* Saving Throw */}
          <div>
            <Label className="text-slate-300">Saving Throw (if applicable)</Label>
            <div className="flex gap-2 mt-1">
              <Select value={data.saving_throw?.split(' ')[0] || ''} onValueChange={(v) => {
                const dc = data.saving_throw?.match(/DC (\d+)/)?.[1] || '13';
                updateData('saving_throw', v ? `${v} save DC ${dc}` : '');
              }}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white flex-1">
                  <SelectValue placeholder="Save type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>None</SelectItem>
                  {['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'].map(stat => (
                    <SelectItem key={stat} value={stat}>{stat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {data.saving_throw && (
                <Input
                  type="number"
                  min={10}
                  max={25}
                  value={data.saving_throw?.match(/DC (\d+)/)?.[1] || 13}
                  onChange={(e) => {
                    const stat = data.saving_throw?.split(' ')[0] || 'DEX';
                    updateData('saving_throw', `${stat} save DC ${e.target.value}`);
                  }}
                  className="bg-slate-800 border-slate-700 text-white w-20"
                  placeholder="DC"
                />
              )}
            </div>
          </div>
          
          {/* Cooldown */}
          {data.sp_cost >= 4 && (
            <div>
              <Label className="text-slate-300">Cooldown (turns)</Label>
              <Input
                type="number"
                min={0}
                max={20}
                value={data.cooldown}
                onChange={(e) => updateData('cooldown', parseInt(e.target.value) || 0)}
                className="bg-slate-800 border-slate-700 text-white mt-1"
              />
              {data.sp_cost === 5 && (
                <p className="text-xs text-amber-400 mt-1">Ultimate powers have a 10-turn cooldown</p>
              )}
            </div>
          )}
          
          {/* Description */}
          <div>
            <Label className="text-slate-300">Description (flavor text)</Label>
            <Textarea
              value={data.description}
              onChange={(e) => updateData('description', e.target.value)}
              placeholder="Describe what this power looks and feels like..."
              className="bg-slate-800 border-slate-700 text-white mt-1 h-20"
            />
          </div>
          
          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
            <Button variant="outline" onClick={onClose} className="border-slate-600 text-slate-300">
              Cancel
            </Button>
            <Button 
              onClick={() => onSave(data)}
              disabled={!isValid}
              className="bg-violet-600 hover:bg-violet-700"
            >
              {power ? 'Update Power' : 'Create Power'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}