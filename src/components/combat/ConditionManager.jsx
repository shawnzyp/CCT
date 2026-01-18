import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Plus, X } from "lucide-react";

const COMMON_CONDITIONS = [
  { name: 'Stunned', description: 'Cannot take actions' },
  { name: 'Blinded', description: 'Disadvantage on attacks' },
  { name: 'Poisoned', description: 'Taking poison damage' },
  { name: 'Frightened', description: 'Disadvantage, cannot approach source' },
  { name: 'Charmed', description: 'Cannot harm charmer' },
  { name: 'Paralyzed', description: 'Cannot move or act' },
  { name: 'Prone', description: 'Disadvantage on attacks' },
  { name: 'Restrained', description: 'Speed 0, disadvantage on attacks' },
  { name: 'Invisible', description: 'Advantage on attacks' },
  { name: 'Concentrating', description: 'Maintaining a power' }
];

export default function ConditionManager({ character, onUpdate }) {
  const [showPopover, setShowPopover] = useState(false);
  const [customName, setCustomName] = useState('');
  const [duration, setDuration] = useState(1);
  
  const conditions = character.active_conditions || [];
  
  const addCondition = (name, desc = '') => {
    const newCondition = {
      name,
      duration,
      description: desc
    };
    onUpdate([...conditions, newCondition]);
    setShowPopover(false);
    setCustomName('');
    setDuration(1);
  };
  
  const removeCondition = (index) => {
    onUpdate(conditions.filter((_, i) => i !== index));
  };
  
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {conditions.map((condition, index) => (
        <Badge 
          key={index} 
          variant="outline" 
          className="bg-amber-500/20 text-amber-300 border-amber-500/50 pl-2 pr-1"
        >
          {condition.name}
          {condition.duration > 0 && ` (${condition.duration})`}
          <button
            onClick={() => removeCondition(index)}
            className="ml-1 hover:text-white"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
      
      <Popover open={showPopover} onOpenChange={setShowPopover}>
        <PopoverTrigger asChild>
          <Button size="sm" variant="outline" className="h-6 border-slate-600">
            <Plus className="h-3 w-3" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="bg-slate-800 border-slate-700 text-white w-64">
          <div className="space-y-3">
            <div className="text-sm font-medium">Add Condition</div>
            
            <div className="space-y-2">
              <div className="text-xs text-slate-400">Common Conditions</div>
              <div className="grid grid-cols-2 gap-1">
                {COMMON_CONDITIONS.map(cond => (
                  <Button
                    key={cond.name}
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    onClick={() => addCondition(cond.name, cond.description)}
                  >
                    {cond.name}
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="text-xs text-slate-400">Custom</div>
              <Input
                placeholder="Condition name..."
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white h-8 text-sm"
              />
              <div className="flex gap-2">
                <Input
                  type="number"
                  min={1}
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value) || 1)}
                  className="bg-slate-700 border-slate-600 text-white h-8 text-sm w-16"
                  placeholder="Turns"
                />
                <Button
                  size="sm"
                  onClick={() => customName.trim() && addCondition(customName.trim())}
                  disabled={!customName.trim()}
                  className="flex-1 h-8"
                >
                  Add
                </Button>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}